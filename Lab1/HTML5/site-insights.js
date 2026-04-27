(function ($) {
    'use strict';

    var CONSTRUCTION_TIPS = [
        'Verificati EPI inainte de intrarea pe santier: casca, incaltaminte antialunecare, vesta reflectorizanta.',
        'Pastrati o zona de depozitare uscata pentru ciment si aditivi; umiditatea reduce calitatea betonului.',
        'Documentati fiecare livrare de beton: tip, clasa, timpul de turnare si conditiile meteorologice.',
        'Planificati sapaturile astfel incat taluzurile sa ramana stabile; folositi sustineri unde este cazul.',
        'La sudura, asigurati ventilatia spatiului si indepartati materialele combustibile din proximitate.',
        'Controlati periodic schelele: fixari, nivel, protectii perimetrale si acces sigur.',
        'Stocati recipientele cu substante chimice etichetate si in dulapuri special destinate.',
        'Limitati zgomotul in orele permise si comunicati vecinilor lucrarile programate.',
        'La lucru la inaltime, folositi sistem antialunecare certificat si verificati ancorajele.',
        'In caz de vant puternic sau furtuna, opriti lucrarile la inaltime si macaralele mobile.'
    ];

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function parseISODateLocal(iso) {
        var p = String(iso).split('-');
        if (p.length !== 3) return null;
        var y = parseInt(p[0], 10);
        var m = parseInt(p[1], 10) - 1;
        var d = parseInt(p[2], 10);
        var dt = new Date(y, m, d);
        if (dt.getFullYear() !== y || dt.getMonth() !== m || dt.getDate() !== d) return null;
        return dt;
    }

    function daysFromToday(deadlineIso) {
        var target = parseISODateLocal(deadlineIso);
        if (!target) return null;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        return Math.round((target - today) / 86400000);
    }

    function dailyTipIndex() {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 1);
        var dayOfYear = Math.floor((now - start) / 86400000) + 1;
        return (now.getFullYear() * 400 + dayOfYear) % CONSTRUCTION_TIPS.length;
    }

    function formatBudget(n) {
        return n.toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' EUR';
    }

    function badgeClassForDays(days) {
        if (days === null) return 'deadline-badge--later';
        if (days < 0) return 'deadline-badge--overdue';
        if (days <= 14) return 'deadline-badge--urgent';
        if (days <= 60) return 'deadline-badge--soon';
        return 'deadline-badge--later';
    }

    function badgeLabelForDays(days) {
        if (days === null) return 'Data necunoscuta';
        if (days < 0) return 'Depasit cu ' + Math.abs(days) + ' zile';
        if (days === 0) return 'Azi';
        if (days === 1) return 'Maine';
        return 'In ' + days + ' zile';
    }

    function renderInsights($root) {
        $root.empty();

        if (typeof TABLE_PROJECT_ROWS === 'undefined' || !TABLE_PROJECT_ROWS.length) {
            $root.append($('<p></p>').text('Nu exista date de proiect incarcate.'));
            return;
        }

        var rows = TABLE_PROJECT_ROWS.slice();
        var maxBudget = Math.max.apply(
            null,
            $.map(rows, function (r) {
                return r.budgetEur;
            })
        );
        var totalBudget = rows.reduce(function (s, r) {
            return s + r.budgetEur;
        }, 0);
        var maxProject = rows.reduce(function (best, r) {
            return r.budgetEur > best.budgetEur ? r : best;
        }, rows[0]);

        $root.append(
            $('<h2></h2>').text('Statistici din proiecte (date reale din tabel)'),
            $('<p></p>')
                .addClass('site-insights-lead')
                .text(
                    'Panou generat cu jQuery din datele din tabel: buget, bare, termene, sfat zilnic.'
                )
        );

        var $grid = $('<div></div>').addClass('site-insights-grid');

        var $blockBars = $('<div></div>').addClass('site-insights-block');
        $blockBars.append($('<h3></h3>').text('Distributie buget pe proiect'));
        var $summary = $('<div></div>').addClass('site-insights-summary');
        $summary.append(
            $('<div></div>')
                .addClass('site-insights-stat')
                .append(
                    $('<span></span>').text('Buget total (suma)'),
                    $('<strong></strong>').text(formatBudget(totalBudget))
                ),
            $('<div></div>')
                .addClass('site-insights-stat')
                .append(
                    $('<span></span>').text('Cel mai mare buget'),
                    $('<strong></strong>').text(formatBudget(maxProject.budgetEur)),
                    $('<span></span>').addClass('site-insights-stat-sub').text(maxProject.project)
                )
        );
        $blockBars.append($summary);

        var $barsWrap = $('<div></div>').addClass('insight-bars');
        $.each(
            rows.slice().sort(function (a, b) {
                return b.budgetEur - a.budgetEur;
            }),
            function (_, r) {
                var pct = maxBudget > 0 ? Math.round((r.budgetEur / maxBudget) * 1000) / 10 : 0;
                $barsWrap.append(
                    $('<div></div>')
                        .addClass('insight-bar-row')
                        .append(
                            $('<div></div>').addClass('label').text(r.project),
                            $('<div></div>').append(
                                $('<div></div>')
                                    .addClass('insight-bar-track')
                                    .append(
                                        $('<div></div>').addClass('insight-bar-fill').css('width', pct + '%')
                                    ),
                                $('<div></div>')
                                    .addClass('insight-bar-meta')
                                    .text(formatBudget(r.budgetEur) + ' · ' + pct + '% din max.')
                            )
                        )
                );
            }
        );
        $blockBars.append($barsWrap);
        $grid.append($blockBars);

        var $blockDl = $('<div></div>').addClass('site-insights-block site-insights-deadlines');
        $blockDl.append($('<h3></h3>').text('Termene limita (ordonate)'));
        var $ul = $('<ul></ul>');
        $.each(
            rows.slice().sort(function (a, b) {
                return a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0;
            }),
            function (_, r) {
                var days = daysFromToday(r.deadline);
                $ul.append(
                    $('<li></li>').append(
                        $('<span></span>')
                            .addClass('deadline-badge ' + badgeClassForDays(days))
                            .text(badgeLabelForDays(days)),
                        $('<span></span>').text(r.project),
                        $('<span></span>').css('color', '#666').text(r.deadline)
                    )
                );
            }
        );
        $blockDl.append($ul);
        $grid.append($blockDl);

        var now = new Date();
        $grid.append(
            $('<div></div>')
                .addClass('site-insights-tip')
                .append(
                    $('<h3></h3>').text('Sfat de siguranta (ziua curenta)'),
                    $('<p></p>').text(CONSTRUCTION_TIPS[dailyTipIndex()]),
                    $('<div></div>')
                        .addClass('tip-date')
                        .text(
                            'Index sfat: ' +
                                dailyTipIndex() +
                                ' / ' +
                                CONSTRUCTION_TIPS.length +
                                ' · Data: ' +
                                pad2(now.getDate()) +
                                '.' +
                                pad2(now.getMonth() + 1) +
                                '.' +
                                now.getFullYear()
                        )
                )
        );

        $root.append($grid);

        $root.append(
            $('<button></button>')
                .attr('type', 'button')
                .addClass('site-insights-refresh')
                .text('Recalculeaza panoul')
                .on('click', function () {
                    renderInsights($root);
                })
        );
    }

    $(function () {
        $('#dash-active-project-count').text(
            typeof TABLE_PROJECT_ROWS !== 'undefined' ? TABLE_PROJECT_ROWS.length : ''
        );
        var $mount = $('#site-insights-mount');
        if ($mount.length) renderInsights($mount);
    });
})(jQuery);
