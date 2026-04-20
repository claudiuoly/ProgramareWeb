(function () {
    'use strict';

    function clearErrors(container) {
        container.querySelectorAll('.field-error').forEach(function (el) {
            el.classList.remove('field-error');
        });
    }

    function markInvalid(el) {
        if (!el) return;
        var form = el.form;
        if (el.type === 'radio' || el.type === 'checkbox') {
            var name = el.name;
            if (name && form) {
                var group = form.elements[name];
                if (group) {
                    if (typeof group.length === 'number' && group.length > 0 && group[0]) {
                        for (var i = 0; i < group.length; i++) {
                            group[i].classList.add('field-error');
                        }
                    } else if (group.classList) {
                        group.classList.add('field-error');
                    }
                    return;
                }
            }
            el.classList.add('field-error');
            return;
        }
        el.classList.add('field-error');
    }

    function setRadioGroupError(form, name) {
        var first = form.querySelector('input[name="' + name.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]');
        if (first) markInvalid(first);
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
    }

    function isNonEmpty(value) {
        return String(value).trim().length > 0;
    }

    function parsePositiveInt(value) {
        var n = parseInt(value, 10);
        return Number.isFinite(n) ? n : NaN;
    }

    function parseNumber(value) {
        var n = parseFloat(String(value).replace(',', '.'));
        return Number.isFinite(n) ? n : NaN;
    }

    function validateContactForm(e) {
        var form = e.target;
        clearErrors(form);
        var summary = form.querySelector('.form-error-summary');
        if (summary) summary.hidden = true;

        var ok = true;
        var name = form.querySelector('#contact-name');
        var email = form.querySelector('#contact-email');
        var password = form.querySelector('#contact-password');
        var phone = form.querySelector('#contact-phone');
        var website = form.querySelector('#contact-website');
        var age = form.querySelector('#contact-age');
        var birthDate = form.querySelector('#birth-date');
        var county = form.querySelector('#contact-county');
        var locality = form.querySelector('#contact-locality');
        var subject = form.querySelector('#contact-subject');
        var message = form.querySelector('#contact-message');
        var terms = form.querySelector('#contact-terms');
        var file = form.querySelector('#contact-file');

        if (!name || !isNonEmpty(name.value) || name.value.trim().length < 2) {
            markInvalid(name);
            ok = false;
        }
        if (!email || !isValidEmail(email.value)) {
            markInvalid(email);
            ok = false;
        }
        if (!password || password.value.length < 8) {
            markInvalid(password);
            ok = false;
        }
        if (!phone || !/^[\d\s+().-]{7,}$/.test(phone.value.trim())) {
            markInvalid(phone);
            ok = false;
        }
        if (website && isNonEmpty(website.value)) {
            try {
                // eslint-disable-next-line no-new
                new URL(website.value.trim());
            } catch (err) {
                markInvalid(website);
                ok = false;
            }
        }
        var ageNum = age ? parsePositiveInt(age.value) : NaN;
        if (!age || !Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
            markInvalid(age);
            ok = false;
        }
        if (!birthDate || !isNonEmpty(birthDate.value)) {
            markInvalid(birthDate);
            ok = false;
        } else if (birthDate.min && birthDate.max) {
            if (birthDate.value < birthDate.min || birthDate.value > birthDate.max) {
                markInvalid(birthDate);
                ok = false;
            }
        }
        if (!county || !isNonEmpty(county.value)) {
            markInvalid(county);
            ok = false;
        } else if (!locality || !isNonEmpty(locality.value)) {
            markInvalid(locality);
            ok = false;
        }
        if (!subject || !subject.value) {
            markInvalid(subject);
            ok = false;
        }
        if (!message || message.value.trim().length < 10) {
            markInvalid(message);
            ok = false;
        }
        var typeChecked = form.querySelector('input[name="contact_type"]:checked');
        if (!typeChecked) {
            setRadioGroupError(form, 'contact_type');
            ok = false;
        }
        if (!terms || !terms.checked) {
            markInvalid(terms);
            ok = false;
        }
        if (file && file.files && file.files.length > 0) {
            var f = file.files[0];
            if (f.size > 5 * 1024 * 1024) {
                markInvalid(file);
                ok = false;
            }
        }

        if (!ok) {
            e.preventDefault();
            if (summary) {
                summary.textContent = 'Corectati campurile marcate cu rosu.';
                summary.hidden = false;
            }
        }
    }

    function validateContractForm(e) {
        var form = e.target;
        clearErrors(form);
        var ok = true;

        var nume = form.querySelector('#contract-name');
        var suma = form.querySelector('#contract-budget');
        var manager = form.querySelector('#contract-manager');
        var mail = form.querySelector('#contract-email');
        var deadline = form.querySelector('#contract-deadline');
        var pass = form.querySelector('#contract-password');
        var desc = form.querySelector('#contract-desc');
        var file = form.querySelector('#contract-file');

        if (!nume || !isNonEmpty(nume.value) || nume.value.trim().length < 2 || nume.value.trim() === 'Nume') {
            markInvalid(nume);
            ok = false;
        }
        var budget = suma ? parseNumber(suma.value) : NaN;
        if (!suma || !Number.isFinite(budget) || budget <= 0) {
            markInvalid(suma);
            ok = false;
        }
        if (!manager || manager.value.trim().length < 2) {
            markInvalid(manager);
            ok = false;
        }
        if (!mail || !isValidEmail(mail.value)) {
            markInvalid(mail);
            ok = false;
        }
        if (!deadline || !isNonEmpty(deadline.value)) {
            markInvalid(deadline);
            ok = false;
        }
        if (!pass || pass.value.length < 6) {
            markInvalid(pass);
            ok = false;
        }
        if (!desc || desc.value.trim().length < 5 || desc.value.trim() === 'Text...') {
            markInvalid(desc);
            ok = false;
        }
        if (file && file.files && file.files.length > 0 && file.files[0].size > 5 * 1024 * 1024) {
            markInvalid(file);
            ok = false;
        }

        if (!ok) e.preventDefault();
    }

    function validateReportForm(e) {
        var form = e.target;
        clearErrors(form);
        var ok = true;

        var santier = form.querySelector('#report-site');
        var ciment = form.querySelector('#report-cement');
        var resp = form.querySelector('#report-resp');
        var mail = form.querySelector('#report-email');
        var dataRap = form.querySelector('#report-date');
        var comentarii = form.querySelector('#report-comments');
        var file = form.querySelector('#report-file');

        if (!santier || !isNonEmpty(santier.value) || santier.value.trim().length < 2 || santier.value.trim() === 'Cod') {
            markInvalid(santier);
            ok = false;
        }
        var cementVal = ciment ? parseNumber(ciment.value) : NaN;
        if (!ciment || !Number.isFinite(cementVal) || cementVal < 0 || cementVal > 5000) {
            markInvalid(ciment);
            ok = false;
        }
        if (!resp || resp.value.trim().length < 2) {
            markInvalid(resp);
            ok = false;
        }
        if (!mail || !isValidEmail(mail.value)) {
            markInvalid(mail);
            ok = false;
        }
        if (!dataRap || !isNonEmpty(dataRap.value)) {
            markInvalid(dataRap);
            ok = false;
        }
        if (!comentarii || comentarii.value.trim().length < 4 || comentarii.value.trim() === 'Text...') {
            markInvalid(comentarii);
            ok = false;
        }
        if (file && file.files && file.files.length > 0 && file.files[0].size > 5 * 1024 * 1024) {
            markInvalid(file);
            ok = false;
        }

        if (!ok) e.preventDefault();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var contact = document.getElementById('form-contact');
        if (contact) contact.addEventListener('submit', validateContactForm);

        var contract = document.getElementById('form-contract');
        if (contract) contract.addEventListener('submit', validateContractForm);

        var report = document.getElementById('form-report');
        if (report) report.addEventListener('submit', validateReportForm);
    });
})();
