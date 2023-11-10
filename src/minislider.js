/**
*  minislider.js
*  Optimized responsive mini slider (up to 12 slides) for Desktop and Mobile
*  @VERSION: 1.0.5
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

function get_slides(slider)
{
    return slider ? ((+slider.getAttribute('data-slides')) || 0) : 0;
}
function get_slide(slider)
{
    return slider ? ((+slider.getAttribute('data-slide')) || 0) : 0;
}
function set_slide(slider, index, spa)
{
    if (slider) slider.setAttribute('data-slide', spa*stdMath.floor((index || 0) / spa));
}
function get_spa(slider)
{
    return slider ? (parseInt(window.getComputedStyle(slider.parentNode).getPropertyValue('--slides-per-area')) || 1) : 1;
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
function active_bullet(slider, index, spa)
{
    if (slider)
    {
        var bullets = get_bullets(slider), idx, b;
        if (bullets)
        {
            forEach.call(bullets.children, function(b) {
                b.classList.remove('current-slide');
            });
            idx = spa*stdMath.floor(index/spa);
            b = bullets.querySelector('[data-slide="'+idx+'"]');
            if (b) b.classList.add('current-slide');
        }
    }
}
function get_arrows(slider)
{
    var _arrows = slider ? slider.parentNode.querySelectorAll('.arrow') : [], arrows = [null, null];
    if (_arrows[1] && _arrows[1].parentNode === slider.parentNode) arrows[1] = _arrows[1];
    if (_arrows[0] && _arrows[0].parentNode === slider.parentNode) arrows[0] = _arrows[0];
    return arrows;
}
function active_arrows(slider, index, spa)
{
    if (slider)
    {
        var arrows = get_arrows(slider), N = get_slides(slider), ds, idx = spa*stdMath.floor(index/spa);
        for (var i=0; i<2; ++i)
        {
            if (!arrows[i]) continue;
            ds = arrows[i].getAttribute('data-slide');
            if ('prev' === ds)
            {
                if (idx-1 >= 0) arrows[i].classList.remove('disabled');
                else arrows[i].classList.add('disabled');
            }
            else if ('next' === ds)
            {
                if (idx+spa < N) arrows[i].classList.remove('disabled');
                else arrows[i].classList.add('disabled');
            }
        }
    }
}
function revert(slider, index, spa, t)
{
    if (slider)
    {
        slider.classList.add('swipe');
        slider.style['transition-duration'] = String((t||0)*get_swipe(slider))+'ms';
        move_slider(slider, String(-stdMath.floor(index/spa) * 100)+'%');
    }
}
function goTo(slider, index, spa, t)
{
    if (slider)
    {
        set_slide(slider, index, spa);
        active_bullet(slider, index, spa);
        active_arrows(slider, index, spa);
        slider.classList.add('swipe');
        slider.style['transition-duration'] = String((1-(t||0))*get_swipe(slider))+'ms';
        move_slider(slider, String(-stdMath.floor(index/spa) * 100)+'%');
    }
}
function minislider(sliders)
{
    var self = this;
    if (!(self instanceof minislider)) return new minislider(sliders);

    var startX, endX, startY, endY, slider,
        N, W, spa = 1, offset = 16,
        isTouch = false, isClick = false,
        notClick = function() {isClick = false},
        clickDelay = 120, timer;

    var move = function move(evt) {
        endX = (evt.touches && evt.touches.length ? evt.touches[0].pageX : evt.pageX);
        endY = (evt.touches && evt.touches.length ? evt.touches[0].pageY : evt.pageY);
        var dx = endX - startX, dy = endY - startY, index, idx;
        if (isTouch && (stdMath.abs(dy) >= stdMath.abs(dx))) return;
        evt.preventDefault && evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        index = get_slide(slider);
        idx = spa*stdMath.floor(index/spa);
        if ((0 > dx && N > idx+spa) || (0 < dx && 0 <= idx-1))
        {
            move_slider(slider, String(-stdMath.floor(index/spa)*W + dx)+'px');
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
        var dx = endX - startX, dy = endY - startY, index = get_slide(slider), idx;
        if (isTouch && (stdMath.abs(dy) >= stdMath.abs(dx)))
        {
            if (dx) revert(slider, index, spa, stdMath.abs(dx)/W);
            slider = null;
            return;
        }
        if (!isClick)
        {
            evt.preventDefault && evt.preventDefault();
            evt.stopPropagation && evt.stopPropagation();
        }
        idx = spa*stdMath.floor(index/spa);
        if (0 > dx)
        {
            dx = stdMath.abs(dx);
            if (N > idx+spa)
            {
                if (dx >= offset)
                {
                    goTo(slider, idx+spa, spa, dx/W)
                }
                else
                {
                    revert(slider, idx, spa, dx/W);
                }
            }
        }
        else if (0 < dx)
        {
            dx = stdMath.abs(dx);
            if (0 <= idx-1)
            {
                if (dx >= offset)
                {
                    goTo(slider, idx-spa, spa, dx/W);
                }
                else
                {
                    revert(slider, idx, spa, dx/W);
                }
            }
        }
        else
        {
            revert(slider, idx, spa, stdMath.abs(dx)/W);
        }
        slider = null;
    };
    var handle = function handle(evt) {
        slider = evt.target.closest('.slider');
        if (!slider) return;
        W = slider.parentNode.clientWidth;
        if (0 >= W) {slider = null; return;}
        N = get_slides(slider);
        spa = get_spa(slider);
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
            endY = startY = evt.touches[0].pageY;
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
            endY = startY = evt.pageY;
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
        var slide = a.getAttribute('data-slide'), slider, N, bullets, index, spa, idx;
        if ('prev' === slide)
        {
            slider = a.parentNode.querySelector('.slider');
            N = get_slides(slider);
            index = get_slide(slider);
            spa = get_spa(slider);
            idx = spa*stdMath.floor(index/spa);
            if (0 <= idx-1) goTo(slider, idx-spa, spa, 0);
        }
        else if ('next' === slide)
        {
            slider = a.parentNode.querySelector('.slider');
            N = get_slides(slider);
            index = get_slide(slider);
            spa = get_spa(slider);
            idx = spa*stdMath.floor(index/spa);
            if (N > idx+spa) goTo(slider, idx+spa, spa, 0);
        }
        bullets = a.closest('.bullets');
        if (bullets)
        {
            slider = bullets.parentNode.querySelector('.slider');
            N = get_slides(slider);
            index = (+slide) || 0;
            spa = get_spa(slider);
            idx = spa*stdMath.floor(index/spa);
            if (0 <= idx && N > idx) goTo(slider, idx, spa, 0);
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
            var slider = ms.querySelector('.slider'), index, spa;
            if (slider)
            {
                index = get_slide(slider);
                spa = get_spa(slider);
                move_slider(slider, String(-stdMath.floor(index/spa) * 100)+'%');
                active_bullet(slider, index, spa);
                active_arrows(slider, index, spa);
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
minislider.VERSION = '1.0.5';

// export it
root.minislider = minislider;
})('undefined' !== typeof self ? self : window);