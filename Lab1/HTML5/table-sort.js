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
        action: 'Actiuni',
        del: 'Stergere'
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
            $tr.append(
                $('<td></td>')
                    .attr('data-label', LABELS.del)
                    .append(
                        $('<button type="button">sterge</button>').addClass('tbl-del').data('project', row.project)
                    )
            );
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
        var $dlg = $('#del-confirm');
        var pending = null;

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

        $table.on('click', '.tbl-del', function () {
            pending = $(this).data('project');
            if ($dlg.length) $dlg[0].showModal();
        });
        $('#del-yes').on('click', function () {
            if (pending) {
                var i;
                for (i = 0; i < TABLE_PROJECT_ROWS.length; i++) {
                    if (TABLE_PROJECT_ROWS[i].project === pending) {
                        break;
                    }
                }
                if (i < TABLE_PROJECT_ROWS.length) {
                    TABLE_PROJECT_ROWS.splice(i, 1);
                }
                pending = null;
                if ($dlg.length) $dlg[0].close();
                applySort($table);
                $(document).trigger('projects-data-changed');
            }
        });
        $('#del-no').on('click', function () {
            pending = null;
            if ($dlg.length) $dlg[0].close();
        });

        applySort($table);
    });
})(jQuery);
