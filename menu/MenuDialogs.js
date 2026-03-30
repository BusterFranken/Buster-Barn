// =============================================================================
// MenuDialogs.js — Win95-style DOM dialog boxes for the landing page
// Separate from the Phaser-based DialogSystem used in-game.
// =============================================================================

const MenuDialogs = (() => {

  // -------------------------------------------------------------------------
  // Core: create a dialog overlay + window
  // -------------------------------------------------------------------------

  function _create(title, bodyHTML, buttons, options) {
    options = options || {};

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    // Window
    const win = document.createElement('div');
    win.className = 'dialog-window';
    if (options.width) win.style.width = options.width + 'px';

    // Title bar
    const titlebar = document.createElement('div');
    titlebar.className = 'dialog-titlebar';

    const titleText = document.createElement('span');
    titleText.className = 'dialog-titlebar-text';
    titleText.textContent = title;
    titlebar.appendChild(titleText);

    const closeBtn = document.createElement('div');
    closeBtn.className = 'dialog-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.onclick = function() { _close(overlay, options.onClose); };
    titlebar.appendChild(closeBtn);

    win.appendChild(titlebar);

    // Body
    const body = document.createElement('div');
    body.className = 'dialog-body';
    body.innerHTML = bodyHTML;
    win.appendChild(body);

    // Buttons
    if (buttons && buttons.length > 0) {
      const btnRow = document.createElement('div');
      btnRow.className = 'dialog-buttons';

      buttons.forEach(function(btn) {
        const el = document.createElement('button');
        el.className = 'dialog-btn' + (btn.primary ? ' primary' : '');
        el.textContent = btn.label;
        el.onclick = function() {
          if (btn.action) btn.action(overlay);
          if (btn.close !== false) _close(overlay);
        };
        btnRow.appendChild(el);
      });

      win.appendChild(btnRow);
    }

    overlay.appendChild(win);
    document.body.appendChild(overlay);

    // Close on Escape
    const escHandler = function(e) {
      if (e.key === 'Escape') {
        _close(overlay, options.onClose);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Close on overlay click (outside dialog)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        _close(overlay, options.onClose);
      }
    });

    // Focus first button or input
    setTimeout(function() {
      const focusable = win.querySelector('.dialog-btn.primary, .dialog-btn, .dialog-input');
      if (focusable) focusable.focus();
    }, 50);

    return { overlay: overlay, window: win, body: body };
  }

  function _close(overlay, onClose) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    if (onClose) onClose();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  function alert(title, message, onOk) {
    _create(title, '<p style="margin:0 0 8px">' + _esc(message) + '</p>', [
      { label: 'OK', primary: true, action: onOk }
    ]);
  }

  function confirm(title, message, onYes, onNo) {
    _create(title, '<p style="margin:0 0 8px">' + _esc(message) + '</p>', [
      { label: 'Yes', primary: true, action: onYes },
      { label: 'No', action: onNo }
    ]);
  }

  function prompt(title, message, defaultVal, onOk) {
    const ref = _create(title,
      '<p style="margin:0">' + _esc(message) + '</p>' +
      '<input class="dialog-input" type="text" value="' + _esc(defaultVal) + '">',
      [
        { label: 'OK', primary: true, action: function() {
          const input = ref.body.querySelector('.dialog-input');
          if (onOk) onOk(input.value);
        }},
        { label: 'Cancel' }
      ]
    );

    // Select input text
    setTimeout(function() {
      const input = ref.body.querySelector('.dialog-input');
      if (input) { input.focus(); input.select(); }
    }, 60);

    // Enter key submits
    ref.body.querySelector('.dialog-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        if (onOk) onOk(this.value);
        _close(ref.overlay);
      }
    });
  }

  /**
   * Custom dialog with arbitrary HTML body.
   * @param {string} title
   * @param {string} bodyHTML
   * @param {Array} buttons - [{ label, primary, action, close }]
   * @param {object} options - { width, onClose }
   * @returns {{ overlay, window, body }}
   */
  function custom(title, bodyHTML, buttons, options) {
    return _create(title, bodyHTML, buttons, options);
  }

  /**
   * Show a brief toast message at the bottom of the screen.
   */
  function toast(message, duration) {
    duration = duration || 2000;
    const el = document.createElement('div');
    el.className = 'status-toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, duration);
  }

  // HTML-escape helper
  function _esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { alert: alert, confirm: confirm, prompt: prompt, custom: custom, toast: toast };

})();
