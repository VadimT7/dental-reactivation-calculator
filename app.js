/**
 * Dental Patient Reactivation Calculator
 * Conversion-optimized: count-up animation, loss framing, email capture after reveal.
 */
(function () {
  'use strict';

  // Recovery rate: 14% of lapsed patients are recoverable via reactivation campaigns
  var RECOVERY_RATE = 0.14;

  // Monthly attrition: assume ~1/12 of lapsed pool permanently leaves per month
  // (i.e., the competitive window closes)
  var MONTHLY_PERMANENT_LOSS_RATE = 1 / 12;

  // Calendly placeholder — replace with actual link
  var CALENDLY_URL = 'https://calendly.com/tuchila-vadim/introduction-with-vadim';

  // DOM refs
  var form = document.getElementById('calcForm');
  var resultsEl = document.getElementById('results');
  var amountEl = document.getElementById('resultsAmount');
  var monthlyEl = document.getElementById('resultsMonthly');
  var pillLapsed = document.getElementById('pillLapsed');
  var pillRecoverable = document.getElementById('pillRecoverable');
  var pillAvg = document.getElementById('pillAvg');
  var urgencyCount = document.getElementById('urgencyCount');
  var captureAmount = document.getElementById('captureAmount');
  var captureBox = document.getElementById('captureBox');
  var captureForm = document.getElementById('captureForm');
  var captureSuccess = document.getElementById('captureSuccess');
  var captureError = document.getElementById('captureError');
  var ctaBtn = document.getElementById('ctaBtn'); // may be null
  var shortcutCtaBtn = document.getElementById('shortcutCtaBtn'); // may be null

  var fields = [
    {
      id: 'totalPatients',
      errorId: 'totalPatientsError',
      validate: function (v) {
        if (!v || v < 1) return 'Enter a positive number';
        if (!Number.isInteger(Number(v))) return 'Enter a whole number';
        return '';
      }
    },
    {
      id: 'lapsedPct',
      errorId: 'lapsedPctError',
      validate: function (v) {
        if (!v || v < 1) return 'Enter a percentage (1–100)';
        if (v > 100) return 'Cannot exceed 100%';
        return '';
      }
    },
    {
      id: 'avgTreatment',
      errorId: 'avgTreatmentError',
      validate: function (v) {
        if (!v || v < 1) return 'Enter a positive dollar amount';
        return '';
      }
    }
  ];

  if (ctaBtn) ctaBtn.href = CALENDLY_URL;
  if (shortcutCtaBtn) shortcutCtaBtn.href = CALENDLY_URL;

  // Format helpers
  function formatCurrency(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function formatNumber(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  // Easing function for smooth count-up
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  // Animated count-up on an element
  function countUp(el, from, to, duration, formatter) {
    var start = performance.now();
    function frame(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutExpo(progress);
      var value = from + (to - from) * eased;
      el.textContent = formatter(value);
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = formatter(to);
    }
    requestAnimationFrame(frame);
  }

  // Validate a single calculator field
  function validateField(field) {
    var input = document.getElementById(field.id);
    var errorEl = document.getElementById(field.errorId);
    var value = parseFloat(input.value);
    var msg = field.validate(value);

    if (msg) {
      input.classList.add('input-error');
      errorEl.textContent = msg;
      return false;
    }

    input.classList.remove('input-error');
    errorEl.textContent = '';
    return true;
  }

  // Clear error on input
  fields.forEach(function (field) {
    var input = document.getElementById(field.id);
    input.addEventListener('input', function () {
      var errorEl = document.getElementById(field.errorId);
      input.classList.remove('input-error');
      errorEl.textContent = '';
    });
  });

  // ===== Calculator submit =====
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var allValid = true;
    fields.forEach(function (field) {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) return;

    var totalPatients = parseFloat(document.getElementById('totalPatients').value);
    var lapsedPct = parseFloat(document.getElementById('lapsedPct').value);
    var avgTreatment = parseFloat(document.getElementById('avgTreatment').value);

    var lapsedCount = Math.round(totalPatients * (lapsedPct / 100));
    var recoverableCount = Math.round(lapsedCount * RECOVERY_RATE);
    var totalRevenue = recoverableCount * avgTreatment;
    var monthlyRevenue = totalRevenue / 12;
    var monthlyLossPatients = Math.max(1, Math.round(lapsedCount * MONTHLY_PERMANENT_LOSS_RATE * RECOVERY_RATE));

    // Show results container
    resultsEl.hidden = false;

    // Count-up animation on main dollar amount (1.6s — long enough to feel dramatic)
    countUp(amountEl, 0, totalRevenue, 1600, formatCurrency);

    // Pulse effect right after
    amountEl.classList.remove('pulsing');
    void amountEl.offsetWidth; // reflow
    amountEl.classList.add('pulsing');

    // Monthly loss framing (shorter animation)
    var monthlyStr = formatCurrency(monthlyRevenue);
    monthlyEl.innerHTML = 'That\'s <strong>' + monthlyStr + '/month</strong> walking out your door.';

    // Pills count up in parallel
    countUp(pillLapsed.querySelector('.pill-value'), 0, lapsedCount, 1400, formatNumber);
    countUp(pillRecoverable.querySelector('.pill-value'), 0, recoverableCount, 1400, formatNumber);
    countUp(pillAvg.querySelector('.pill-value'), 0, avgTreatment, 1400, formatCurrency);

    // Urgency + capture personalization
    urgencyCount.textContent = formatNumber(monthlyLossPatients);
    captureAmount.textContent = formatCurrency(totalRevenue);

    // Reset capture state if user recalculates
    captureBox.hidden = false;
    captureSuccess.hidden = true;

    // Smooth scroll to results (with small delay for animation start)
    setTimeout(function () {
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  });

  // ===== Email capture submit =====
  captureForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var emailInput = document.getElementById('captureEmail');
    var email = emailInput.value.trim();

    // Reset errors
    emailInput.classList.remove('input-error');
    captureError.textContent = '';

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      emailInput.classList.add('input-error');
      captureError.textContent = 'Please enter a valid practice email.';
      return;
    }

    // Disable button during "submit"
    var submitBtn = captureForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Simulate async submit (replace with real endpoint)
    // In production: fetch('/api/lead', { method: 'POST', body: JSON.stringify({ name, email, amount: ... }) })
    setTimeout(function () {
      // Persist locally so we don't lose the lead if backend isn't wired yet
      try {
        var totalPatients = document.getElementById('totalPatients').value;
        var lapsedPct = document.getElementById('lapsedPct').value;
        var avgTreatment = document.getElementById('avgTreatment').value;
        var lead = {
          email: email,
          totalPatients: totalPatients,
          lapsedPct: lapsedPct,
          avgTreatment: avgTreatment,
          recoveryAmount: captureAmount.textContent,
          capturedAt: new Date().toISOString()
        };
        var existing = JSON.parse(localStorage.getItem('dz_leads') || '[]');
        existing.push(lead);
        localStorage.setItem('dz_leads', JSON.stringify(existing));
      } catch (err) {
        // Storage may be unavailable (private mode, etc.) — fail silently
      }

      captureBox.hidden = true;
      captureSuccess.hidden = false;

      // Scroll success into view
      setTimeout(function () {
        captureSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }, 600);
  });
})();
