(function () {
    'use strict';

    var sortState = {
        key: 'project',
        dir: 'asc'
    };

    var LABELS = {
        project: 'Nume Proiect',
        manager: 'Manager',
        status: 'Status',
        budget: 'Buget',
        deadline: 'Termen Limita',
        action: 'Actiuni'
    };

    function compareRows(a, b, key) {
        var va;
        var vb;
        if (key === 'budgetEur') {
            va = a.budgetEur;
            vb = b.budgetEur;
            if (va === vb) return 0;
            return va < vb ? -1 : 1;
        }
        if (key === 'deadline') {
            va = a.deadline;
            vb = b.deadline;
            if (va === vb) return 0;
            return va < vb ? -1 : 1;
        }
        va = String(a[key]).toLocaleLowerCase('ro');
        vb = String(b[key]).toLocaleLowerCase('ro');
        return va.localeCompare(vb, 'ro');
    }

    function sortRows(rows, key, dir) {
        var copy = rows.slice();
        copy.sort(function (a, b) {
            var c = compareRows(a, b, key);
            return dir === 'asc' ? c : -c;
        });
        return copy;
    }

    function formatBudget(n) {
        return (
            n.toLocaleString('ro-RO', { maximumFractionDigits: 0 }) +
            ' EUR'
        );
    }

    function renderBody(tbody, rows) {
        tbody.textContent = '';
        rows.forEach(function (row) {
            var tr = document.createElement('tr');

            function cell(labelKey, text) {
                var td = document.createElement('td');
                td.setAttribute('data-label', LABELS[labelKey]);
                td.textContent = text;
                tr.appendChild(td);
            }

            cell('project', row.project);
            cell('manager', row.manager);
            cell('status', row.status);
            cell('budget', formatBudget(row.budgetEur));
            cell('deadline', row.deadline);
            cell('action', row.action);

            tbody.appendChild(tr);
        });
    }

    function updateHeaderClasses(thead, activeKey) {
        var ths = thead.querySelectorAll('th.sortable');
        ths.forEach(function (th) {
            th.classList.remove('sorted', 'asc', 'desc');
            var k = th.getAttribute('data-sort');
            if (k === activeKey) {
                th.classList.add('sorted', sortState.dir === 'asc' ? 'asc' : 'desc');
            }
        });
    }

    function init() {
        if (typeof TABLE_PROJECT_ROWS === 'undefined') return;

        var table = document.getElementById('projects-table');
        if (!table) return;

        var thead = table.querySelector('thead');
        var tbody = table.querySelector('tbody');
        if (!thead || !tbody) return;

        function applySort() {
            var keyMap = {
                project: 'project',
                manager: 'manager',
                status: 'status',
                budget: 'budgetEur',
                deadline: 'deadline'
            };
            var sortKey = keyMap[sortState.key] || 'project';
            var sorted = sortRows(TABLE_PROJECT_ROWS, sortKey, sortState.dir);
            renderBody(tbody, sorted);
            updateHeaderClasses(thead, sortState.key);
        }

        thead.addEventListener('click', function (e) {
            var th = e.target.closest('th.sortable');
            if (!th) return;
            var col = th.getAttribute('data-sort');
            if (!col) return;

            if (sortState.key === col) {
                sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.key = col;
                sortState.dir = 'asc';
            }
            applySort();
        });

        applySort();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
