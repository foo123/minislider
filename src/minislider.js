/**
*  minislider.js
*  Optimized responsive mini slider (up to 12 slides) for Desktop and Mobile
*  @VERSION: 1.1.0
*  https://github.com/foo123/minislider
*/
(function(root) {
"use strict";

var stdMath = Math,
    forEach = Array.prototype.forEach,
    trim_re = /^\s+|\s+$/g,
    trim = String.prototype.trim
    ? function(s) {return s.trim();}
    : function(s) {return s.replace(trim_re, '');}
;

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
function hasClass(el, className)
{
    return el.classList
        ? el.classList.contains(className)
        : -1 !== (' ' + el.className + ' ').indexOf(' ' + className + ' ')
    ;
}
function addClass(el, className)
{
    if (el.classList) el.classList.add(className);
    else if (-1 === (' ' + el.className + ' ').indexOf(' ' + className + ' ')) el.className = '' === el.className ? className : (el.className + ' ' + className);
}
function removeClass(el, className)
{
    if (el.classList) el.classList.remove(className);
    else el.className = trim((' ' + el.className + ' ').replace(' ' + className + ' ', ' '));
}
function addStyle(el, prop, val)
{
    if (el.style.setProperty) el.style.setProperty(prop, val);
    else el.style[prop] = val;
}
function removeStyle(el, prop)
{
    if (el.style.removeProperty) el.style.removeProperty(prop);
    else el.style[prop] = '';
}
function attr(el, att, val)
{
    if (3 <= arguments.length)
    {
        el.setAttribute(att, val);
        return val;
    }
    else
    {
        return el.getAttribute(att);
    }
}
function computedStyle(el)
{
    return ('function' === typeof window.getComputedStyle ? window.getComputedStyle(el, null) : el.currentStyle) || {};
}

function get_slides(slider)
{
    return slider ? ((+attr(slider, 'data-slides')) || 0) : 0;
}
function set_slides(slider)
{
    if (slider && !slider.hasAttribute('data-slides'))
        attr(slider, 'data-slides', String(slider.children.length));
}
function get_slide(slider)
{
    return slider ? ((+attr(slider, 'data-slide')) || 0) : 0;
}
function set_slide(slider, index, spa)
{
    if (slider) attr(slider, 'data-slide', spa*stdMath.floor((index || 0) / spa));
}
function get_autoplay(slider, style)
{
    style = style || computedStyle(slider.parentNode);
    return parseInt(style.getPropertyValue('--auto-play')) || 0;
}
function get_spa(slider, style)
{
    style = style || computedStyle(slider.parentNode);
    return parseInt(style.getPropertyValue('--slides-per-area')) || 1;
}
function get_swipe(slider, style)
{
    style = style || computedStyle(slider.parentNode);
    return parseFloat(style.getPropertyValue('--swipe')) || 400;
}
function get_delay(slider, style)
{
    style = style || computedStyle(slider.parentNode);
    return parseFloat(style.getPropertyValue('--delay')) || 2000;
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
                removeClass(b, 'current-slide');
            });
            idx = spa*stdMath.floor(index/spa);
            b = bullets.querySelector('[data-slide="'+idx+'"]');
            if (b) addClass(b, 'current-slide');
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
            ds = attr(arrows[i], 'data-slide');
            if ('prev' === ds)
            {
                if (idx-1 >= 0) removeClass(arrows[i], 'disabled');
                else addClass(arrows[i], 'disabled');
            }
            else if ('next' === ds)
            {
                if (idx+spa < N) removeClass(arrows[i], 'disabled');
                else addClass(arrows[i], 'disabled');
            }
        }
    }
}
function revert(slider, index, spa, t, oncomplete)
{
    if (slider)
    {
        clearTimeout(slider.$minislider.timer);
        var dur = (t||0)*get_swipe(slider);
        addClass(slider, 'swipe');
        addStyle(slider, 'transition-duration', String(dur)+'ms');
        move_slider(slider, String(-stdMath.floor(index/spa) * 100)+'%');
        setTimeout(function() {
            autoplay(slider);
            if (oncomplete) oncomplete(slider);
        }, dur + 10);
    }
}
function goTo(slider, index, spa, t, oncomplete)
{
    if (slider)
    {
        clearTimeout(slider.$minislider.timer);
        var dur = (1-(t||0))*get_swipe(slider);
        set_slide(slider, index, spa);
        active_bullet(slider, index, spa);
        active_arrows(slider, index, spa);
        addClass(slider, 'swipe');
        addStyle(slider, 'transition-duration', String(dur)+'ms');
        move_slider(slider, String(-stdMath.floor(index/spa) * 100)+'%');
        setTimeout(function() {
            autoplay(slider);
            if (oncomplete) oncomplete(slider);
        }, dur + 10);
    }
}
function autoplay(slider)
{
    if (slider && slider.$minislider)
    {
        clearTimeout(slider.$minislider.timer);
        slider.$minislider.timer = setTimeout(function() {
            if (slider.$minislider)
            {
                if (get_autoplay(slider))
                {
                    var N = get_slides(slider),
                        index = get_slide(slider),
                        spa = get_spa(slider),
                        idx = spa*stdMath.floor(index/spa)
                    ;
                    goTo(slider, N > idx+spa ? idx+spa : 0, spa, 0);
                }
                else
                {
                    autoplay(slider);
                }
            }
        }, get_delay(slider));
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
        clickDelay = 120, timer,
        move, release,
        handle, handle2,
        add, remove;

    // private methods
    move = function move(evt) {
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
    release = function release(evt) {
        clearTimeout(timer);
        if (isTouch)
        {
            removeEvent(document, 'touchmove', move, {passive:false,capture:false});
            removeEvent(document, 'touchend', release, {passive:false,capture:false});
            removeEvent(document, 'touchcancel', release, {passive:false,capture:false});
        }
        else
        {
            removeEvent(document, 'mousemove', move, {passive:false,capture:false});
            removeEvent(document, 'mouseup', release, {passive:false,capture:false});
        }
        var dx = endX - startX, dy = endY - startY, index = get_slide(slider), idx;
        if (isTouch && (stdMath.abs(dy) >= stdMath.abs(dx)))
        {
            if (dx) revert(slider, index, spa, stdMath.abs(dx)/W);
            else autoplay(slider);
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
    handle = function handle(evt) {
        slider = evt.target.closest('.slider');
        if (!slider) return;
        clearTimeout(slider.$minislider.timer);
        W = slider.parentNode.clientWidth;
        if (0 >= W) {slider = null; return;}
        N = get_slides(slider);
        spa = get_spa(slider);
        removeClass(slider, 'swipe');
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
    handle2 = function handle2(evt) {
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
        var slide = attr(a, 'data-slide'), slider, N, bullets, index, spa, idx;
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

    add = function add(ms) {
        addEvent(ms, 'mousedown', handle, {passive:false,capture:false});
        addEvent(ms, 'touchstart', handle, {passive:false,capture:false});
        addEvent(ms, 'click', handle2, {passive:false,capture:false});
        addClass(ms, 'minislider-js');
        var slider = ms.querySelector('.slider'), index, spa;
        if (slider)
        {
            slider.$minislider = {timer:null};
            set_slides(slider);
            index = get_slide(slider);
            spa = get_spa(slider);
            move_slider(slider, String(-stdMath.floor(index/spa) * 100)+'%');
            active_bullet(slider, index, spa);
            active_arrows(slider, index, spa);
            autoplay(slider);
        }
    };
    remove = function remove(ms) {
        removeClass(ms, 'minislider-js');
        removeEvent(ms, 'mousedown', handle, {passive:false,capture:false});
        removeEvent(ms, 'touchstart', handle, {passive:false,capture:false});
        removeEvent(ms, 'click', handle2, {passive:false,capture:false});
        var slider = ms.querySelector('.slider');
        if (slider && slider.$minislider) slider.$minislider = null;
    };

    var started = false;
    sliders = Array.prototype.slice.call(sliders || []);

    self.start = function() {
        if (started) return self;
        started = true;
        forEach.call(sliders, add);
        return self;
    };
    self.stop = function() {
        if (!started) return self;
        forEach.call(sliders, remove);
        started = false;
        return self;
    };
    self.add = function(ms) {
        if (-1 === sliders.indexOf(ms))
        {
            if (started) add(ms);
            sliders.push(ms);
        }
        return self;
    };
    self.remove = function(ms) {
        var idx = sliders.indexOf(ms);
        if (-1 !== idx)
        {
            if (started) remove(ms);
            sliders.splice(idx, 1);
        }
        return self;
    };
    self.dispose = function() {
        self.stop();
        sliders = [];
        return self;
    };
}
minislider.prototype = {
    constructor: minislider,
    dispose: null,
    start: null,
    stop: null,
    add: null,
    remove: null
};
minislider.VERSION = '1.1.0';
if (root.Element) root.Element.prototype.$minislider = null;
// export it
root.minislider = minislider;
})('undefined' !== typeof self ? self : window);