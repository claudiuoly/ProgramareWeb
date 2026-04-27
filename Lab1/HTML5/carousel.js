(function ($) {
    'use strict';

    var INTERVAL_MS = 3000;
    var index = 0;
    var timerId = null;

    function showSlide($slide, $caption, i) {
        if (typeof CAROUSEL_SLIDES === 'undefined' || !CAROUSEL_SLIDES.length) return;
        var n = CAROUSEL_SLIDES.length;
        index = ((i % n) + n) % n;
        var item = CAROUSEL_SLIDES[index];
        $slide
            .css('backgroundImage', 'url("' + item.image.replace(/"/g, '%22') + '")')
            .attr('aria-label', item.text);
        $caption.text(item.text);
    }

    function startAuto($slide, $caption) {
        if (timerId !== null) clearInterval(timerId);
        timerId = window.setInterval(function () {
            showSlide($slide, $caption, index + 1);
        }, INTERVAL_MS);
    }

    function init() {
        var $root = $('#carousel-root');
        if (!$root.length || typeof CAROUSEL_SLIDES === 'undefined' || CAROUSEL_SLIDES.length < 4) {
            return;
        }

        $root.html(
            '<div class="carousel-viewport">' +
                '<div class="carousel-slide" id="carousel-slide" role="region" aria-roledescription="slide">' +
                '<span class="carousel-caption" id="carousel-caption"></span></div></div>' +
                '<button type="button" class="carousel-nav carousel-prev" data-carousel-dir="prev" aria-label="Slide anterior">&lt;</button>' +
                '<button type="button" class="carousel-nav carousel-next" data-carousel-dir="next" aria-label="Slide urmator">&gt;</button>'
        );

        var $slide = $root.find('#carousel-slide');
        var $caption = $root.find('#carousel-caption');

        $root
            .on('click', '[data-carousel-dir]', function () {
                var dir = $(this).data('carousel-dir');
                if (dir === 'prev') {
                    showSlide($slide, $caption, index - 1);
                } else {
                    showSlide($slide, $caption, index + 1);
                }
                startAuto($slide, $caption);
            });

        showSlide($slide, $caption, 0);
        startAuto($slide, $caption);
    }

    $(init);
})(jQuery);
