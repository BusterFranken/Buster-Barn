// =============================================================================
// HelpContent.js — Help menu dialogs and Cowlipy easter egg
// =============================================================================

const HelpContent = (() => {

  // -------------------------------------------------------------------------
  // How to Play
  // -------------------------------------------------------------------------

  function showHowToPlay() {
    var html =
      '<div class="dialog-body-sunken">' +
      'WELCOME TO MOO-QUEST!\n' +
      '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n' +
      'You are Violet, the world\'s only purple\n' +
      'cow. Baron Beige has drained all color\n' +
      'from the Meadowlands, and only YOU can\n' +
      'restore it!\n\n' +
      'BASICS:\n' +
      '\u2022 Move through each world, collecting\n' +
      '  food and defeating enemies\n' +
      '\u2022 Eat 5 food items per zone to unlock\n' +
      '  the next area\n' +
      '\u2022 Defeat enemies by attacking (Z or X)\n' +
      '\u2022 Find levers to open gates\n' +
      '\u2022 Reach the victory flag to complete\n' +
      '  the world!\n\n' +
      'ITEMS:\n' +
      '\ud83c\udf3f Grass  \u2014 Common food (+50 pts)\n' +
      '\ud83c\udf3e Hay   \u2014 Common food (+50 pts)\n' +
      '\ud83e\udd5b Milk  \u2014 Bonus item (+200 pts)\n' +
      '\u2764\ufe0f Heart \u2014 Restores 1 health\n\n' +
      'TIPS:\n' +
      '\u2022 Jump on enemies to stun them briefly\n' +
      '\u2022 Checkpoints save your position\n' +
      '\u2022 Your inventory carries over between\n' +
      '  worlds!' +
      '</div>';

    MenuDialogs.custom('How to Play \u2014 MOO-QUEST.EXE', html, [
      { label: 'OK', primary: true }
    ], { width: 420 });
  }

  // -------------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------------

  function showControls() {
    var html =
      '<div class="dialog-body-sunken">' +
      'KEYBOARD CONTROLS\n' +
      '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n' +
      '\u2190 \u2192  or  A D      Move left/right\n' +
      '\u2191  or  W  SPACE   Jump\n' +
      'Z  or  X           Attack\n' +
      'ESC                Pause game\n' +
      'F11                Fullscreen\n\n' +
      'MENU SHORTCUTS\n' +
      '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n' +
      'Alt+F              File menu\n' +
      'Alt+E              Edit menu\n' +
      'Alt+V              View menu\n' +
      'Alt+Q              Quest menu\n' +
      'Alt+I              Inventory menu\n' +
      'Alt+H              Help menu\n' +
      'Ctrl+N             New Game\n' +
      'Ctrl+S             Save Game\n' +
      'Ctrl+L             Load Game' +
      '</div>';

    MenuDialogs.custom('Controls \u2014 MOO-QUEST.EXE', html, [
      { label: 'OK', primary: true }
    ], { width: 380 });
  }

  // -------------------------------------------------------------------------
  // About
  // -------------------------------------------------------------------------

  function showAbout() {
    var html =
      '<div class="dialog-body-sunken" style="text-align:center">' +
      '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n' +
      '\u2551  MOO-QUEST.EXE  v2.0.0         \u2551\n' +
      '\u2551  The Legend of the Purple Cow    \u2551\n' +
      '\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563\n' +
      '\u2551                                  \u2551\n' +
      '\u2551         (__)                     \u2551\n' +
      '\u2551         (oo)                     \u2551\n' +
      '\u2551   /------\\/                      \u2551\n' +
      '\u2551  / |    ||                       \u2551\n' +
      '\u2551 *  /\\---/\\                       \u2551\n' +
      '\u2551    ~~   ~~                       \u2551\n' +
      '\u2551   VIOLET THE COW                 \u2551\n' +
      '\u2551                                  \u2551\n' +
      '\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563\n' +
      '\u2551  \u00a9 1997 Moo-Quest Interactive    \u2551\n' +
      '\u2551  Lead Developer: Buster          \u2551\n' +
      '\u2551  Engine: Phaser 3.80.1           \u2551\n' +
      '\u2551  Best viewed at 800x600          \u2551\n' +
      '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d' +
      '</div>';

    MenuDialogs.custom('About MOO-QUEST.EXE', html, [
      { label: 'OK', primary: true }
    ], { width: 440 });
  }

  // -------------------------------------------------------------------------
  // Cowlipy — the Cow-themed Clippy
  // -------------------------------------------------------------------------

  var cowlipyEl = null;
  var cowlipyVisible = false;

  var cowlipyTips = [
    "It looks like you're trying to moo. Would you like help with that?",
    "Did you know? Purple cows are 47% more heroic than regular cows!",
    "Tip: Try eating all the grass before fighting enemies!",
    "Baron Beige's weakness is COLOR. That's you!",
    "Remember to save your game! File \u2192 Save Game (Ctrl+S)",
    "Stuck? Check Help \u2192 Controls for keyboard shortcuts!",
    "The Purple Cape gives +10 to fabulousness!",
    "I see you're exploring the menus. Very thorough!",
    "Fun fact: This game is best viewed in Netscape Navigator 4.0!",
    "Moo! ...I mean, hello!",
    "Your inventory carries over between worlds. Collect everything!",
    "Levers open gates. Look for them in puzzle zones!"
  ];

  // Context-aware messages keyed by action
  var cowlipyReactions = {
    equipment:       "Ooh, checking your gear! The Purple Cape is looking fabulous today.",
    powerups:        "Power-ups are found in worlds. Keep exploring!",
    cosmetics:       "Fashion is the TRUE endgame. I respect your priorities.",
    leaderboard:     "Checking the high scores? Feeling competitive, are we?",
    saveGame:        "Smart move! You never know when Baron Beige might strike.",
    loadGame:        "Welcome back! Your adventure continues...",
    newGame:         "A fresh start! Every great hero begins somewhere.",
    playerStats:     "Numbers don't lie \u2014 you're getting stronger!",
    achievements:    "So many badges to earn! Keep at it!",
    preferences:     "Customizing the experience? I like your style.",
    howToPlay:       "Reading the manual? How refreshingly old-school of you!",
    controls:        "Pro tip: Z and X are your best friends in combat.",
    about:           "Ah yes, the credits. I should be in there somewhere...",
    worldMap:        "So many worlds to explore! Which one calls to you?",
    resetProgress:   "WAIT! Are you sure?! Think of all those Moo-Coins!",
    exportSave:      "Backing up your save? Wise. Very wise.",
    exit:            "Don't go! ...I mean, it's fine. I'll just be here. Alone.",
    activeQuests:    "Adventure awaits! Just gotta start a world first.",
    dailyQuests:     "Daily quests are coming soon! I'm as excited as you are!",
    fullscreen:      "Going fullscreen? Now THAT'S immersive gaming.",
    guestbook:       "The guestbook! Say something nice for the other visitors!",
  };

  function toggleCowlipy() {
    if (!cowlipyEl) {
      _createCowlipy();
    }

    cowlipyVisible = !cowlipyVisible;
    cowlipyEl.classList.toggle('visible', cowlipyVisible);

    if (cowlipyVisible) {
      _randomTip();
    }
  }

  function _createCowlipy() {
    cowlipyEl = document.createElement('div');
    cowlipyEl.className = 'cowlipy-container';
    cowlipyEl.innerHTML =
      '<div class="cowlipy-bubble">' +
        '<span class="cowlipy-close" title="Close">\u2715</span>' +
        '<span class="cowlipy-text">Hello! I\'m Cowlipy, your helpful assistant!</span>' +
      '</div>' +
      '<div class="cowlipy-body" title="Click for another tip!">\ud83d\udc2e</div>';

    document.body.appendChild(cowlipyEl);

    // Click cow for new tip
    cowlipyEl.querySelector('.cowlipy-body').addEventListener('click', _randomTip);

    // Close button
    cowlipyEl.querySelector('.cowlipy-close').addEventListener('click', function(e) {
      e.stopPropagation();
      cowlipyVisible = false;
      cowlipyEl.classList.remove('visible');
    });
  }

  function _randomTip() {
    if (!cowlipyEl) return;
    var tip = cowlipyTips[Math.floor(Math.random() * cowlipyTips.length)];
    cowlipyEl.querySelector('.cowlipy-text').textContent = tip;
  }

  /**
   * Show a context-aware reaction if Cowlipy is visible.
   * Called by MenuSystem when an action fires.
   */
  function react(action) {
    if (!cowlipyVisible || !cowlipyEl) return;
    var msg = cowlipyReactions[action];
    if (msg) {
      cowlipyEl.querySelector('.cowlipy-text').textContent = msg;
    }
  }

  return {
    showHowToPlay: showHowToPlay,
    showControls: showControls,
    showAbout: showAbout,
    toggleCowlipy: toggleCowlipy,
    react: react
  };

})();
