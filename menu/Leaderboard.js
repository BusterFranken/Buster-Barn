// =============================================================================
// Leaderboard.js — Atari-style arcade high score table
// With: rivals, weekly/all-time toggle, last run snapshot
// =============================================================================

const Leaderboard = (() => {

  var currentFilter = 'alltime'; // 'alltime' or 'weekly'

  // -------------------------------------------------------------------------
  // Show the leaderboard dialog
  // -------------------------------------------------------------------------

  function show() {
    DatabaseBridge.loadLeaderboard().then(function(entries) {
      _showDialog(entries, null, null);
    });
  }

  function _showDialog(entries, highlightName, highlightScore) {
    var filtered = _filterEntries(entries, currentFilter);
    var playerName = (GameState.profile.name || 'VIOLET').toUpperCase();
    var html = _buildLeaderboardHTML(filtered, highlightName, highlightScore, playerName);

    var ref = MenuDialogs.custom('HIGH SCORES', html, [
      { label: 'Close', primary: true }
    ], { width: 500 });

    // Wire filter toggle
    setTimeout(function() {
      var toggleBtn = document.getElementById('lb-filter-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
          currentFilter = currentFilter === 'alltime' ? 'weekly' : 'alltime';
          // Close and reopen
          if (ref.overlay && ref.overlay.parentNode) {
            ref.overlay.parentNode.removeChild(ref.overlay);
          }
          _showDialog(entries, highlightName, highlightScore);
        });
      }
    }, 50);
  }

  // -------------------------------------------------------------------------
  // Prompt for name and submit score (called after victory)
  // -------------------------------------------------------------------------

  function promptAndSubmit(score, world, rank) {
    var defaultName = GameState.profile.name || 'AAA';

    // Save last run snapshot
    _saveLastRun(score, world, rank);

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
        _submitAndShow(name, score, world, rank);
      }},
      { label: 'SKIP', action: function() {} }
    ], { width: 400 });

    setTimeout(function() {
      var input = document.getElementById('lb-name-input');
      if (input) {
        input.focus();
        input.select();
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            var name = (input.value.trim() || defaultName).toUpperCase().substring(0, 12);
            if (ref.overlay && ref.overlay.parentNode) {
              ref.overlay.parentNode.removeChild(ref.overlay);
            }
            _submitAndShow(name, score, world, rank);
          }
        });
      }
    }, 60);
  }

  function _submitAndShow(name, score, world, rank) {
    DatabaseBridge.addLeaderboardEntry({
      name: name, score: score, world: world, rank: rank
    }).then(function() {
      DatabaseBridge.loadLeaderboard().then(function(entries) {
        _showDialog(entries, name, score);
      });
    });
  }

  // -------------------------------------------------------------------------
  // Build the Atari-style leaderboard HTML
  // -------------------------------------------------------------------------

  function _buildLeaderboardHTML(entries, highlightName, highlightScore, playerName) {
    var html =
      '<div style="background:#000;padding:16px;border:2px solid;border-color:#404040 #dfdfdf #dfdfdf #404040">';

    // Title + filter toggle
    html +=
      '<div style="text-align:center;margin-bottom:8px">' +
        '<div style="font-family:VT323,monospace;font-size:32px;color:#ffff00;text-shadow:0 0 12px rgba(255,255,0,0.5);letter-spacing:3px">' +
          '\u2605 HIGH SCORES \u2605' +
        '</div>' +
        '<div style="font-family:VT323,monospace;font-size:14px;color:#ff6600;text-shadow:0 0 6px rgba(255,102,0,0.3)">' +
          'MOO-QUEST HALL OF FAME' +
        '</div>' +
        '<div style="margin-top:6px">' +
          '<button id="lb-filter-toggle" style="background:#222;color:' +
            (currentFilter === 'alltime' ? '#00ff00' : '#ffff00') +
            ';border:1px solid #444;font-family:VT323,monospace;font-size:14px;padding:2px 12px;cursor:pointer">' +
            (currentFilter === 'alltime' ? '[ ALL TIME ]' : '[ THIS WEEK ]') +
            ' \u25B6 click to toggle' +
          '</button>' +
        '</div>' +
      '</div>';

    // Last run snapshot
    var lastRun = _getLastRun();
    if (lastRun) {
      html +=
        '<div style="font-family:VT323,monospace;font-size:14px;color:#0088ff;padding:4px 8px;' +
          'border:1px solid #003366;background:#000822;margin-bottom:8px;text-shadow:0 0 4px rgba(0,136,255,0.3)">' +
          'LAST RUN: ' + String(lastRun.score).padStart(6,'0') +
          ' | ' + _worldShort(lastRun.world) +
          ' | RANK ' + (lastRun.rank || '-') +
          ' | ' + _timeAgo(lastRun.date) +
        '</div>';
    }

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
      // Find the rival (score just above the player's best)
      var playerBest = _findPlayerBest(entries, playerName);
      var rivalIndex = -1;
      if (playerBest !== null) {
        for (var r = 0; r < entries.length; r++) {
          if (entries[r].score > playerBest &&
              entries[r].name.toUpperCase() !== playerName) {
            rivalIndex = r;
          }
        }
      }

      html += '<div style="max-height:320px;overflow-y:auto">';

      for (var i = 0; i < entries.length && i < 25; i++) {
        var e = entries[i];
        var isHighlighted = highlightName && highlightScore &&
          e.name === highlightName && e.score === highlightScore;
        var isRival = (i === rivalIndex);

        var rankNum = String(i + 1).padStart(2, ' ');
        var scoreStr = String(e.score).padStart(6, '0');
        var worldLabel = _worldShort(e.world);

        // Colors based on rank position
        var color, glow;
        if (i === 0) {
          color = '#ffd700'; glow = 'rgba(255,215,0,0.5)';
        } else if (i === 1) {
          color = '#c0c0c0'; glow = 'rgba(192,192,192,0.3)';
        } else if (i === 2) {
          color = '#cd7f32'; glow = 'rgba(205,127,50,0.3)';
        } else {
          color = '#00ff00'; glow = 'rgba(0,255,0,0.2)';
        }

        if (isHighlighted) {
          color = '#ff00ff'; glow = 'rgba(255,0,255,0.5)';
        }

        var bgStyle = isHighlighted ? 'background:rgba(255,0,255,0.1);' : '';
        var blinkStyle = isHighlighted ? 'animation:blink-animation 1s steps(2,start) 3;' : '';

        // Rival indicator
        var rivalTag = '';
        if (isRival) {
          bgStyle = 'background:rgba(255,0,0,0.1);';
          rivalTag = '<span style="color:#ff4444;font-size:12px;margin-left:4px">\u25C0 RIVAL</span>';
        }

        // Check if this is the player's own entry
        var isPlayer = e.name.toUpperCase() === playerName;
        var youTag = '';
        if (isPlayer && !isHighlighted) {
          bgStyle = 'background:rgba(0,100,255,0.1);';
          youTag = '<span style="color:#4488ff;font-size:12px;margin-left:4px">\u25C0 YOU</span>';
        }

        html +=
          '<div style="font-family:VT323,monospace;font-size:18px;color:' + color + ';' +
            'text-shadow:0 0 6px ' + glow + ';display:flex;padding:4px 8px;' +
            'border-bottom:1px solid #111;' + bgStyle + blinkStyle + '">' +
            '<span style="width:40px">' + rankNum + '.</span>' +
            '<span style="flex:1;letter-spacing:2px">' + _esc(e.name) + rivalTag + youTag + '</span>' +
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
  // Filtering
  // -------------------------------------------------------------------------

  function _filterEntries(entries, filter) {
    if (filter === 'weekly') {
      var oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return entries.filter(function(e) { return (e.date || 0) >= oneWeekAgo; });
    }
    return entries;
  }

  // -------------------------------------------------------------------------
  // Rival detection
  // -------------------------------------------------------------------------

  function _findPlayerBest(entries, playerName) {
    var best = null;
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].name.toUpperCase() === playerName) {
        if (best === null || entries[i].score > best) {
          best = entries[i].score;
        }
      }
    }
    return best;
  }

  // -------------------------------------------------------------------------
  // Last run snapshot
  // -------------------------------------------------------------------------

  function _saveLastRun(score, world, rank) {
    localStorage.setItem('mooquest_lastrun', JSON.stringify({
      score: score, world: world, rank: rank, date: Date.now()
    }));
  }

  function _getLastRun() {
    var data = localStorage.getItem('mooquest_lastrun');
    return data ? JSON.parse(data) : null;
  }

  function _timeAgo(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'JUST NOW';
    if (mins < 60) return mins + ' MIN AGO';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'H AGO';
    var days = Math.floor(hours / 24);
    return days + 'D AGO';
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function _worldShort(world) {
    var map = {
      tutorial: 'TUT', emerald_pastures: 'W1', crystal_caves: 'W2',
      lava_meadows: 'W3', cloud_kingdom: 'W4', shadow_barn: 'W5', rainbow_falls: 'W6'
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
