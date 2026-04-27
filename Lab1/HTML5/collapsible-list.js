(function ($) {
    'use strict';
    $(function () {
        $('.collapsible-root').on('click', '.collapsible-btn', function () {
            var $btn = $(this);
            var $item = $btn.closest('.collapsible-item');
            var open = $item.toggleClass('is-open').hasClass('is-open');
            $btn.attr('aria-expanded', open ? 'true' : 'false').text(open ? '\u25bc' : '\u25b6');
        });
    });
})(jQuery);
