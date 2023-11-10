# minislider

Optimized responsive mini slider (up to 10 slides) for Desktop and Mobile


**version: 1.0.1** (4kB minified)


**demo**


```html
<style type="text/css">
.minislider {
    width: 100%;
    margin: 0 auto;
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