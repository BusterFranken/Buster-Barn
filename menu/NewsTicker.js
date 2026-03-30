// =============================================================================
// NewsTicker.js — Scrolling marquee news feed pulling from leaderboard data
// =============================================================================

const NewsTicker = (() => {

  var tickerEl = null;
  var textEl = null;
  var intervalId = null;
  var messages = [];
  var currentIndex = 0;

  // Flavor messages that rotate in when no leaderboard data exists
  var flavorMessages = [
    '\u2605 BREAKING: Baron Beige spotted near Shadow Barn! Prepare for battle! \u2605',
    '\u2605 WEATHER: Partly cloudy over Cloud Kingdom with a chance of cotton candy \u2605',
    '\u2605 SPORTS: Annual Meadowlands Moo-lympics registration now open! \u2605',
    '\u2605 TECH: New levers discovered in Crystal Caves \u2014 puzzle experts baffled! \u2605',
    '\u2605 FOOD: Emerald Pastures reports record grass harvest this season \u2605',
    '\u2605 WANTED: Information on the whereabouts of Baron Beige \u2014 reward: 500 Moo-Coins \u2605',
    '\u2605 TOURISM: Rainbow Falls voted #1 vacation destination for the 3rd year running \u2605',
    '\u2605 SCIENCE: Researchers confirm purple cows are 47% more heroic than average \u2605',
  ];

  function init() {
    tickerEl = document.getElementById('news-ticker');
    textEl = document.getElementById('news-ticker-text');
    if (!tickerEl || !textEl) return;

    _buildMessages();
    _showNext();
    // Rotate message every time the animation restarts (~15s)
    intervalId = setInterval(function() {
      _buildMessages();
      _showNext();
    }, 15000);
  }

  function _buildMessages() {
    messages = [];

    // Pull recent leaderboard entries
    var entries = JSON.parse(localStorage.getItem('mooquest_leaderboard') || '[]');
    var worldNames = {
      tutorial: 'Emerald Pastures',
      emerald_pastures: 'Emerald Pastures',
      crystal_caves: 'Crystal Caves',
      lava_meadows: 'Lava Meadows',
      cloud_kingdom: 'Cloud Kingdom',
      shadow_barn: 'Shadow Barn',
      rainbow_falls: 'Rainbow Falls'
    };

    // Recent scores (most recent first by date)
    var recent = entries.slice().sort(function(a, b) { return (b.date || 0) - (a.date || 0); });
    for (var i = 0; i < Math.min(recent.length, 5); i++) {
      var e = recent[i];
      var wn = worldNames[e.world] || e.world;
      messages.push(
        '\u2605 ' + e.name + ' just scored ' + e.score.toLocaleString() +
        ' on ' + wn + '! \u2605'
      );
    }

    // Top score callout
    if (entries.length > 0) {
      var top = entries[0]; // already sorted by score in storage
      messages.push(
        '\ud83c\udfc6 CURRENT CHAMPION: ' + top.name +
        ' with ' + top.score.toLocaleString() + ' points! Can YOU beat them? \ud83c\udfc6'
      );
    }

    // Mix in flavor messages
    var shuffled = flavorMessages.slice().sort(function() { return Math.random() - 0.5; });
    for (var j = 0; j < 3; j++) {
      messages.push(shuffled[j]);
    }

    // If no real data, use all flavor
    if (messages.length < 4) {
      messages = flavorMessages.slice();
    }
  }

  function _showNext() {
    if (!textEl || messages.length === 0) return;
    textEl.textContent = messages[currentIndex % messages.length];
    currentIndex++;
  }

  function destroy() {
    if (intervalId) clearInterval(intervalId);
  }

  return { init: init, destroy: destroy };

})();
