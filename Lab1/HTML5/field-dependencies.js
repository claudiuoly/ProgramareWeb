(function () {
    'use strict';

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function toISODateLocal(d) {
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function applyBirthDateBoundsFromAge(ageInput, birthInput) {
        var age = parseInt(ageInput.value, 10);
        if (!Number.isFinite(age) || age < 1 || age > 120) {
            birthInput.removeAttribute('min');
            birthInput.removeAttribute('max');
            return;
        }
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var maxD = new Date(today);
        maxD.setFullYear(maxD.getFullYear() - age);
        var minD = new Date(today);
        minD.setFullYear(minD.getFullYear() - age - 1);
        minD.setDate(minD.getDate() + 1);
        birthInput.min = toISODateLocal(minD);
        birthInput.max = toISODateLocal(maxD);
    }

    function computeAgeFromBirthISODate(isoStr) {
        if (!isoStr || typeof isoStr !== 'string') return null;
        var parts = isoStr.split('-');
        if (parts.length !== 3) return null;
        var y = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10) - 1;
        var day = parseInt(parts[2], 10);
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

    function initAgeBirthDateDependency() {
        var ageInput = document.getElementById('contact-age');
        var birthInput = document.getElementById('birth-date');
        if (!ageInput || !birthInput) return;

        function syncBoundsAndMaybeClearBirth() {
            applyBirthDateBoundsFromAge(ageInput, birthInput);
            if (birthInput.min && birthInput.max && birthInput.value) {
                if (birthInput.value < birthInput.min || birthInput.value > birthInput.max) {
                    birthInput.value = '';
                }
            }
        }

        ageInput.addEventListener('input', syncBoundsAndMaybeClearBirth);
        ageInput.addEventListener('change', syncBoundsAndMaybeClearBirth);

        birthInput.addEventListener('change', function () {
            var iso = birthInput.value;
            if (!iso) return;
            var computedAge = computeAgeFromBirthISODate(iso);
            if (computedAge !== null && computedAge >= 1 && computedAge <= 120) {
                ageInput.value = String(computedAge);
                applyBirthDateBoundsFromAge(ageInput, birthInput);
            }
        });

        syncBoundsAndMaybeClearBirth();
    }

    function initCountyLocalityDependency() {
        var countySelect = document.getElementById('contact-county');
        var localitySelect = document.getElementById('contact-locality');
        if (!countySelect || !localitySelect) return;
        if (typeof RO_COUNTIES_LOCALITIES === 'undefined') return;

        var counties = Object.keys(RO_COUNTIES_LOCALITIES).sort(function (a, b) {
            return a.localeCompare(b, 'ro');
        });

        countySelect.innerHTML = '';
        var opt0 = document.createElement('option');
        opt0.value = '';
        opt0.textContent = '\u2014 Alegeti judetul \u2014';
        countySelect.appendChild(opt0);
        counties.forEach(function (name) {
            var opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            countySelect.appendChild(opt);
        });

        localitySelect.innerHTML = '';
        var loc0 = document.createElement('option');
        loc0.value = '';
        loc0.textContent = '\u2014 Alegeti localitatea \u2014';
        localitySelect.appendChild(loc0);
        localitySelect.disabled = true;

        countySelect.addEventListener('change', function () {
            var county = countySelect.value;
            localitySelect.innerHTML = '';
            var first = document.createElement('option');
            first.value = '';
            first.textContent = '\u2014 Alegeti localitatea \u2014';
            localitySelect.appendChild(first);

            if (!county || !RO_COUNTIES_LOCALITIES[county]) {
                localitySelect.disabled = true;
                return;
            }

            localitySelect.disabled = false;
            var list = RO_COUNTIES_LOCALITIES[county].slice().sort(function (a, b) {
                return a.localeCompare(b, 'ro');
            });
            list.forEach(function (locName) {
                var o = document.createElement('option');
                o.value = locName;
                o.textContent = locName;
                localitySelect.appendChild(o);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initAgeBirthDateDependency();
        initCountyLocalityDependency();
    });
})();
