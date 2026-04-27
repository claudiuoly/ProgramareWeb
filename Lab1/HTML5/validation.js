(function ($) {
    'use strict';

    function clearErrors($form) {
        $form.find('.field-error').removeClass('field-error');
    }

    function markInvalid($form, $el) {
        if (!$el || !$el.length) return;
        var el = $el[0];
        if (el.type === 'radio' || el.type === 'checkbox') {
            var name = el.name;
            if (name) {
                $form
                    .find('input')
                    .filter(function () {
                        return this.name === name;
                    })
                    .addClass('field-error');
            } else {
                $el.addClass('field-error');
            }
            return;
        }
        $el.addClass('field-error');
    }

    function setRadioGroupError($form, name) {
        var $g = $form.find('input').filter(function () {
            return this.name === name;
        });
        if ($g.length) markInvalid($form, $g.first());
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
        var $form = $(this);
        clearErrors($form);
        var $summary = $form.find('.form-error-summary');
        $summary.prop('hidden', true);

        var ok = true;
        var $name = $form.find('#contact-name');
        if (!$name.val() || $name.val().trim().length < 2) {
            markInvalid($form, $name);
            ok = false;
        }
        var $email = $form.find('#contact-email');
        if (!isValidEmail($email.val() || '')) {
            markInvalid($form, $email);
            ok = false;
        }
        var $pass = $form.find('#contact-password');
        if (!$pass.val() || $pass.val().length < 8) {
            markInvalid($form, $pass);
            ok = false;
        }
        var $phone = $form.find('#contact-phone');
        if (!$phone.val() || !/^[\d\s+().-]{7,}$/.test($phone.val().trim())) {
            markInvalid($form, $phone);
            ok = false;
        }
        var $website = $form.find('#contact-website');
        if ($website.val() && isNonEmpty($website.val())) {
            try {
                // eslint-disable-next-line no-new
                new URL($website.val().trim());
            } catch (err) {
                markInvalid($form, $website);
                ok = false;
            }
        }
        var $age = $form.find('#contact-age');
        var ageNum = parsePositiveInt($age.val() || '');
        if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
            markInvalid($form, $age);
            ok = false;
        }
        var $birth = $form.find('#birth-date');
        if (!$birth.val()) {
            markInvalid($form, $birth);
            ok = false;
        } else {
            var bmin = $birth.attr('min');
            var bmax = $birth.attr('max');
            var bv = $birth.val();
            if (bmin && bmax && (bv < bmin || bv > bmax)) {
                markInvalid($form, $birth);
                ok = false;
            }
        }
        var $county = $form.find('#contact-county');
        if (!$county.val()) {
            markInvalid($form, $county);
            ok = false;
        } else {
            var $loc = $form.find('#contact-locality');
            if (!$loc.val()) {
                markInvalid($form, $loc);
                ok = false;
            }
        }
        var $subject = $form.find('#contact-subject');
        if (!$subject.val()) {
            markInvalid($form, $subject);
            ok = false;
        }
        var $message = $form.find('#contact-message');
        if (!$message.val() || $message.val().trim().length < 10) {
            markInvalid($form, $message);
            ok = false;
        }
        if (!$form.find('input[name="contact_type"]:checked').length) {
            setRadioGroupError($form, 'contact_type');
            ok = false;
        }
        var $terms = $form.find('#contact-terms');
        if (!$terms.prop('checked')) {
            markInvalid($form, $terms);
            ok = false;
        }
        var $file = $form.find('#contact-file');
        var f = $file[0] && $file[0].files && $file[0].files[0];
        if (f && f.size > 5 * 1024 * 1024) {
            markInvalid($form, $file);
            ok = false;
        }

        if (!ok) {
            e.preventDefault();
            $summary.text('Corectati campurile marcate cu rosu.').prop('hidden', false);
        }
    }

    function validateContractForm(e) {
        var $form = $(this);
        clearErrors($form);
        var ok = true;

        var $nume = $form.find('#contract-name');
        var v = $nume.val() && $nume.val().trim();
        if (!v || v.length < 2 || v === 'Nume') {
            markInvalid($form, $nume);
            ok = false;
        }
        var $suma = $form.find('#contract-budget');
        var budget = parseNumber($suma.val() || '');
        if (!Number.isFinite(budget) || budget <= 0) {
            markInvalid($form, $suma);
            ok = false;
        }
        var $man = $form.find('#contract-manager');
        if (!$man.val() || $man.val().trim().length < 2) {
            markInvalid($form, $man);
            ok = false;
        }
        var $mail = $form.find('#contract-email');
        if (!isValidEmail($mail.val() || '')) {
            markInvalid($form, $mail);
            ok = false;
        }
        var $dead = $form.find('#contract-deadline');
        if (!$dead.val()) {
            markInvalid($form, $dead);
            ok = false;
        }
        var $pw = $form.find('#contract-password');
        if (!$pw.val() || $pw.val().length < 6) {
            markInvalid($form, $pw);
            ok = false;
        }
        var $desc = $form.find('#contract-desc');
        var d = $desc.val() && $desc.val().trim();
        if (!d || d.length < 5 || d === 'Text...') {
            markInvalid($form, $desc);
            ok = false;
        }
        var $f = $form.find('#contract-file');
        var file = $f[0] && $f[0].files && $f[0].files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            markInvalid($form, $f);
            ok = false;
        }

        if (!ok) e.preventDefault();
    }

    function validateReportForm(e) {
        var $form = $(this);
        clearErrors($form);
        var ok = true;

        var $s = $form.find('#report-site');
        var sv = $s.val() && $s.val().trim();
        if (!sv || sv.length < 2 || sv === 'Cod') {
            markInvalid($form, $s);
            ok = false;
        }
        var $c = $form.find('#report-cement');
        var ce = parseNumber($c.val() || '');
        if (!Number.isFinite(ce) || ce < 0 || ce > 5000) {
            markInvalid($form, $c);
            ok = false;
        }
        var $r = $form.find('#report-resp');
        if (!$r.val() || $r.val().trim().length < 2) {
            markInvalid($form, $r);
            ok = false;
        }
        var $m = $form.find('#report-email');
        if (!isValidEmail($m.val() || '')) {
            markInvalid($form, $m);
            ok = false;
        }
        var $d = $form.find('#report-date');
        if (!$d.val()) {
            markInvalid($form, $d);
            ok = false;
        }
        var $com = $form.find('#report-comments');
        var cv = $com.val() && $com.val().trim();
        if (!cv || cv.length < 4 || cv === 'Text...') {
            markInvalid($form, $com);
            ok = false;
        }
        var $fl = $form.find('#report-file');
        var fe = $fl[0] && $fl[0].files && $fl[0].files[0];
        if (fe && fe.size > 5 * 1024 * 1024) {
            markInvalid($form, $fl);
            ok = false;
        }

        if (!ok) e.preventDefault();
    }

    $(function () {
        $('#form-contact').on('submit', validateContactForm);
        $('#form-contract').on('submit', validateContractForm);
        $('#form-report').on('submit', validateReportForm);
    });
})(jQuery);
