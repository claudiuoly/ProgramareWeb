(function ($) {
    'use strict';

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function toISODateLocal(d) {
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function applyBirthDateBoundsFromAge($age, $birth) {
        var age = parseInt($age.val(), 10);
        if (!Number.isFinite(age) || age < 1 || age > 120) {
            $birth.removeAttr('min').removeAttr('max');
            return;
        }
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var maxD = new Date(today);
        maxD.setFullYear(maxD.getFullYear() - age);
        var minD = new Date(today);
        minD.setFullYear(minD.getFullYear() - age - 1);
        minD.setDate(minD.getDate() + 1);
        $birth.attr('min', toISODateLocal(minD)).attr('max', toISODateLocal(maxD));
    }

    function computeAgeFromBirthISODate(isoStr) {
        if (!isoStr || typeof isoStr !== 'string') return null;
        var p = isoStr.split('-');
        if (p.length !== 3) return null;
        var y = parseInt(p[0], 10);
        var m = parseInt(p[1], 10) - 1;
        var day = parseInt(p[2], 10);
        if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return null;
        var birth = new Date(y, m, day);
        if (birth.getFullYear() !== y || birth.getMonth() !== m || birth.getDate() !== day) return null;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        birth.setHours(0, 0, 0, 0);
        var age = today.getFullYear() - birth.getFullYear();
        var md = today.getMonth() - birth.getMonth();
        if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) {
            age -= 1;
        }
        return age;
    }

    function initAgeBirth($age, $birth) {
        function sync() {
            applyBirthDateBoundsFromAge($age, $birth);
            var bmin = $birth.attr('min');
            var bmax = $birth.attr('max');
            var v = $birth.val();
            if (bmin && bmax && v && (v < bmin || v > bmax)) {
                $birth.val('');
            }
        }

        $age.on('input change', sync);
        $birth.on('change', function () {
            var iso = $birth.val();
            if (!iso) return;
            var a = computeAgeFromBirthISODate(iso);
            if (a !== null && a >= 1 && a <= 120) {
                $age.val(String(a));
                applyBirthDateBoundsFromAge($age, $birth);
            }
        });
        sync();
    }

    function initCountyLocality($county, $locality) {
        if (typeof RO_COUNTIES_LOCALITIES === 'undefined') return;
        var counties = Object.keys(RO_COUNTIES_LOCALITIES).sort(function (a, b) {
            return a.localeCompare(b, 'ro');
        });
        $county
            .empty()
            .append(
                $('<option></option>').val('').text('\u2014 Alegeti judetul \u2014')
            );
        $.each(counties, function (_, name) {
            $county.append($('<option></option>').val(name).text(name));
        });
        $locality
            .empty()
            .append($('<option></option>').val('').text('\u2014 Alegeti localitatea \u2014'))
            .prop('disabled', true);

        $county.on('change', function () {
            var county = $county.val();
            $locality.empty().append(
                $('<option></option>').val('').text('\u2014 Alegeti localitatea \u2014')
            );
            if (!county || !RO_COUNTIES_LOCALITIES[county]) {
                $locality.prop('disabled', true);
                return;
            }
            $locality.prop('disabled', false);
            var list = RO_COUNTIES_LOCALITIES[county]
                .slice()
                .sort(function (a, b) {
                    return a.localeCompare(b, 'ro');
                });
            $.each(list, function (_, locName) {
                $locality.append($('<option></option>').val(locName).text(locName));
            });
        });
    }

    $(function () {
        var $age = $('#contact-age');
        var $birth = $('#birth-date');
        if ($age.length && $birth.length) initAgeBirth($age, $birth);

        var $c = $('#contact-county');
        var $l = $('#contact-locality');
        if ($c.length && $l.length) initCountyLocality($c, $l);
    });
})(jQuery);
