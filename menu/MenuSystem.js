// =============================================================================
// MenuSystem.js — Win95 dropdown menu controller (DOM-based)
// Handles all menu items, keyboard shortcuts, and action wiring.
// =============================================================================

const MenuSystem = (() => {

  var activeMenu = null;
  var menuBarActive = false;

  // -------------------------------------------------------------------------
  // Init: bind events on menu items
  // -------------------------------------------------------------------------

  function init() {
    // Click to open/close
    document.querySelectorAll('.menu-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var name = item.dataset.menu;
        if (activeMenu === name) {
          closeAll();
        } else {
          _openMenu(name);
        }
      });

      // Hover-slide when a menu is already open
      item.addEventListener('mouseenter', function() {
        if (menuBarActive && item.dataset.menu !== activeMenu) {
          _openMenu(item.dataset.menu);
        }
      });
    });

    // Click outside closes menus
    document.addEventListener('click', function() {
      closeAll();
    });

    // Prevent dropdown clicks from closing
    document.querySelectorAll('.menu-dropdown').forEach(function(dd) {
      dd.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });

    // Wire dropdown item clicks
    document.querySelectorAll('.menu-dropdown-item').forEach(function(item) {
      if (item.classList.contains('disabled')) return;
      item.addEventListener('click', function() {
        var action = this.dataset.action;
        closeAll();
        if (action) _handleAction(action);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Alt + letter opens menus
      if (e.altKey && !e.ctrlKey) {
        var keyMap = { f: 'file', e: 'edit', v: 'view', q: 'quest', i: 'inventory', h: 'help' };
        var menu = keyMap[e.key.toLowerCase()];
        if (menu) {
          e.preventDefault();
          _openMenu(menu);
        }
      }

      // Ctrl shortcuts (only when not in Phaser game)
      if (e.ctrlKey && !e.altKey && _isOnLandingPage()) {
        switch (e.key.toLowerCase()) {
          case 'n': e.preventDefault(); _handleAction('newGame'); break;
          case 's': e.preventDefault(); _handleAction('saveGame'); break;
          case 'l': e.preventDefault(); _handleAction('loadGame'); break;
        }
      }

      // F1 = Help
      if (e.key === 'F1' && _isOnLandingPage()) {
        e.preventDefault();
        _handleAction('howToPlay');
      }

      // Escape closes menus
      if (e.key === 'Escape') {
        closeAll();
      }
    });

    // Load persisted state on init
    _loadPersistedState();

    // Update dynamic menu items
    _updateDynamicItems();
  }

  // -------------------------------------------------------------------------
  // Menu open/close
  // -------------------------------------------------------------------------

  function _openMenu(name) {
    closeAll();
    var dropdown = document.querySelector('[data-dropdown="' + name + '"]');
    var item = document.querySelector('[data-menu="' + name + '"]');
    if (dropdown && item) {
      dropdown.classList.add('open');
      item.classList.add('active');
      activeMenu = name;
      menuBarActive = true;
    }
  }

  function closeAll() {
    document.querySelectorAll('.menu-dropdown').forEach(function(d) {
      d.classList.remove('open');
    });
    document.querySelectorAll('.menu-item').forEach(function(i) {
      i.classList.remove('active');
    });
    activeMenu = null;
    menuBarActive = false;
  }

  // -------------------------------------------------------------------------
  // Action handler — dispatches menu item clicks
  // -------------------------------------------------------------------------

  function _handleAction(action) {
    // Let Cowlipy react to the action
    if (typeof HelpContent !== 'undefined' && HelpContent.react) {
      HelpContent.react(action);
    }

    switch (action) {

      // === FILE ===
      case 'newGame':
        MenuDialogs.confirm('MOO-QUEST.EXE', 'Start a new game? Current unsaved progress will be lost.', function() {
          GameState.reset();
          launchGame('tutorial');
        });
        break;

      case 'saveGame':
        DatabaseBridge.saveProgress(GameState).then(function() {
          DatabaseBridge.saveInventory(GameState.inventory);
          DatabaseBridge.saveProfile(GameState.profile);
          MenuDialogs.toast('Game saved successfully.');
        });
        break;

      case 'loadGame':
        DatabaseBridge.loadProgress().then(function(data) {
          if (data) {
            // Merge loaded data into GameState
            if (data.player) Object.assign(GameState.player, data.player);
            if (data.tutorial) Object.assign(GameState.tutorial, data.tutorial);
            if (data.worlds) Object.assign(GameState.worlds, data.worlds);
            if (data.settings) Object.assign(GameState.settings, data.settings);
            // Load inventory and profile separately (they persist across games)
            return Promise.all([
              DatabaseBridge.loadInventory(),
              DatabaseBridge.loadProfile()
            ]);
          }
          return [null, null];
        }).then(function(results) {
          if (results[0]) Object.assign(GameState.inventory, results[0]);
          if (results[1]) Object.assign(GameState.profile, results[1]);
          _updateDynamicItems();
          MenuDialogs.toast('Game loaded.');
        });
        break;

      case 'exportSave':
        DatabaseBridge.exportSave(GameState).then(function() {
          MenuDialogs.toast('Save exported as .moo file.');
        });
        break;

      case 'importSave':
        _triggerImport();
        break;

      case 'exit':
        MenuDialogs.custom('MOO-QUEST.EXE',
          '<div style="text-align:center;padding:20px 10px">' +
          '<div style="font-size:24px;margin-bottom:12px">\ud83d\udc04</div>' +
          '<div style="font-family:VT323,monospace;font-size:20px;color:#000080">' +
          'It\'s now safe to turn off<br>your cow.' +
          '</div></div>',
          [{ label: 'OK', primary: true }],
          { width: 320 }
        );
        break;

      // === EDIT ===
      case 'playerName':
        MenuDialogs.prompt('Edit Player Name', 'Enter a new name for your cow:', GameState.profile.name, function(name) {
          if (name && name.trim()) {
            GameState.profile.name = name.trim();
            DatabaseBridge.saveProfile(GameState.profile);
            MenuDialogs.toast('Name changed to ' + GameState.profile.name + '.');
          }
        });
        break;

      case 'preferences':
        _showPreferences();
        break;

      case 'resetProgress':
        MenuDialogs.confirm('MOO-QUEST.EXE', 'Really reset ALL progress?\n\nThis will erase your save, inventory, and scores.\nThis cannot be undone!', function() {
          MenuDialogs.confirm('MOO-QUEST.EXE', 'Are you absolutely sure? Everything will be gone!', function() {
            DatabaseBridge.clearSave();
            GameState.resetAll();
            _updateDynamicItems();
            MenuDialogs.toast('All progress has been reset.');
          });
        });
        break;

      // === VIEW ===
      case 'playerStats':
        _showPlayerStats();
        break;

      case 'leaderboard':
        Leaderboard.show();
        break;

      case 'achievements':
        MenuDialogs.custom('Achievements \u2014 ' + GameState.profile.name,
          '<div class="dialog-body-sunken">' +
          'ACHIEVEMENTS\n' +
          '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n' +
          '\ud83d\udd12 First Steps \u2014 Complete World 1\n' +
          '\ud83d\udd12 Moo-ster Chef \u2014 Eat 100 items\n' +
          '\ud83d\udd12 Bug Squasher \u2014 Defeat 50 enemies\n' +
          '\ud83d\udd12 Speed Runner \u2014 Complete a world in under 2 min\n' +
          '\ud83d\udd12 Fashionista \u2014 Equip 5 cosmetic items\n' +
          '\ud83d\udd12 Baron\'s Bane \u2014 Defeat Baron Beige\n' +
          '\ud83d\udd12 Color Restorer \u2014 Complete all 6 worlds\n' +
          '\ud83d\udd12 Moo-nificent! \u2014 Get S rank on all worlds' +
          '</div>',
          [{ label: 'Close', primary: true }],
          { width: 400 }
        );
        break;

      case 'worldMap':
        closeAll();
        var worldsSection = document.getElementById('worlds-section');
        if (worldsSection) {
          worldsSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'toggleScanlines':
        GameState.settings.scanlinesEnabled = !GameState.settings.scanlinesEnabled;
        _applyScanlines();
        _updateDynamicItems();
        break;

      case 'toggleAnimations':
        GameState.settings.animationsEnabled = !GameState.settings.animationsEnabled;
        _applyAnimations();
        _updateDynamicItems();
        break;

      case 'fullscreen':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;

      // === QUEST ===
      case 'activeQuests':
        MenuDialogs.custom('Active Quests',
          '<div class="dialog-body-sunken">' +
          'ACTIVE QUESTS\n' +
          '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n' +
          'No active quests.\n\n' +
          'Start a world to begin your\n' +
          'adventure!' +
          '</div>',
          [{ label: 'OK', primary: true }],
          { width: 340 }
        );
        break;

      case 'completedQuests':
        MenuDialogs.custom('Completed Quests',
          '<div class="dialog-body-sunken">' +
          'COMPLETED QUESTS\n' +
          '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n' +
          _getCompletedQuestsText() +
          '</div>',
          [{ label: 'OK', primary: true }],
          { width: 340 }
        );
        break;

      case 'dailyQuests':
        MenuDialogs.custom('Daily Quests',
          '<div style="text-align:center;padding:20px">' +
          '<div style="font-size:32px;margin-bottom:8px">\ud83d\udee0\ufe0f</div>' +
          '<div style="font-family:VT323,monospace;font-size:18px;color:#808080">' +
          'Coming Soon!<br>Check back in Version 3.0!' +
          '</div></div>',
          [{ label: 'OK', primary: true }],
          { width: 320 }
        );
        break;

      case 'questLog':
        MenuDialogs.custom('Quest Log',
          '<div class="dialog-body-sunken">' +
          'QUEST LOG\n' +
          '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n' +
          'The Quest Log records your\n' +
          'journey through the Meadowlands.\n\n' +
          '(No entries yet \u2014 start\n' +
          ' exploring to fill this log!)' +
          '</div>',
          [{ label: 'Close', primary: true }],
          { width: 360 }
        );
        break;

      // === INVENTORY ===
      case 'equipment':
        InventoryUI.open('equipment');
        break;

      case 'powerups':
        InventoryUI.open('powerups');
        break;

      case 'cosmetics':
        InventoryUI.open('cosmetics');
        break;

      // === HELP ===
      case 'howToPlay':
        HelpContent.showHowToPlay();
        break;

      case 'controls':
        HelpContent.showControls();
        break;

      case 'about':
        HelpContent.showAbout();
        break;

      case 'cowlipy':
        HelpContent.toggleCowlipy();
        break;

      // === GUESTBOOK ===
      case 'guestbook':
        Guestbook.open();
        break;
    }
  }

  // -------------------------------------------------------------------------
  // Preferences dialog
  // -------------------------------------------------------------------------

  // Desktop wallpaper themes
  var THEMES = [
    { id: 'teal',      label: 'Teal (Default)', color: '#008080' },
    { id: 'navy',      label: 'Navy Blue',      color: '#000080' },
    { id: 'forest',    label: 'Forest Green',   color: '#004040' },
    { id: 'plum',      label: 'Plum',           color: '#400040' },
    { id: 'storm',     label: 'Storm Gray',     color: '#404040' },
    { id: 'sunset',    label: 'Sunset Orange',  color: '#804000' },
    { id: 'berry',     label: 'Berry',          color: '#800040' },
    { id: 'midnight',  label: 'Midnight',       color: '#0a0a2e' },
  ];

  function _showPreferences() {
    var s = GameState.settings;
    var currentTheme = s.theme || 'teal';

    // Build theme swatches
    var themeHTML = '<div style="padding:6px 0;border-bottom:1px solid #dfdfdf;margin-bottom:6px">' +
      '<div style="font-size:12px;font-weight:bold;color:#000;margin-bottom:6px">Desktop Wallpaper:</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px">';
    THEMES.forEach(function(t) {
      var sel = t.id === currentTheme ? 'outline:2px solid #000;outline-offset:1px;' : '';
      themeHTML += '<div class="theme-swatch" data-theme="' + t.id + '" title="' + t.label + '" ' +
        'style="width:28px;height:28px;background:' + t.color + ';border:2px solid;' +
        'border-color:#dfdfdf #404040 #404040 #dfdfdf;cursor:pointer;' + sel + '"></div>';
    });
    themeHTML += '</div></div>';

    var html =
      '<div style="padding:4px 0">' +
        themeHTML +
        _prefRow('Scanlines', 'pref-scanlines', s.scanlinesEnabled) +
        _prefRow('Animations', 'pref-animations', s.animationsEnabled) +
        _prefRow('Music', 'pref-music', !s.musicMuted) +
        _prefRow('Sound Effects', 'pref-sfx', !s.sfxMuted) +
      '</div>';

    var selectedTheme = currentTheme;

    var ref = MenuDialogs.custom('Preferences', html, [
      { label: 'OK', primary: true, action: function() {
        GameState.settings.scanlinesEnabled = _isChecked(ref, 'pref-scanlines');
        GameState.settings.animationsEnabled = _isChecked(ref, 'pref-animations');
        GameState.settings.musicMuted = !_isChecked(ref, 'pref-music');
        GameState.settings.sfxMuted = !_isChecked(ref, 'pref-sfx');
        GameState.settings.theme = selectedTheme;
        _applyScanlines();
        _applyAnimations();
        _applyTheme();
        _updateDynamicItems();
        DatabaseBridge.saveProgress(GameState);
      }},
      { label: 'Cancel' }
    ], { width: 340 });

    // Wire toggle clicks
    ref.body.querySelectorAll('.pref-toggle').forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        this.classList.toggle('checked');
      });
    });

    // Wire theme swatch clicks
    ref.body.querySelectorAll('.theme-swatch').forEach(function(swatch) {
      swatch.addEventListener('click', function() {
        selectedTheme = this.dataset.theme;
        // Update visual selection
        ref.body.querySelectorAll('.theme-swatch').forEach(function(s) {
          s.style.outline = '';
        });
        this.style.outline = '2px solid #000';
        this.style.outlineOffset = '1px';
        // Live preview
        document.body.style.backgroundColor = _getThemeColor(selectedTheme);
      });
    });
  }

  function _prefRow(label, id, checked) {
    return '<div class="pref-row">' +
      '<span class="pref-label">' + label + '</span>' +
      '<div class="pref-toggle' + (checked ? ' checked' : '') + '" id="' + id + '"></div>' +
    '</div>';
  }

  function _isChecked(ref, id) {
    var el = ref.body.querySelector('#' + id);
    return el && el.classList.contains('checked');
  }

  // -------------------------------------------------------------------------
  // Player Stats dialog
  // -------------------------------------------------------------------------

  function _showPlayerStats() {
    var p = GameState.profile;
    var w = GameState.worlds;
    var completed = 0;
    var worldKeys = Object.keys(w);
    for (var i = 0; i < worldKeys.length; i++) {
      if (w[worldKeys[i]].completed) completed++;
    }

    var html =
      '<div class="dialog-body-sunken">' +
      'PLAYER STATS\n' +
      '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n' +
      'Name:            ' + p.name + '\n' +
      'Score:           ' + GameState.player.score.toLocaleString() + '\n' +
      'Moo-Coins:       ' + p.mooCoins.toLocaleString() + '\n' +
      'Games Played:    ' + p.gamesPlayed + '\n' +
      'Worlds Completed: ' + completed + ' / ' + worldKeys.length + '\n' +
      'Items in Inventory: ' + GameState.inventory.equipment.length +
      '</div>';

    MenuDialogs.custom('Player Stats \u2014 ' + p.name, html, [
      { label: 'Close', primary: true }
    ], { width: 380 });
  }

  // -------------------------------------------------------------------------
  // Import save
  // -------------------------------------------------------------------------

  function _triggerImport() {
    var input = document.getElementById('save-import-input');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'save-import-input';
      input.accept = '.moo,.json';
      document.body.appendChild(input);
    }
    input.value = '';
    input.onchange = function() {
      if (input.files.length > 0) {
        DatabaseBridge.importSave(input.files[0]).then(function(data) {
          if (data.player) Object.assign(GameState.player, data.player);
          if (data.tutorial) Object.assign(GameState.tutorial, data.tutorial);
          if (data.worlds) Object.assign(GameState.worlds, data.worlds);
          if (data.settings) Object.assign(GameState.settings, data.settings);
          if (data.inventory) Object.assign(GameState.inventory, data.inventory);
          if (data.profile) Object.assign(GameState.profile, data.profile);
          DatabaseBridge.saveProgress(GameState);
          DatabaseBridge.saveInventory(GameState.inventory);
          DatabaseBridge.saveProfile(GameState.profile);
          _updateDynamicItems();
          MenuDialogs.toast('Save imported successfully!');
        }).catch(function(err) {
          MenuDialogs.alert('Import Error', 'Could not read save file: ' + err.message);
        });
      }
    };
    input.click();
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function _getCompletedQuestsText() {
    var w = GameState.worlds;
    var any = false;
    var text = '';
    var names = {
      emerald_pastures: 'Emerald Pastures',
      crystal_caves: 'Crystal Caves',
      lava_meadows: 'Lava Meadows',
      cloud_kingdom: 'Cloud Kingdom',
      shadow_barn: 'Shadow Barn',
      rainbow_falls: 'Rainbow Falls'
    };
    Object.keys(w).forEach(function(key) {
      if (w[key].completed) {
        any = true;
        text += '\u2713 ' + names[key] + '  (Best: ' + w[key].bestScore + ')\n';
      }
    });
    if (!any) text = 'No quests completed yet.\n\nDefeat worlds to fill this log!';
    return text;
  }

  function _applyTheme() {
    var color = _getThemeColor(GameState.settings.theme || 'teal');
    document.body.style.backgroundColor = color;
  }

  function _getThemeColor(themeId) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === themeId) return THEMES[i].color;
    }
    return '#008080';
  }

  function _applyScanlines() {
    document.querySelectorAll('.scanline').forEach(function(el) {
      el.style.setProperty('--scanline-opacity', GameState.settings.scanlinesEnabled ? '1' : '0');
      if (!GameState.settings.scanlinesEnabled) {
        el.classList.add('scanline-off');
      } else {
        el.classList.remove('scanline-off');
      }
    });
  }

  function _applyAnimations() {
    var root = document.documentElement;
    if (GameState.settings.animationsEnabled) {
      root.style.removeProperty('--anim-play-state');
    } else {
      root.style.setProperty('--anim-play-state', 'paused');
    }
    document.querySelectorAll('.blink, .marquee-text').forEach(function(el) {
      el.style.animationPlayState = GameState.settings.animationsEnabled ? 'running' : 'paused';
    });
  }

  function _updateDynamicItems() {
    // Update Moo-Coins display in inventory menu
    var coinsEl = document.querySelector('[data-action="coins"]');
    if (coinsEl) {
      coinsEl.textContent = '\ud83e\ude99 Moo-Coins: ' + GameState.profile.mooCoins.toLocaleString();
    }

    // Update scanlines checkmark
    var scanCheck = document.querySelector('[data-action="toggleScanlines"] .check');
    if (scanCheck) scanCheck.textContent = GameState.settings.scanlinesEnabled ? '\u2713' : '';

    // Update animations checkmark
    var animCheck = document.querySelector('[data-action="toggleAnimations"] .check');
    if (animCheck) animCheck.textContent = GameState.settings.animationsEnabled ? '\u2713' : '';
  }

  function _loadPersistedState() {
    // Load inventory and profile from localStorage on page load
    DatabaseBridge.loadInventory().then(function(inv) {
      if (inv) Object.assign(GameState.inventory, inv);
    });
    DatabaseBridge.loadProfile().then(function(prof) {
      if (prof) Object.assign(GameState.profile, prof);
      _updateDynamicItems();
    });
    // Load saved game progress for settings (theme, etc.)
    DatabaseBridge.loadProgress().then(function(data) {
      if (data && data.settings) {
        Object.assign(GameState.settings, data.settings);
        _applyTheme();
        _applyScanlines();
        _applyAnimations();
        _updateDynamicItems();
      }
    });
  }

  function _isOnLandingPage() {
    var main = document.getElementById('main-content');
    return main && main.style.display !== 'none';
  }

  return { init: init, closeAll: closeAll };

})();
