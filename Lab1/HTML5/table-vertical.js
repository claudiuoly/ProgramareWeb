(function () {
    'use strict';

    var columnOrder = [];
    var sortState = {
        field: 'project',
        dir: 'asc'
    };

    var ROW_FIELDS = [
        { field: 'project', label: 'Nume Proiect' },
        { field: 'manager', label: 'Manager' },
        { field: 'status', label: 'Status' },
        { field: 'budget', label: 'Buget' },
        { field: 'deadline', label: 'Termen Limita' },
        { field: 'action', label: 'Actiuni' }
    ];

    function compareProjectsByField(indexA, indexB, field) {
        var a = TABLE_PROJECT_ROWS[indexA];
        var b = TABLE_PROJECT_ROWS[indexB];
        if (field === 'budget') {
            if (a.budgetEur === b.budgetEur) return 0;
            return a.budgetEur < b.budgetEur ? -1 : 1;
        }
        if (field === 'deadline') {
            if (a.deadline === b.deadline) return 0;
            return a.deadline < b.deadline ? -1 : 1;
        }
        var va = String(a[field]).toLocaleLowerCase('ro');
        var vb = String(b[field]).toLocaleLowerCase('ro');
        return va.localeCompare(vb, 'ro');
    }

    function applyColumnSort() {
        var field = sortState.field;
        var dir = sortState.dir;
        columnOrder.sort(function (a, b) {
            var c = compareProjectsByField(a, b, field);
            return dir === 'asc' ? c : -c;
        });
    }

    function formatCell(row, field) {
        if (field === 'budget') {
            return (
                row.budgetEur.toLocaleString('ro-RO', { maximumFractionDigits: 0 }) +
                ' EUR'
            );
        }
        return row[field];
    }

    function renderVerticalTable() {
        var table = document.getElementById('projects-table-vertical');
        if (!table || typeof TABLE_PROJECT_ROWS === 'undefined') return;

        var thead = table.querySelector('thead');
        var tbody = table.querySelector('tbody');
        if (!thead || !tbody) return;

        thead.textContent = '';
        tbody.textContent = '';

        var headRow = document.createElement('tr');
        var corner = document.createElement('th');
        corner.className = 'vertical-corner';
        corner.scope = 'col';
        corner.textContent = 'Proiect';
        headRow.appendChild(corner);

        columnOrder.forEach(function (rowIndex) {
            var th = document.createElement('th');
            th.scope = 'col';
            th.textContent = TABLE_PROJECT_ROWS[rowIndex].project;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);

        ROW_FIELDS.forEach(function (rowDef) {
            var tr = document.createElement('tr');
            var th = document.createElement('th');
            th.scope = 'row';
            th.textContent = rowDef.label;
            if (rowDef.field === 'action') {
                th.className = 'row-header-static';
                th.title = '';
            } else {
                th.className = 'sortable-row-header';
                th.setAttribute('data-sort-field', rowDef.field);
                th.title = 'Sortati coloanele dupa: ' + rowDef.label;
                if (sortState.field === rowDef.field) {
                    th.classList.add('sorted', sortState.dir === 'asc' ? 'asc' : 'desc');
                }
            }
            tr.appendChild(th);

            columnOrder.forEach(function (rowIndex) {
                var td = document.createElement('td');
                td.setAttribute('data-label', rowDef.label);
                td.textContent = formatCell(TABLE_PROJECT_ROWS[rowIndex], rowDef.field);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    function init() {
        if (typeof TABLE_PROJECT_ROWS === 'undefined' || !TABLE_PROJECT_ROWS.length) return;

        var table = document.getElementById('projects-table-vertical');
        if (!table) return;

        columnOrder = TABLE_PROJECT_ROWS.map(function (_, i) {
            return i;
        });
        applyColumnSort();
        renderVerticalTable();

        table.querySelector('tbody').addEventListener('click', function (e) {
            var th = e.target.closest('th.sortable-row-header');
            if (!th) return;
            var field = th.getAttribute('data-sort-field');
            if (!field) return;

            if (sortState.field === field) {
                sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.field = field;
                sortState.dir = 'asc';
            }
            applyColumnSort();
            renderVerticalTable();
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
