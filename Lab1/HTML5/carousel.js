(function () {
    'use strict';

    var INTERVAL_MS = 3000;
    var root;
    var slideEl;
    var captionEl;
    var index = 0;
    var timerId = null;

    function showSlide(i) {
        if (typeof CAROUSEL_SLIDES === 'undefined' || !CAROUSEL_SLIDES.length) return;
        var n = CAROUSEL_SLIDES.length;
        index = ((i % n) + n) % n;
        var item = CAROUSEL_SLIDES[index];
        slideEl.style.backgroundImage = 'url("' + item.image.replace(/"/g, '%22') + '")';
        captionEl.textContent = item.text;
        slideEl.setAttribute('aria-label', item.text);
    }

    function next() {
        showSlide(index + 1);
    }

    function prev() {
        showSlide(index - 1);
    }

    function startAuto() {
        if (timerId !== null) {
            clearInterval(timerId);
        }
        timerId = window.setInterval(next, INTERVAL_MS);
    }

    function init() {
        root = document.getElementById('carousel-root');
        if (!root || typeof CAROUSEL_SLIDES === 'undefined' || CAROUSEL_SLIDES.length < 4) {
            return;
        }

        root.innerHTML =
            '<div class="carousel-viewport">' +
            '<div class="carousel-slide" id="carousel-slide" role="region" aria-roledescription="slide">' +
            '<span class="carousel-caption" id="carousel-caption"></span>' +
            '</div>' +
            '</div>' +
            '<button type="button" class="carousel-nav carousel-prev" id="carousel-prev" aria-label="Slide anterior">&lt;</button>' +
            '<button type="button" class="carousel-nav carousel-next" id="carousel-next" aria-label="Slide urmator">&gt;</button>';

        slideEl = document.getElementById('carousel-slide');
        captionEl = document.getElementById('carousel-caption');

        document.getElementById('carousel-prev').addEventListener('click', function () {
            prev();
            startAuto();
        });
        document.getElementById('carousel-next').addEventListener('click', function () {
            next();
            startAuto();
        });

        showSlide(0);
        startAuto();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
