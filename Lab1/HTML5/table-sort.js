(function ($) {
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
        if (key === 'budgetEur') {
            if (a.budgetEur === b.budgetEur) return 0;
            return a.budgetEur < b.budgetEur ? -1 : 1;
        }
        if (key === 'deadline') {
            if (a.deadline === b.deadline) return 0;
            return a.deadline < b.deadline ? -1 : 1;
        }
        return String(a[key])
            .toLocaleLowerCase('ro')
            .localeCompare(String(b[key]).toLocaleLowerCase('ro'), 'ro');
    }

    function sortRows(rows, key, dir) {
        return rows.slice().sort(function (a, b) {
            var c = compareRows(a, b, key);
            return dir === 'asc' ? c : -c;
        });
    }

    function formatBudget(n) {
        return n.toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' EUR';
    }

    function renderBody($tbody, rows) {
        $tbody.empty();
        $.each(rows, function (_, row) {
            var $tr = $('<tr></tr>');
            function cell(k, text) {
                $tr.append(
                    $('<td></td>').attr('data-label', LABELS[k]).text(text)
                );
            }
            cell('project', row.project);
            cell('manager', row.manager);
            cell('status', row.status);
            cell('budget', formatBudget(row.budgetEur));
            cell('deadline', row.deadline);
            cell('action', row.action);
            $tbody.append($tr);
        });
    }

    function updateHeaderClasses($thead) {
        $thead.find('th.sortable').each(function () {
            var $th = $(this);
            $th.removeClass('sorted asc desc');
            if ($th.attr('data-sort') === sortState.key) {
                $th.addClass('sorted ' + (sortState.dir === 'asc' ? 'asc' : 'desc'));
            }
        });
    }

    function applySort($table) {
        var keyMap = {
            project: 'project',
            manager: 'manager',
            status: 'status',
            budget: 'budgetEur',
            deadline: 'deadline'
        };
        var sortKey = keyMap[sortState.key] || 'project';
        var sorted = sortRows(TABLE_PROJECT_ROWS, sortKey, sortState.dir);
        renderBody($table.find('tbody'), sorted);
        updateHeaderClasses($table.find('thead'));
    }

    $(function () {
        if (typeof TABLE_PROJECT_ROWS === 'undefined') return;
        var $table = $('#projects-table');
        if (!$table.length) return;
        var $thead = $table.find('thead');
        $thead.on('click', 'th.sortable', function () {
            var col = $(this).attr('data-sort');
            if (col == null) return;
            if (sortState.key === col) {
                sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.key = col;
                sortState.dir = 'asc';
            }
            applySort($table);
        });
        applySort($table);
    });
})(jQuery);
