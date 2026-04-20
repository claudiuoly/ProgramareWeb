(function () {
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
        var seed = now.getFullYear() * 400 + dayOfYear;
        return seed % CONSTRUCTION_TIPS.length;
    }

    function formatBudget(n) {
        return (
            n.toLocaleString('ro-RO', { maximumFractionDigits: 0 }) +
            ' EUR'
        );
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

    function renderInsights(root) {
        root.textContent = '';

        if (typeof TABLE_PROJECT_ROWS === 'undefined' || !TABLE_PROJECT_ROWS.length) {
            var empty = document.createElement('p');
            empty.textContent = 'Nu exista date de proiect incarcate.';
            root.appendChild(empty);
            return;
        }

        var rows = TABLE_PROJECT_ROWS.slice();
        var maxBudget = rows.reduce(function (acc, r) {
            return r.budgetEur > acc ? r.budgetEur : acc;
        }, 0);
        var totalBudget = rows.reduce(function (sum, r) {
            return sum + r.budgetEur;
        }, 0);
        var maxProject = rows.reduce(function (best, r) {
            return r.budgetEur > best.budgetEur ? r : best;
        }, rows[0]);

        var h2 = document.createElement('h2');
        h2.textContent = 'Statistici din proiecte (date reale din tabel)';
        root.appendChild(h2);

        var lead = document.createElement('p');
        lead.className = 'site-insights-lead';
        lead.textContent =
            'Panou generat dinamic cu JavaScript: sumar buget, grafic de bare proportional cu bugetul maxim, ' +
            'lista termene cu coduri de urgenta, plus un sfat de siguranta pe zi (selectat determinist dintr-un tablou).';
        root.appendChild(lead);

        var grid = document.createElement('div');
        grid.className = 'site-insights-grid';

        var blockBars = document.createElement('div');
        blockBars.className = 'site-insights-block';

        var h3bars = document.createElement('h3');
        h3bars.textContent = 'Distributie buget pe proiect';
        blockBars.appendChild(h3bars);

        var summary = document.createElement('div');
        summary.className = 'site-insights-summary';

        var st1 = document.createElement('div');
        st1.className = 'site-insights-stat';
        var st1label = document.createElement('span');
        st1label.textContent = 'Buget total (suma)';
        var st1strong = document.createElement('strong');
        st1strong.textContent = formatBudget(totalBudget);
        st1.appendChild(st1label);
        st1.appendChild(st1strong);
        summary.appendChild(st1);

        var st2 = document.createElement('div');
        st2.className = 'site-insights-stat';
        var st2label = document.createElement('span');
        st2label.textContent = 'Cel mai mare buget';
        var st2strong = document.createElement('strong');
        st2strong.textContent = formatBudget(maxProject.budgetEur);
        var st2sub = document.createElement('span');
        st2sub.className = 'site-insights-stat-sub';
        st2sub.textContent = maxProject.project;
        st2.appendChild(st2label);
        st2.appendChild(st2strong);
        st2.appendChild(st2sub);
        summary.appendChild(st2);

        blockBars.appendChild(summary);

        var barsWrap = document.createElement('div');
        barsWrap.className = 'insight-bars';

        rows
            .slice()
            .sort(function (a, b) {
                return b.budgetEur - a.budgetEur;
            })
            .forEach(function (r) {
                var pct = maxBudget > 0 ? Math.round((r.budgetEur / maxBudget) * 1000) / 10 : 0;
                var row = document.createElement('div');
                row.className = 'insight-bar-row';

                var lab = document.createElement('div');
                lab.className = 'label';
                lab.textContent = r.project;
                row.appendChild(lab);

                var cell = document.createElement('div');
                var track = document.createElement('div');
                track.className = 'insight-bar-track';
                var fill = document.createElement('div');
                fill.className = 'insight-bar-fill';
                fill.style.width = pct + '%';
                track.appendChild(fill);
                cell.appendChild(track);
                var meta = document.createElement('div');
                meta.className = 'insight-bar-meta';
                meta.textContent = formatBudget(r.budgetEur) + ' · ' + pct + '% din max.';
                cell.appendChild(meta);
                row.appendChild(cell);
                barsWrap.appendChild(row);
            });

        blockBars.appendChild(barsWrap);
        grid.appendChild(blockBars);

        var blockDl = document.createElement('div');
        blockDl.className = 'site-insights-block site-insights-deadlines';

        var h3dl = document.createElement('h3');
        h3dl.textContent = 'Termene limita (ordonate)';
        blockDl.appendChild(h3dl);

        var ul = document.createElement('ul');
        rows
            .slice()
            .sort(function (a, b) {
                return a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0;
            })
            .forEach(function (r) {
                var days = daysFromToday(r.deadline);
                var li = document.createElement('li');

                var badge = document.createElement('span');
                badge.className = 'deadline-badge ' + badgeClassForDays(days);
                badge.textContent = badgeLabelForDays(days);

                var title = document.createElement('span');
                title.textContent = r.project;

                var when = document.createElement('span');
                when.style.color = '#666';
                when.textContent = r.deadline;

                li.appendChild(badge);
                li.appendChild(title);
                li.appendChild(when);
                ul.appendChild(li);
            });
        blockDl.appendChild(ul);
        grid.appendChild(blockDl);

        var tip = document.createElement('div');
        tip.className = 'site-insights-tip';
        var h3t = document.createElement('h3');
        h3t.textContent = 'Sfat de siguranta (ziua curenta)';
        tip.appendChild(h3t);
        var pTip = document.createElement('p');
        pTip.textContent = CONSTRUCTION_TIPS[dailyTipIndex()];
        tip.appendChild(pTip);
        var tipFoot = document.createElement('div');
        tipFoot.className = 'tip-date';
        var now = new Date();
        tipFoot.textContent =
            'Index sfat: ' +
            dailyTipIndex() +
            ' / ' +
            CONSTRUCTION_TIPS.length +
            ' · Data: ' +
            pad2(now.getDate()) +
            '.' +
            pad2(now.getMonth() + 1) +
            '.' +
            now.getFullYear();
        tip.appendChild(tipFoot);
        grid.appendChild(tip);

        root.appendChild(grid);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'site-insights-refresh';
        btn.textContent = 'Recalculeaza panoul';
        btn.addEventListener('click', function () {
            renderInsights(root);
        });
        root.appendChild(btn);
    }

    function init() {
        var mount = document.getElementById('site-insights-mount');
        if (!mount) return;
        renderInsights(mount);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
