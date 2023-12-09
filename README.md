# minislider

Optimized responsive mini slider (up to 12 slides) for Desktop and Mobile


**version: 1.0.6** (5kB minified)


**demo**


```html
<style type="text/css">
.minislider {
    width: 100%;
    margin: 0 auto;
    --slides-per-area: 1;
    --aspect-ratio: calc(16 / 9); /* 16 : 9 */
}
</style>
<div class="minislider">

<div class="slider" data-slide="1" data-slides="3">
    <a class="slide" href="https://en.wikipedia.org/wiki/Landscape" target="_blank" style="background-image:url('./imgs/1.jpg')"></a>
    <a class="slide" href="https://en.wikipedia.org/wiki/Landscape" target="_blank" style="background-image:url('./imgs/3.jpg')"></a>
    <figure class="slide" style="background-image:url('./imgs/4.jpg')"></figure>
</div>

<div class="bullets">
    <a href="javascript:void(0)" class="bullet" data-slide="0" title="1"></a>
    <a href="javascript:void(0)" class="bullet" data-slide="1" title="2"></a>
    <a href="javascript:void(0)" class="bullet" data-slide="2" title="3"></a>
</div>

<a href="javascript:void(0)" class="arrow prev" data-slide="prev" title="Previous"></a>
<a href="javascript:void(0)" class="arrow next" data-slide="next" title="Next"></a>

</div>
<script>minislider(document.querySelectorAll('.minislider')).start();</script>
```

![mini slider](/minislider.gif)

**Options:**

The following are flexible options via CSS custom properties.

* `--slides-per-area`: number of slides visible at the same time (default `1`)
* `--aspect-ratio`: aspect ratio of slide (default `1 : 1`)
* `--use-aspect-ratio`: flag enabling use of aspect ratio, else custom height management (default `1`)
* `--auto-play`: flag enabling slideshow autoplay (default `0`)
* `--delay`: duration in `ms` for current slide to stay visible during autoplay (default `2000ms`)
* `--swipe`: duration in `ms` for swipe transition (default `400ms`)
* `--bullet-color`: bullet color (default `#fff`);
* `--bullet-active-color`: active bullet color (default `#999`);
* `--slide-color`: slide background color (default `#f0f0f0`);
