// =============================================================================
// WorldEnhance.js — Star ratings, hover tooltips, unlock animations
// =============================================================================

const WorldEnhance = (() => {

  // World metadata for tooltips
  var worldInfo = {
    emerald_pastures: {
      enemies: 4, food: 8, zones: 6,
      tip: 'Great for beginners! Learn all the basics here.'
    },
    crystal_caves: {
      enemies: 8, food: 12, zones: 6,
      tip: 'Watch for stalactites! They hurt.'
    },
    lava_meadows: {
      enemies: 10, food: 10, zones: 6,
      tip: 'The cheese rivers are NOT safe to swim in.'
    },
    cloud_kingdom: {
      enemies: 6, food: 15, zones: 6,
      tip: 'Careful with the bouncy clouds \u2014 look before you leap!'
    },
    shadow_barn: {
      enemies: 12, food: 8, zones: 6,
      tip: 'Baron Beige awaits. Bring your best gear.'
    },
    rainbow_falls: {
      enemies: 14, food: 20, zones: 8,
      tip: 'The final challenge. Restore color to everything!'
    }
  };

  // Star thresholds per world (score needed for 1, 2, 3 stars)
  var starThresholds = {
    emerald_pastures: [200, 500, 1000],
    crystal_caves: [300, 700, 1200],
    lava_meadows: [400, 800, 1400],
    cloud_kingdom: [500, 1000, 1600],
    shadow_barn: [600, 1200, 1800],
    rainbow_falls: [800, 1500, 2000]
  };

  var previousWorldStates = {};

  function init() {
    _addStarContainers();
    _addTooltips();
    _captureCurrentStates();
    update();
  }

  /**
   * Call after refreshMenuState to update stars and check for unlock animations.
   */
  function update() {
    var scores = JSON.parse(localStorage.getItem('mooquest_scores') || '{}');
    var saveData = localStorage.getItem('mooquest_save');
    var worlds = null;
    if (saveData) {
      try { worlds = JSON.parse(saveData).worlds; } catch(e) {}
    }

    var cards = document.querySelectorAll('[data-world]');
    cards.forEach(function(card) {
      var key = card.dataset.world;
      var score = scores[key] || 0;
      var w = worlds ? worlds[key] : null;
      var completed = w && w.completed;
      var unlocked = key === 'emerald_pastures' || (w && w.unlocked);

      // Update stars
      _updateStars(card, key, score, completed);

      // Check for unlock animation
      if (unlocked && previousWorldStates[key] === false) {
        _playUnlockAnimation(card);
      }

      // Update tooltip data
      _updateTooltipData(card, key, score, completed, unlocked);
    });

    _captureCurrentStates();
  }

  // -------------------------------------------------------------------------
  // Stars
  // -------------------------------------------------------------------------

  function _addStarContainers() {
    var cards = document.querySelectorAll('[data-world]');
    cards.forEach(function(card) {
      var scoreDiv = card.querySelector('.world-score');
      if (!scoreDiv) return;

      // Insert star container after the score div
      var starDiv = document.createElement('div');
      starDiv.className = 'world-stars';
      starDiv.style.cssText = 'display:none;font-size:16px;letter-spacing:2px;margin-top:2px';
      scoreDiv.parentNode.insertBefore(starDiv, scoreDiv.nextSibling);
    });
  }

  function _updateStars(card, worldKey, score, completed) {
    var starDiv = card.querySelector('.world-stars');
    if (!starDiv) return;

    if (!completed || score === 0) {
      starDiv.style.display = 'none';
      return;
    }

    var thresholds = starThresholds[worldKey] || [200, 500, 1000];
    var starCount = 0;
    if (score >= thresholds[0]) starCount = 1;
    if (score >= thresholds[1]) starCount = 2;
    if (score >= thresholds[2]) starCount = 3;

    var html = '';
    for (var i = 0; i < 3; i++) {
      if (i < starCount) {
        html += '<span style="color:#ffd700;text-shadow:0 0 4px rgba(255,215,0,0.5)">\u2605</span>';
      } else {
        html += '<span style="color:#808080">\u2606</span>';
      }
    }

    starDiv.innerHTML = html;
    starDiv.style.display = 'block';
  }

  // -------------------------------------------------------------------------
  // Tooltips
  // -------------------------------------------------------------------------

  function _addTooltips() {
    var cards = document.querySelectorAll('[data-world]');
    cards.forEach(function(card) {
      var key = card.dataset.world;
      var info = worldInfo[key];
      if (!info) return;

      // Create tooltip element
      var tooltip = document.createElement('div');
      tooltip.className = 'world-tooltip';
      tooltip.style.cssText =
        'display:none;position:absolute;z-index:8000;background:#ffffcc;border:2px solid #000;' +
        'padding:8px 12px;font-size:12px;font-family:Segoe UI,Tahoma,sans-serif;color:#000;' +
        'box-shadow:2px 2px 0px rgba(0,0,0,0.3);max-width:220px;pointer-events:none;white-space:normal';
      document.body.appendChild(tooltip);

      // Position relative to card
      card.style.position = 'relative';

      card.addEventListener('mouseenter', function(e) {
        var info = worldInfo[key];
        var data = card._tooltipData || {};
        var html = '<div style="font-weight:bold;margin-bottom:4px;color:#000080">' + _worldName(key) + '</div>';

        if (data.completed) {
          html += '\u2605 Best: ' + (data.score || 0).toLocaleString() + '<br>';
          html += '\u2694\ufe0f Enemies: ' + info.enemies + ' | ';
          html += '\ud83c\udf3f Food: ' + info.food + '<br>';
        } else if (data.unlocked) {
          html += '\u2694\ufe0f Enemies: ' + info.enemies + ' | ';
          html += '\ud83c\udf3f Food: ' + info.food + '<br>';
          html += '\ud83d\udccd Zones: ' + info.zones + '<br>';
        } else {
          html += '\ud83d\udd12 Complete previous world to unlock<br>';
        }

        html += '<div style="font-style:italic;color:#666;margin-top:4px">' + info.tip + '</div>';
        tooltip.innerHTML = html;
        tooltip.style.display = 'block';
      });

      card.addEventListener('mousemove', function(e) {
        tooltip.style.left = (e.pageX + 16) + 'px';
        tooltip.style.top = (e.pageY - 10) + 'px';
      });

      card.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
      });
    });
  }

  function _updateTooltipData(card, key, score, completed, unlocked) {
    card._tooltipData = {
      score: score,
      completed: completed,
      unlocked: unlocked
    };
  }

  // -------------------------------------------------------------------------
  // Unlock Animation
  // -------------------------------------------------------------------------

  function _playUnlockAnimation(card) {
    // Flash effect
    card.style.transition = 'none';
    card.style.outline = '3px solid #ffff00';
    card.style.boxShadow = '0 0 20px rgba(255,255,0,0.8), 4px 4px 0px rgba(0,0,0,0.3)';

    // Quick scale pulse
    card.style.transform = 'scale(1.05)';

    setTimeout(function() {
      card.style.transition = 'all 0.5s ease';
      card.style.transform = '';
      card.style.outline = '';
      card.style.boxShadow = '';
    }, 600);

    // Show a toast
    if (typeof MenuDialogs !== 'undefined') {
      var name = _worldName(card.dataset.world);
      MenuDialogs.toast('\ud83d\udd13 ' + name + ' UNLOCKED!');
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function _captureCurrentStates() {
    var saveData = localStorage.getItem('mooquest_save');
    var worlds = null;
    if (saveData) {
      try { worlds = JSON.parse(saveData).worlds; } catch(e) {}
    }

    var keys = ['emerald_pastures','crystal_caves','lava_meadows','cloud_kingdom','shadow_barn','rainbow_falls'];
    keys.forEach(function(key) {
      var w = worlds ? worlds[key] : null;
      previousWorldStates[key] = key === 'emerald_pastures' || (w && w.unlocked);
    });
  }

  function _worldName(key) {
    var names = {
      emerald_pastures: 'Emerald Pastures',
      crystal_caves: 'Crystal Caves',
      lava_meadows: 'Lava Meadows',
      cloud_kingdom: 'Cloud Kingdom',
      shadow_barn: 'Shadow Barn',
      rainbow_falls: 'Rainbow Falls'
    };
    return names[key] || key;
  }

  return { init: init, update: update };

})();
