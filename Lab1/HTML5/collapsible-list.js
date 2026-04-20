(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', function () {
        var root = document.querySelector('.collapsible-root');
        if (!root) return;
        root.addEventListener('click', function (e) {
            var btn = e.target.closest('.collapsible-btn');
            if (!btn || !root.contains(btn)) return;
            var item = btn.closest('.collapsible-item');
            var open = item.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.textContent = open ? '\u25bc' : '\u25b6';
        });
    });
})();
