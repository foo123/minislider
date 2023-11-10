/**
*  minislider.js
*  Optimized mini slider (up to 10 slides) for Desktop and Mobile
*  @VERSION: 1.0.0
*
*  https://github.com/foo123/minislider
*
**/
(function(root) {
"use strict";

var stdMath = Math, forEach = Array.prototype.forEach;

function hasEventOptions()
{
    if (null == hasEventOptions.passiveSupported)
    {
        var options = {};
        try {
            Object.defineProperty(options, 'passive', {
                get: function(){
                    hasEventOptions.passiveSupported = true;
                    return false;
                }
            });
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch(e) {
            hasEventOptions.passiveSupported = false;
        }
    }
    return hasEventOptions.passiveSupported;
}
function addEvent(target, event, handler, options)
{
    if (target.attachEvent) target.attachEvent('on' + event, handler);
    else target.addEventListener(event, handler, hasEventOptions() ? options : ('object' === typeof options ? !!options.capture : !!options));
}
function removeEvent(target, event, handler, options)
{
    if (target.detachEvent) target.detachEvent('on' + event, handler);
    else target.removeEventListener(event, handler, hasEventOptions() ? options : ('object' === typeof options ? !!options.capture : !!options));
}

function get_slide(slider)
{
    return slider ? ((+slider.getAttribute('data-slide')) || 0) : 0;
}
function set_slide(slider, index)
{
    if (slider) slider.setAttribute('data-slide', index || 0);
}
function get_swipe(slider)
{
    return slider ? (parseFloat(window.getComputedStyle(slider.parentNode).getPropertyValue('--swipe')) || 400) : 400;
}
function move_slider(slider, amount)
{
    if (slider) slider.style['left'] = amount;
}
function get_bullets(slider)
{
    var bullets = slider ? slider.parentNode.querySelector('.bullets') : null;
    return bullets && (bullets.parentNode === slider.parentNode) ? bullets : null;
}
function active_bullet(slider, index)
{
    if (slider)
    {
        var bullets = get_bullets(slider);
        if (bullets)
        {
            forEach.call(bullets.children, function(b) {
                b.classList.remove('current-slide');
            });
            if (index < bullets.children.length) bullets.children[index].classList.add('current-slide');
        }
    }
}
function revert(slider, index, t)
{
    if (slider)
    {
        slider.classList.add('swipe');
        slider.style['transition-duration'] = String((t||0)*get_swipe(slider))+'ms';
        move_slider(slider, String(-index * 100)+'%');
    }
}
function goTo(slider, index, t)
{
    if (slider)
    {
        set_slide(slider, index);
        active_bullet(slider, index);
        slider.classList.add('swipe');
        slider.style['transition-duration'] = String((1-(t||0))*get_swipe(slider))+'ms';
        move_slider(slider, String(-index * 100)+'%');
    }
}
function minislider(sliders)
{
    var self = this;
    if (!(self instanceof minislider)) return new minislider(sliders);

    var startX, endX, slider, N, W, offset = 16,
        isTouch, isClick, notClick = function() {isClick = false},
        clickDelay = 120, timer;

    var move = function move(evt) {
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        endX = (evt.touches && evt.touches.length ? evt.touches[0].pageX : evt.pageX);
        var dx = endX - startX, index = get_slide(slider);
        if ((0 > dx && N > index+1) || (0 < dx && 0 <= index-1))
        {
            move_slider(slider, String(-index*W + dx)+'px');
        }
    };
    var release = function release(evt) {
        clearTimeout(timer);
        if (isTouch)
        {
            removeEvent(document, 'touchmove', move, {passive:false,capture:false});
            removeEvent(document, 'touchend', release, {passive:false,capture:false});
            removeEvent(document, 'touchcancel', release, {passive:false,capture:false});
        }
        else
        {
            removeEvent(window, 'mousemove', move, {passive:false,capture:false});
            removeEvent(window, 'mouseup', release, {passive:false,capture:false});
        }
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        var dx = endX - startX, index = get_slide(slider);
        if (0 > dx)
        {
            dx = stdMath.abs(dx);
            if (N > index+1)
            {
                if (dx >= offset)
                {
                    goTo(slider, ++index, dx/W)
                }
                else
                {
                    revert(slider, index, dx/W);
                }
            }
        }
        else if (0 < dx)
        {
            dx = stdMath.abs(dx);
            if (0 <= index-1)
            {
                if (dx >= offset)
                {
                    goTo(slider, --index, dx/W);
                }
                else
                {
                    revert(slider, index, dx/W);
                }
            }
        }
        else
        {
            revert(slider, index, stdMath.abs(dx)/W);
        }
        slider = null;
    };
    var handle = function handle(evt) {
        slider = evt.target.closest('.slider');
        if (!slider) return;
        W = slider.parentNode.clientWidth;
        if (0 >= W) {slider = null; return;}
        N = (+slider.getAttribute('data-slides')) || 0;
        slider.classList.remove('swipe');
        clearTimeout(timer);
        isClick = false;
        if (evt.target.closest('a'))
        {
            isClick = true;
            timer = setTimeout(notClick, clickDelay);
        }
        if (evt.touches && evt.touches.length)
        {
            isTouch = true;
            endX = startX = evt.touches[0].pageX;
            addEvent(document, 'touchmove', move, {passive:false,capture:false});
            addEvent(document, 'touchend', release, {passive:false,capture:false});
            addEvent(document, 'touchcancel', release, {passive:false,capture:false});
            //evt.preventDefault && evt.preventDefault();
            //evt.stopPropagation && evt.stopPropagation();
        }
        else
        {
            isTouch = false;
            endX = startX = evt.pageX;
            addEvent(document, 'mousemove', move, {passive:false,capture:false});
            addEvent(document, 'mouseup', release, {passive:false,capture:false});
            evt.preventDefault && evt.preventDefault();
            evt.stopPropagation && evt.stopPropagation();
        }
    };
    var handle2 = function handle2(evt) {
        var a = evt.target.closest('a');
        if (!a) return;
        if (a.closest('.slide'))
        {
            if (!isClick)
            {
                evt.preventDefault && evt.preventDefault();
                evt.stopPropagation && evt.stopPropagation();
            }
            return;
        }
        var slide = a.getAttribute('data-slide'), slider, N, bullets, index;
        if ('prev' === slide)
        {
            slider = a.parentNode.querySelector('.slider');
            N = (+slider.getAttribute('data-slides')) || 0;
            index = get_slide(slider);
            if (0 <= index-1) goTo(slider, index-1, 0);
        }
        else if ('next' === slide)
        {
            slider = a.parentNode.querySelector('.slider');
            N = (+slider.getAttribute('data-slides')) || 0;
            index = get_slide(slider);
            if (N > index+1) goTo(slider, index+1, 0);
        }
        bullets = a.closest('.bullets');
        if (bullets)
        {
            slider = bullets.parentNode.querySelector('.slider');
            N = (+slider.getAttribute('data-slides')) || 0;
            index = (+slide) || 0;
            if (0 <= index && N > index) goTo(slider, index, 0);
        }
    };
    var started = false;
    self.start = function() {
        if (started) return self;
        started = true;
        forEach.call(sliders || [], function(ms) {
            addEvent(ms, 'mousedown', handle, {passive:false,capture:false});
            addEvent(ms, 'touchstart', handle, {passive:false,capture:false});
            addEvent(ms, 'click', handle2, {passive:false,capture:false});
            var slider = ms.querySelector('.slider'), index;
            if (slider)
            {
                index = get_slide(slider);
                move_slider(slider, String(-index * 100)+'%');
                active_bullet(slider, index);
            }
        });
        return self;
    };
    self.stop = function() {
        if (!started) return self;
        forEach.call(sliders || [], function(ms) {
            removeEvent(ms, 'mousedown', handle, {passive:false,capture:false});
            removeEvent(ms, 'touchstart', handle, {passive:false,capture:false});
            removeEvent(ms, 'click', handle2, {passive:false,capture:false});
        });
        started = false;
        return self;
    };
    self.dispose = function() {
        self.stop();
        sliders = null;
        return self;
    };
}
minislider.prototype = {
    constructor: minislider,
    dispose: null,
    start: null,
    stop: null
};
minislider.VERSION = '1.0.0';

// export it
root.minislider = minislider;
})('undefined' !== typeof self ? self : window);