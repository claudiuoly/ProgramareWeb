(function ($) {
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
        return String(a[field])
            .toLocaleLowerCase('ro')
            .localeCompare(String(b[field]).toLocaleLowerCase('ro'), 'ro');
    }

    function applyColumnSort() {
        var f = sortState.field;
        var dir = sortState.dir;
        columnOrder.sort(function (a, b) {
            var c = compareProjectsByField(a, b, f);
            return dir === 'asc' ? c : -c;
        });
    }

    function formatCell(row, field) {
        if (field === 'budget') {
            return row.budgetEur.toLocaleString('ro-RO', { maximumFractionDigits: 0 }) + ' EUR';
        }
        return row[field];
    }

    function renderVerticalTable() {
        var $table = $('#projects-table-vertical');
        if (!$table.length || typeof TABLE_PROJECT_ROWS === 'undefined') return;
        if (!TABLE_PROJECT_ROWS.length) {
            $table.find('thead').empty();
            $table.find('tbody').html('<tr><td colspan="2">Nu mai sunt proiecte.</td></tr>');
            return;
        }
        var $thead = $table.find('thead').empty();
        var $tbody = $table.find('tbody').empty();

        var $headRow = $('<tr></tr>').append(
            $('<th></th>').addClass('vertical-corner').attr('scope', 'col').text('Proiect')
        );
        $.each(columnOrder, function (_, rowIndex) {
            $headRow.append(
                $('<th></th>').attr('scope', 'col').text(TABLE_PROJECT_ROWS[rowIndex].project)
            );
        });
        $thead.append($headRow);

        $.each(ROW_FIELDS, function (_, rowDef) {
            var $tr = $('<tr></tr>');
            var $th = $('<th></th>').attr('scope', 'row').text(rowDef.label);
            if (rowDef.field === 'action') {
                $th.addClass('row-header-static');
            } else {
                $th.addClass('sortable-row-header')
                    .attr('data-sort-field', rowDef.field)
                    .attr('title', 'Sortati coloanele dupa: ' + rowDef.label);
                if (sortState.field === rowDef.field) {
                    $th.addClass('sorted ' + (sortState.dir === 'asc' ? 'asc' : 'desc'));
                }
            }
            $tr.append($th);
            $.each(columnOrder, function (_, rowIndex) {
                $tr.append(
                    $('<td></td>')
                        .attr('data-label', rowDef.label)
                        .text(formatCell(TABLE_PROJECT_ROWS[rowIndex], rowDef.field))
                );
            });
            $tbody.append($tr);
        });
    }

    $(function () {
        if (typeof TABLE_PROJECT_ROWS === 'undefined' || !TABLE_PROJECT_ROWS.length) return;
        var $table = $('#projects-table-vertical');
        if (!$table.length) return;

        columnOrder = $.map(TABLE_PROJECT_ROWS, function (_, i) {
            return i;
        });
        applyColumnSort();
        renderVerticalTable();

        $table.on('click', 'th.sortable-row-header', function () {
            var field = $(this).attr('data-sort-field');
            if (field == null) return;
            if (sortState.field === field) {
                sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.field = field;
                sortState.dir = 'asc';
            }
            applyColumnSort();
            renderVerticalTable();
        });

        $(document).on('projects-data-changed', function () {
            if (typeof TABLE_PROJECT_ROWS === 'undefined' || !TABLE_PROJECT_ROWS.length) return;
            columnOrder = $.map(TABLE_PROJECT_ROWS, function (_, i) {
                return i;
            });
            applyColumnSort();
            renderVerticalTable();
        });
    });
})(jQuery);
