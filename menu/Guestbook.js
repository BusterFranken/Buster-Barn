// =============================================================================
// Guestbook.js — 90s-style guestbook with localStorage persistence
// =============================================================================

const Guestbook = (() => {

  var STORAGE_KEY = 'mooquest_guestbook';

  // Pre-seeded entries for flavor
  var seedEntries = [
    { name: 'xX_CowSlayer_Xx', message: 'This game is SO radical!! Beat World 1 on my first try B-)', date: 881884800000 },
    { name: 'MooFan97', message: 'Violet is my favorite character ever!!!', date: 882489600000 },
    { name: 'WebMaster_Dave', message: 'Cool site! Check out my page at http://geocities.com/~dave', date: 883094400000 },
    { name: 'PurpleCowLuvr', message: 'I <3 this game! Baron Beige will pay for what he did!', date: 884304000000 },
    { name: 'L33tG4m3r', message: 'first!!1! also this game pwns', date: 880675200000 },
    { name: 'CrystalCathy', message: 'The Crystal Caves level is beautiful! Great pixel art team!', date: 885513600000 },
    { name: 'Anon_Visitor', message: 'Just signed the guestbook. Keep up the good work!', date: 886118400000 },
  ];

  function open() {
    var entries = _load();
    var html = _buildHTML(entries);

    var ref = MenuDialogs.custom('\ud83d\udcd6 Guestbook \u2014 Sign & Read!', html, [
      { label: 'Close', primary: true }
    ], { width: 520, onClose: function() {} });

    // Wire sign button
    setTimeout(function() {
      var signBtn = document.getElementById('gb-sign-btn');
      if (signBtn) {
        signBtn.addEventListener('click', function() {
          _signPrompt(ref);
        });
      }
    }, 50);
  }

  function _signPrompt(parentRef) {
    var defaultName = GameState.profile.name || 'Anonymous';
    var html =
      '<div style="margin-bottom:8px">' +
        '<label style="font-size:13px;font-weight:bold">Your Name:</label>' +
        '<input id="gb-name" class="dialog-input" type="text" maxlength="20" value="' + _esc(defaultName) + '">' +
      '</div>' +
      '<div>' +
        '<label style="font-size:13px;font-weight:bold">Your Message:</label>' +
        '<textarea id="gb-msg" style="width:100%;height:60px;padding:4px 6px;background:#fff;' +
          'border:2px solid;border-color:#404040 #dfdfdf #dfdfdf #404040;font-family:Segoe UI,Tahoma,sans-serif;' +
          'font-size:13px;resize:none;box-sizing:border-box;margin-top:4px" maxlength="140" ' +
          'placeholder="Write something nice..."></textarea>' +
        '<div style="font-size:11px;color:#808080;text-align:right">Max 140 characters</div>' +
      '</div>';

    MenuDialogs.custom('Sign Guestbook', html, [
      { label: 'Sign!', primary: true, action: function() {
        var name = (document.getElementById('gb-name').value.trim() || 'Anonymous').substring(0, 20);
        var msg = (document.getElementById('gb-msg').value.trim() || 'Was here!').substring(0, 140);
        _addEntry(name, msg);
        // Close parent and reopen with updated entries
        if (parentRef.overlay && parentRef.overlay.parentNode) {
          parentRef.overlay.parentNode.removeChild(parentRef.overlay);
        }
        MenuDialogs.toast('Guestbook signed! Thanks, ' + name + '!');
        setTimeout(function() { open(); }, 500);
      }},
      { label: 'Cancel' }
    ], { width: 360 });

    setTimeout(function() {
      var msgEl = document.getElementById('gb-msg');
      if (msgEl) msgEl.focus();
    }, 60);
  }

  function _buildHTML(entries) {
    var html = '';

    // Sign button
    html += '<div style="text-align:center;margin-bottom:12px">' +
      '<button id="gb-sign-btn" class="dialog-btn primary" style="background:#0000ff;color:#fff;padding:6px 24px;font-weight:bold">' +
        '\u270f\ufe0f Sign the Guestbook!' +
      '</button>' +
      '<div style="font-size:11px;color:#808080;margin-top:4px">' +
        entries.length + ' signature' + (entries.length !== 1 ? 's' : '') + ' so far!' +
      '</div>' +
    '</div>';

    // Entries list
    html += '<div style="max-height:300px;overflow-y:auto;background:#fff;border:2px solid;border-color:#404040 #dfdfdf #dfdfdf #404040;padding:4px">';

    // Show newest first
    var sorted = entries.slice().sort(function(a, b) { return b.date - a.date; });
    for (var i = 0; i < sorted.length; i++) {
      var e = sorted[i];
      var dateStr = _formatDate(e.date);
      var bg = i % 2 === 0 ? '#f8f8ff' : '#ffffff';

      html += '<div style="padding:8px 10px;background:' + bg + ';border-bottom:1px solid #e0e0e0">';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline">';
      html += '<span style="font-weight:bold;color:#000080;font-size:13px">' + _esc(e.name) + '</span>';
      html += '<span style="font-size:10px;color:#808080">' + dateStr + '</span>';
      html += '</div>';
      html += '<div style="font-size:13px;color:#333;margin-top:2px;font-style:italic">' + _esc(e.message) + '</div>';
      html += '</div>';
    }

    if (entries.length === 0) {
      html += '<div style="text-align:center;padding:30px;color:#808080;font-style:italic">No entries yet. Be the first to sign!</div>';
    }

    html += '</div>';
    return html;
  }

  // -------------------------------------------------------------------------
  // Storage
  // -------------------------------------------------------------------------

  function _load() {
    var data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
    // First load: seed with fake entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEntries));
    return seedEntries.slice();
  }

  function _addEntry(name, message) {
    var entries = _load();
    entries.push({ name: name, message: message, date: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function _formatDate(ts) {
    var d = new Date(ts);
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var y = d.getFullYear();
    return m + '/' + day + '/' + y;
  }

  function _esc(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { open: open };

})();
