// =============================================================================
// Leaderboard.js — Atari-style arcade high score table
// =============================================================================

const Leaderboard = (() => {

  // -------------------------------------------------------------------------
  // Show the leaderboard dialog
  // -------------------------------------------------------------------------

  function show() {
    DatabaseBridge.loadLeaderboard().then(function(entries) {
      var html = _buildLeaderboardHTML(entries);

      MenuDialogs.custom('HIGH SCORES', html, [
        { label: 'Close', primary: true }
      ], { width: 480 });
    });
  }

  // -------------------------------------------------------------------------
  // Prompt for name and submit score (called after victory)
  // -------------------------------------------------------------------------

  function promptAndSubmit(score, world, rank) {
    var defaultName = GameState.profile.name || 'AAA';

    var html =
      '<div style="background:#000;padding:20px;text-align:center;border:2px solid;border-color:#404040 #dfdfdf #dfdfdf #404040">' +
        '<div style="font-family:VT323,monospace;font-size:28px;color:#ffff00;margin-bottom:4px;text-shadow:0 0 10px rgba(255,255,0,0.5)">' +
          'GAME OVER' +
        '</div>' +
        '<div style="font-family:VT323,monospace;font-size:20px;color:#00ff00;margin-bottom:12px;text-shadow:0 0 8px rgba(0,255,0,0.4)">' +
          'YOUR SCORE: ' + String(score).padStart(6, '0') +
        '</div>' +
        '<div style="font-family:VT323,monospace;font-size:18px;color:#ff6600;margin-bottom:16px;text-shadow:0 0 6px rgba(255,102,0,0.4)">' +
          'ENTER YOUR NAME' +
        '</div>' +
        '<input id="lb-name-input" type="text" maxlength="12" value="' + _esc(defaultName) + '" ' +
          'style="background:#001a00;color:#00ff00;border:2px solid #00aa00;font-family:VT323,monospace;' +
          'font-size:24px;text-align:center;width:200px;padding:6px;text-transform:uppercase;' +
          'text-shadow:0 0 8px rgba(0,255,0,0.5);letter-spacing:4px">' +
        '<div style="font-family:VT323,monospace;font-size:14px;color:#666;margin-top:8px">' +
          'TYPE YOUR NAME AND PRESS ENTER' +
        '</div>' +
      '</div>';

    var ref = MenuDialogs.custom('ENTER INITIALS', html, [
      { label: 'SUBMIT', primary: true, action: function() {
        var input = document.getElementById('lb-name-input');
        var name = (input ? input.value.trim() : defaultName) || defaultName;
        name = name.toUpperCase().substring(0, 12);

        DatabaseBridge.addLeaderboardEntry({
          name: name,
          score: score,
          world: world,
          rank: rank
        }).then(function() {
          // Show the leaderboard with the new entry highlighted
          _showWithHighlight(name, score);
        });
      }},
      { label: 'SKIP', action: function() {} }
    ], { width: 400 });

    // Auto-focus and select the input
    setTimeout(function() {
      var input = document.getElementById('lb-name-input');
      if (input) {
        input.focus();
        input.select();
        // Submit on Enter
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            var name = (input.value.trim() || defaultName).toUpperCase().substring(0, 12);
            DatabaseBridge.addLeaderboardEntry({
              name: name,
              score: score,
              world: world,
              rank: rank
            }).then(function() {
              if (ref.overlay && ref.overlay.parentNode) {
                ref.overlay.parentNode.removeChild(ref.overlay);
              }
              _showWithHighlight(name, score);
            });
          }
        });
      }
    }, 60);
  }

  // -------------------------------------------------------------------------
  // Build the Atari-style leaderboard HTML
  // -------------------------------------------------------------------------

  function _buildLeaderboardHTML(entries, highlightName, highlightScore) {
    var html =
      '<div style="background:#000;padding:16px;border:2px solid;border-color:#404040 #dfdfdf #dfdfdf #404040">';

    // Title
    html +=
      '<div style="text-align:center;margin-bottom:12px">' +
        '<div style="font-family:VT323,monospace;font-size:32px;color:#ffff00;text-shadow:0 0 12px rgba(255,255,0,0.5);letter-spacing:3px">' +
          '\u2605 HIGH SCORES \u2605' +
        '</div>' +
        '<div style="font-family:VT323,monospace;font-size:14px;color:#ff6600;text-shadow:0 0 6px rgba(255,102,0,0.3)">' +
          'MOO-QUEST HALL OF FAME' +
        '</div>' +
      '</div>';

    // Header row
    html +=
      '<div style="font-family:VT323,monospace;font-size:16px;color:#888;display:flex;padding:0 8px 4px;border-bottom:1px solid #333">' +
        '<span style="width:40px">RNK</span>' +
        '<span style="flex:1">NAME</span>' +
        '<span style="width:80px;text-align:right">SCORE</span>' +
        '<span style="width:50px;text-align:center">LVL</span>' +
      '</div>';

    if (entries.length === 0) {
      html +=
        '<div style="font-family:VT323,monospace;font-size:20px;color:#444;text-align:center;padding:40px 0">' +
          'NO SCORES YET<br><br>' +
          '<span style="color:#666;font-size:16px">COMPLETE A WORLD TO<br>ENTER THE HALL OF FAME!</span>' +
        '</div>';
    } else {
      html += '<div style="max-height:320px;overflow-y:auto">';

      for (var i = 0; i < entries.length && i < 20; i++) {
        var e = entries[i];
        var isHighlighted = highlightName && highlightScore &&
          e.name === highlightName && e.score === highlightScore;

        var rankNum = String(i + 1).padStart(2, ' ');
        var scoreStr = String(e.score).padStart(6, '0');
        var worldLabel = _worldShort(e.world);

        // Colors based on rank position
        var color, glow;
        if (i === 0) {
          color = '#ffd700'; glow = 'rgba(255,215,0,0.5)';   // Gold
        } else if (i === 1) {
          color = '#c0c0c0'; glow = 'rgba(192,192,192,0.3)'; // Silver
        } else if (i === 2) {
          color = '#cd7f32'; glow = 'rgba(205,127,50,0.3)';  // Bronze
        } else {
          color = '#00ff00'; glow = 'rgba(0,255,0,0.2)';     // Green
        }

        if (isHighlighted) {
          color = '#ff00ff'; glow = 'rgba(255,0,255,0.5)';   // Magenta for new entry
        }

        var bgStyle = isHighlighted ? 'background:rgba(255,0,255,0.1);' : '';
        var blinkClass = isHighlighted ? 'animation:blink-animation 1s steps(2,start) 3;' : '';

        html +=
          '<div style="font-family:VT323,monospace;font-size:18px;color:' + color + ';' +
            'text-shadow:0 0 6px ' + glow + ';display:flex;padding:4px 8px;' +
            'border-bottom:1px solid #111;' + bgStyle + blinkClass + '">' +
            '<span style="width:40px">' + rankNum + '.</span>' +
            '<span style="flex:1;letter-spacing:2px">' + _esc(e.name) + '</span>' +
            '<span style="width:80px;text-align:right;letter-spacing:1px">' + scoreStr + '</span>' +
            '<span style="width:50px;text-align:center;color:#888;font-size:14px">' + worldLabel + '</span>' +
          '</div>';
      }

      html += '</div>';
    }

    // Footer
    html +=
      '<div style="text-align:center;margin-top:12px;font-family:VT323,monospace;font-size:14px;color:#444">' +
        'INSERT COIN TO CONTINUE' +
      '</div>';

    html += '</div>';
    return html;
  }

  // -------------------------------------------------------------------------
  // Show with a highlighted new entry
  // -------------------------------------------------------------------------

  function _showWithHighlight(name, score) {
    DatabaseBridge.loadLeaderboard().then(function(entries) {
      var html = _buildLeaderboardHTML(entries, name, score);

      MenuDialogs.custom('HIGH SCORES', html, [
        { label: 'Close', primary: true }
      ], { width: 480 });
    });
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function _worldShort(world) {
    var map = {
      tutorial: 'TUT',
      emerald_pastures: 'W1',
      crystal_caves: 'W2',
      lava_meadows: 'W3',
      cloud_kingdom: 'W4',
      shadow_barn: 'W5',
      rainbow_falls: 'W6'
    };
    return map[world] || world;
  }

  function _esc(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    show: show,
    promptAndSubmit: promptAndSubmit
  };

})();
