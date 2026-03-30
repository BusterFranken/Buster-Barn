// =============================================================================
// main.js — Game orchestrator: boot sequence, game flow, IE window
// =============================================================================

const Game = {
  currentNode: null,
  phase: 0,
  malwareLevel: 0,
  _bonziInterval: null,
  _bonziActive: false,
  _startMenuOpen: false,
  _iconClickIndex: {},
  _degradationTier: 0,
  _ieToolbarCount: 0,
  _bootLines: [
    'BIOS v4.20 - Loading...',
    'Detecting hard drive... 2.1 GB OK',
    'RAM check... 32 MB OK',
    'Loading Windows 95...',
    '',
    'C:\\> Starting POPUP-ADVENTURE.EXE',
    'C:\\> Loading Internet Explorer 4.0...',
    'C:\\> Connecting to dial-up...',
    '',
    '*SCREEEEECH* *BZZZT* *KRRRRR* *DING DING DING*',
    '',
    'Connected to the INFORMATION SUPERHIGHWAY!',
    '',
    'Welcome to the internet. Click carefully.',
    '(Or don\'t. We\'re not your mom.)',
  ],

  init() {
    PopupManager.init('popup-layer');
    AvatarSystem.init('avatar-canvas');
    EndingSystem.init();
    SoundFX.init();
    this.malwareLevel = 0;
    this._degradationTier = 0;
    this._ieToolbarCount = 0;
    this._iconClickIndex = {};
    this._updateClock();
    setInterval(() => this._updateClock(), 60000);
  },

  start() {
    this.init();
    this._playBootSequence();
  },

  restart() {
    // Clean up
    const overlay = document.getElementById('ending-overlay');
    overlay.className = '';
    overlay.style.display = 'none';
    overlay.innerHTML = '';

    // Remove cascade popups
    document.querySelectorAll('.cascade-popup').forEach(el => el.remove());

    // Remove IE window
    const ie = document.querySelector('.ie-window');
    if (ie) ie.remove();

    // Reset systems
    TraitSystem.reset();
    PopupManager.clearAll();
    AvatarSystem.init('avatar-canvas');

    // Reset phase indicator
    const indicator = document.getElementById('phase-indicator');
    if (indicator) indicator.style.display = 'none';

    // Reset degradation
    const desktop = document.getElementById('desktop');
    desktop.className = '';
    document.querySelectorAll('.junk-desktop-icon').forEach(el => el.remove());

    // Reset BonziBuddy
    this._deactivateBonziBuddy();

    // Reset system tray
    document.querySelectorAll('.tray-icon-dynamic').forEach(el => el.remove());
    document.querySelectorAll('.tray-notification').forEach(el => el.remove());

    // Reset start menu
    this._startMenuOpen = false;
    const startMenu = document.getElementById('start-menu');
    if (startMenu) startMenu.style.display = 'none';

    // Reset phase transition
    const transition = document.getElementById('phase-transition');
    if (transition) transition.style.display = 'none';

    // Reset easter egg overlay
    const easterEgg = document.getElementById('easter-egg-overlay');
    if (easterEgg) { easterEgg.className = ''; easterEgg.innerHTML = ''; }

    // Remove notepad window
    const notepad = document.querySelector('.notepad-window');
    if (notepad) notepad.remove();

    // Reset webring & guestbook
    this._currentWebringIndex = 0;
    this._guestbookEntries = [
      { name: '~*SuRfErGuRl98*~', date: '12/03/1997', message: 'OMG cool site!!! Check out MY page too!! www.angelfire.com/~surfergurl98 I have SO many gifs!!' },
      { name: 'Anonymous', date: '11/28/1997', message: 'first!!!!!!' },
      { name: 'WebMaster_Dave', date: '11/15/1997', message: 'Hey nice page! I added you to my links page. Can you add me back? My site is about my cat Whiskers. He has his own email address now.' },
      { name: 'sk8rboi_420', date: '10/22/1997', message: 'this page is rad dude. do u have any cheat codes for goldeneye?? also how do i get rid of a purple monkey on my desktop asking for my credit card' }
    ];

    // Reset icon positions
    document.querySelectorAll('.desktop-icon:not(.junk-desktop-icon)').forEach(icon => {
      const pos = this._iconPositions[icon.dataset.icon];
      if (pos) { icon.style.left = pos.x + 'px'; icon.style.top = pos.y + 'px'; }
    });

    this.currentNode = null;
    this.phase = 0;
    this.malwareLevel = 0;
    this._degradationTier = 0;
    this._ieToolbarCount = 0;

    // Restart
    this._playBootSequence();
  },

  _playBootSequence() {
    const bootScreen = document.getElementById('boot-screen');
    bootScreen.style.display = 'flex';
    const textEl = bootScreen.querySelector('.boot-text');
    textEl.innerHTML = '';

    let lineIndex = 0;
    const typeNextLine = () => {
      if (lineIndex >= this._bootLines.length) {
        // Boot complete — fade out
        setTimeout(() => {
          bootScreen.style.transition = 'opacity 0.5s';
          bootScreen.style.opacity = '0';
          setTimeout(() => {
            bootScreen.style.display = 'none';
            bootScreen.style.opacity = '1';
            bootScreen.style.transition = '';
            this._showDesktop();
          }, 500);
        }, 800);
        return;
      }

      const line = this._bootLines[lineIndex];
      const lineEl = document.createElement('div');

      if (line === '') {
        lineEl.innerHTML = '&nbsp;';
        textEl.appendChild(lineEl);
        lineIndex++;
        setTimeout(typeNextLine, 200);
      } else {
        // Type out the line character by character
        lineEl.textContent = '';
        textEl.appendChild(lineEl);

        let charIndex = 0;
        const typeChar = () => {
          if (charIndex >= line.length) {
            lineIndex++;
            setTimeout(typeNextLine, lineIndex <= 5 ? 150 : 300);
            return;
          }
          lineEl.textContent += line[charIndex];
          charIndex++;
          // Scroll to bottom
          textEl.scrollTop = textEl.scrollHeight;
          setTimeout(typeChar, lineIndex <= 5 ? 20 : 35);
        };
        typeChar();
      }
    };

    typeNextLine();
  },

  _showDesktop() {
    this._setupDesktopIcons();
    this._setupStartMenu();

    // Close start menu when clicking desktop
    document.getElementById('desktop').addEventListener('click', (e) => {
      if (!e.target.closest('#start-button') && !e.target.closest('#start-menu')) {
        this._closeStartMenu();
      }
    });

    // Auto-open IE after a short delay
    setTimeout(() => {
      this._openIE();
    }, 500);
  },

  // Icon dialog content — each icon has multiple responses
  _iconDialogs: {
    'my-computer': [
      { title: 'My Computer', icon: '&#128187;', body: '<p><b>C:\\ Drive Contents:</b></p><ul><li>TOOLBARS (47 GB)</li><li>homework (empty)</li><li>definitely_not_viruses (38 GB)</li><li>New Folder (2) (3) (4) (final) (FINAL2)</li></ul>', btn: 'Close' },
      { title: 'My Computer', icon: '&#128187;', body: '<p><b>System Properties:</b></p><p>Processor: Pentium 133 MHz</p><p>RAM: 32 MB (28 MB used by toolbars)</p><p>Available disk space: LOL</p>', btn: 'OK' },
      { title: 'Error', icon: '&#9888;', body: '<p>C:\\ drive not found.</p><p>Did you check under the desk?</p>', btn: 'I\'ll Look' },
    ],
    'recycle-bin': [
      { title: 'Recycle Bin', icon: '&#128465;', body: '<p>Recycle Bin contains:</p><ul><li>Your browser history</li><li>Your dignity</li><li>47 toolbars</li><li>That email from Prince Abayomi you deleted</li></ul><p>Empty Recycle Bin?</p>', btn: 'Empty' },
      { title: 'Error', icon: '&#9888;', body: '<p>Recycle Bin cannot be emptied.</p><p>The toolbars have become <b>sentient</b> and refuse to leave.</p>', btn: 'Oh No' },
      { title: 'Recycle Bin', icon: '&#128465;', body: '<p>The Recycle Bin is judging you for what you put in here.</p>', btn: 'Sorry' },
    ],
    'notepad': [
      { title: 'Notepad - diary.txt', icon: '&#128196;', body: '<p style="font-family:Courier New,monospace;font-size:11px;white-space:pre-wrap;">dear diary,\n\ntoday i clicked on a pop-up and i\'m not sure what happened but now there\'s a purple monkey on my desktop and my credit card statement looks weird.\n\nalso i think i\'m a nigerian prince now?\n\ni should probably close some of these windows.\n\n- me, 1997</p>', btn: 'Close' },
    ],
    'minesweeper': [
      { title: 'Minesweeper', icon: '&#128163;', body: '<p><b>MINESWEEPER.EXE</b> has been replaced by <b>TOOLBAR.EXE</b>.</p><p>Every cell is a toolbar. You lose.</p><p>&#128163;&#128163;&#128163;<br>&#128163;&#128163;&#128163;<br>&#128163;&#128163;&#128163;</p>', btn: 'I Lost' },
      { title: 'Minesweeper', icon: '&#128163;', body: '<p>Minesweeper would like to access:</p><ul><li>&#10004; Your contacts</li><li>&#10004; Your bank account</li><li>&#10004; Your deepest fears</li></ul><p>This is normal for Minesweeper.</p>', btn: 'Seems Fine' },
    ],
  },

  // Initial icon positions matching the old flex column layout
  _iconPositions: {
    'my-computer':  { x: 16, y: 16 },
    'recycle-bin':  { x: 16, y: 108 },
    'ie':           { x: 16, y: 200 },
    'notepad':      { x: 16, y: 292 },
    'minesweeper':  { x: 16, y: 384 }
  },
  _iconDragState: null,

  _setupDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');

    // Set initial absolute positions
    icons.forEach(icon => {
      const pos = this._iconPositions[icon.dataset.icon];
      if (pos) {
        icon.style.left = pos.x + 'px';
        icon.style.top = pos.y + 'px';
      }
    });

    // Drag handling for desktop icons
    const DRAG_THRESHOLD = 5;

    const onIconMouseDown = (e, icon) => {
      if (e.button !== 0) return;
      icons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      this._iconDragState = {
        icon: icon,
        startX: e.clientX,
        startY: e.clientY,
        origX: icon.offsetLeft,
        origY: icon.offsetTop,
        dragged: false
      };
      e.preventDefault();
    };

    const onIconTouchStart = (e, icon) => {
      icons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      const touch = e.touches[0];
      this._iconDragState = {
        icon: icon,
        startX: touch.clientX,
        startY: touch.clientY,
        origX: icon.offsetLeft,
        origY: icon.offsetTop,
        dragged: false
      };
    };

    document.addEventListener('mousemove', (e) => {
      if (!this._iconDragState) return;
      const s = this._iconDragState;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      if (!s.dragged && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      s.dragged = true;
      s.icon.classList.add('dragging');
      s.icon.style.left = (s.origX + dx) + 'px';
      s.icon.style.top = (s.origY + dy) + 'px';

      // Highlight recycle bin if hovering over it
      const bin = document.querySelector('[data-icon="recycle-bin"]');
      if (bin && s.icon !== bin) {
        const binRect = bin.getBoundingClientRect();
        const iconRect = s.icon.getBoundingClientRect();
        const cx = iconRect.left + iconRect.width / 2;
        const cy = iconRect.top + iconRect.height / 2;
        const overBin = cx > binRect.left - 20 && cx < binRect.right + 20 &&
                        cy > binRect.top - 20 && cy < binRect.bottom + 20;
        bin.classList.toggle('drop-target', overBin);
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (!this._iconDragState) return;
      const s = this._iconDragState;
      const touch = e.touches[0];
      const dx = touch.clientX - s.startX;
      const dy = touch.clientY - s.startY;
      if (!s.dragged && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      s.dragged = true;
      s.icon.classList.add('dragging');
      s.icon.style.left = (s.origX + dx) + 'px';
      s.icon.style.top = (s.origY + dy) + 'px';
      e.preventDefault();
    }, { passive: false });

    const onDragEnd = () => {
      if (!this._iconDragState) return;
      const s = this._iconDragState;
      s.icon.classList.remove('dragging');

      // Remove drop target highlight
      const bin = document.querySelector('[data-icon="recycle-bin"]');
      if (bin) bin.classList.remove('drop-target');

      // Check if dropped on recycle bin
      if (s.dragged && bin && s.icon !== bin) {
        const binRect = bin.getBoundingClientRect();
        const iconRect = s.icon.getBoundingClientRect();
        const cx = iconRect.left + iconRect.width / 2;
        const cy = iconRect.top + iconRect.height / 2;
        const overBin = cx > binRect.left - 20 && cx < binRect.right + 20 &&
                        cy > binRect.top - 20 && cy < binRect.bottom + 20;

        if (overBin) {
          this._onDropInTrash(s.icon);
          this._iconDragState = null;
          return;
        }
      }

      this._iconDragState = null;
    };

    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);

    // Set up click/dblclick handlers
    icons.forEach(icon => {
      icon.addEventListener('mousedown', (e) => onIconMouseDown(e, icon));
      icon.addEventListener('touchstart', (e) => onIconTouchStart(e, icon), { passive: true });

      icon.addEventListener('dblclick', () => {
        if (this._iconDragState && this._iconDragState.dragged) return;
        const iconType = icon.dataset.icon;
        if (iconType === 'ie') {
          this._openIE();
        } else if (iconType === 'notepad') {
          this._openNotepad();
        } else if (this._iconDialogs[iconType]) {
          if (!this._iconClickIndex[iconType]) this._iconClickIndex[iconType] = 0;
          const dialogs = this._iconDialogs[iconType];
          const d = dialogs[this._iconClickIndex[iconType] % dialogs.length];
          this._iconClickIndex[iconType]++;
          SoundFX.play('error');
          PopupManager.spawnErrorDialog(d.title, d.icon, d.body, d.btn);
        }
      });
    });
  },

  // ===== TRASH EASTER EGGS =====

  _onDropInTrash(icon) {
    const iconType = icon.dataset.icon;
    const origPos = this._iconPositions[iconType];

    if (iconType === 'my-computer') {
      this._showEasterEggBSOD();
      // Snap back after
      setTimeout(() => {
        icon.style.left = origPos.x + 'px';
        icon.style.top = origPos.y + 'px';
      }, 100);
    } else if (iconType === 'ie') {
      this._showEasterEggInternetDeleted();
      // Close IE window if open
      const ieWin = document.querySelector('.ie-window');
      if (ieWin) ieWin.remove();
      const tbItem = document.querySelector('[data-popup-id="ie-window"]');
      if (tbItem) tbItem.remove();
      // Snap back after
      setTimeout(() => {
        icon.style.left = origPos.x + 'px';
        icon.style.top = origPos.y + 'px';
      }, 100);
    } else {
      // Other icons - show error dialog
      const names = {
        'notepad': 'Notepad',
        'minesweeper': 'Minesweeper'
      };
      const name = names[iconType] || iconType;
      this._showTrashError(name);
      icon.style.left = origPos.x + 'px';
      icon.style.top = origPos.y + 'px';
    }
  },

  _showEasterEggBSOD() {
    const overlay = document.getElementById('easter-egg-overlay');
    overlay.className = 'active';
    overlay.innerHTML = `
      <div class="easter-bsod">
        <h1>Windows</h1>
        <p>A fatal exception 0E has occurred at C:\\DESKTOP\\WHAT_DID_YOU_DO</p>
        <p>&nbsp;</p>
        <p>You just tried to throw your own computer in the trash.</p>
        <p>&nbsp;</p>
        <p>That's... that's not how recycling works.</p>
        <p>You can't delete yourself. This isn't The Matrix.</p>
        <p>&nbsp;</p>
        <p>The computer is the thing you're USING right now.</p>
        <p>Where did you think this window would go?</p>
        <p>&nbsp;</p>
        <p style="animation: blink-text 1s steps(2) infinite;">Press any key to reconsider your life choices...</p>
      </div>
    `;

    const dismiss = () => {
      overlay.className = '';
      overlay.innerHTML = '';
      document.removeEventListener('click', dismiss);
      document.removeEventListener('keydown', dismiss);
    };
    setTimeout(() => {
      document.addEventListener('click', dismiss);
      document.addEventListener('keydown', dismiss);
    }, 500);
  },

  _showEasterEggInternetDeleted() {
    const overlay = document.getElementById('easter-egg-overlay');
    overlay.className = 'active';
    overlay.innerHTML = `
      <div class="easter-internet-deleted">
        <h1>YOU DELETED THE INTERNET</h1>
        <p>&nbsp;</p>
        <p>The Information Superhighway has been closed.</p>
        <p>All 847 websites have been destroyed.</p>
        <p>&nbsp;</p>
        <p>Al Gore is crying somewhere.</p>
        <p>47 Nigerian princes just lost their only source of income.</p>
        <p>BonziBuddy is homeless now. Are you happy?</p>
        <p>&nbsp;</p>
        <p>The World Wide Web is being rebuilt...</p>
        <p style="font-size:14px;color:#009900;margin-top:20px;animation: blink-text 1s steps(2) infinite;">Reconnecting in a few seconds...</p>
      </div>
    `;

    setTimeout(() => {
      overlay.style.transition = 'opacity 0.5s';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.className = '';
        overlay.innerHTML = '';
        overlay.style.opacity = '1';
        overlay.style.transition = '';
      }, 500);
    }, 4000);
  },

  _showTrashError(name) {
    SoundFX.play('error');
    const dialog = document.createElement('div');
    dialog.className = 'easter-error-dialog';
    dialog.style.left = (window.innerWidth / 2 - 140) + 'px';
    dialog.style.top = (window.innerHeight / 2 - 80) + 'px';
    dialog.innerHTML = `
      <div class="error-title">Error Deleting File</div>
      <div class="error-body">
        <div class="error-icon">&#9888;</div>
        <div class="error-text">
          Cannot delete <b>${name}</b>.<br><br>
          ${name} is in use by: <b>you, right now, on this computer</b>.<br><br>
          Maybe don't throw away things you're actively using?
        </div>
      </div>
      <div class="error-buttons">
        <button class="error-btn">OK</button>
      </div>
    `;
    document.getElementById('desktop').appendChild(dialog);
    dialog.querySelector('.error-btn').addEventListener('click', () => dialog.remove());
  },

  // ===== NOTEPAD WINDOW =====

  _openNotepad() {
    if (document.querySelector('.notepad-window')) return;

    const layer = document.getElementById('popup-layer');
    const notepad = document.createElement('div');
    notepad.className = 'notepad-window';
    notepad.style.pointerEvents = 'all';
    notepad.style.left = '120px';
    notepad.style.top = '60px';

    notepad.innerHTML = `
      <div class="popup-title-bar" style="background:linear-gradient(90deg,#000080,#1084d0);cursor:move;">
        <span class="popup-title-icon">&#128196;</span>
        <span class="popup-title-text">definitely_not_diary.txt - Notepad</span>
        <div class="popup-title-buttons">
          <span class="popup-title-btn">_</span>
          <span class="popup-title-btn">&square;</span>
          <span class="popup-title-btn" data-action="close">X</span>
        </div>
      </div>
      <div class="notepad-menubar">
        <span class="notepad-menu-item">File</span>
        <span class="notepad-menu-item">Edit</span>
        <span class="notepad-menu-item">Search</span>
        <span class="notepad-menu-item">Help</span>
      </div>
      <div class="notepad-content">dear diary,

today i downloaded 14 toolbars and my browser is only
showing 2 pixels of the actual website. i think this
is fine. everything is fine.

note to self: STOP giving my credit card number to
websites that promise free stuff. last time i ended up
with 47 emails from a nigerian prince. we are pen pals
now. he seems nice. says im getting $14 million soon.

shopping list:
- more RAM (heard you can download it??)
- a second computer (this one is 90% virus)
- floppy disks (need 847 of them for one jpeg)
- new chair (this one is sticky for some reason)

passwords (DO NOT SHOW ANYONE):
- email: password123
- bank: also_password123
- secret government files: password124 (extra secure)
- neopets: xXdragonslayer420Xx

IMPORTANT: do NOT click the monkey. i repeat DO NOT
click the purple monkey. he says he's your buddy but
he is NOT your buddy. he read my emails. he knows about
the neopets thing. he knows everything.

reminder: ask jeeves how to delete browser history
before mom gets home from work at 5

why is there a monkey on my desktop
how do i close the monkey
the monkey is talking to me now
i think the monkey and i are friends actually
no wait the monkey just emailed my boss
THE MONKEY IS NOT MY FRIEND

update: the toolbar union has made demands. they want
healthcare and a dental plan. i dont know what to do.
im just a kid. im 12.</div>
    `;

    layer.appendChild(notepad);

    // Draggable
    const titleBar = notepad.querySelector('.popup-title-bar');
    let dragging = false, startX, startY, origX, origY;
    titleBar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.popup-title-btn')) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      origX = notepad.offsetLeft; origY = notepad.offsetTop;
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      notepad.style.left = (origX + e.clientX - startX) + 'px';
      notepad.style.top = (origY + e.clientY - startY) + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });

    // Close button
    notepad.querySelector('[data-action="close"]').addEventListener('click', () => {
      notepad.style.transition = 'transform 0.2s, opacity 0.2s';
      notepad.style.transform = 'scale(0.8)';
      notepad.style.opacity = '0';
      setTimeout(() => {
        if (notepad.parentNode) notepad.remove();
        const tbItem = document.querySelector('[data-popup-id="notepad-window"]');
        if (tbItem) tbItem.remove();
      }, 200);
    });

    // Taskbar item
    const taskbar = document.getElementById('taskbar-items');
    const tbItem = document.createElement('div');
    tbItem.className = 'taskbar-item';
    tbItem.textContent = 'Notepad';
    tbItem.dataset.popupId = 'notepad-window';
    taskbar.appendChild(tbItem);
  },

  // ===== WEBRING & GUESTBOOK =====

  _currentWebringIndex: 0,
  _guestbookEntries: [
    { name: '~*SuRfErGuRl98*~', date: '12/03/1997', message: 'OMG cool site!!! Check out MY page too!! www.angelfire.com/~surfergurl98 I have SO many gifs!!' },
    { name: 'Anonymous', date: '11/28/1997', message: 'first!!!!!!' },
    { name: 'WebMaster_Dave', date: '11/15/1997', message: 'Hey nice page! I added you to my links page. Can you add me back? My site is about my cat Whiskers. He has his own email address now.' },
    { name: 'sk8rboi_420', date: '10/22/1997', message: 'this page is rad dude. do u have any cheat codes for goldeneye?? also how do i get rid of a purple monkey on my desktop asking for my credit card' }
  ],

  _webringPages: [
    {
      url: 'http://www.coolsite99.com/welcome.htm',
      title: '~*~ Welcome to CoolSite99 ~*~',
      subtitle: "Your #1 source for COOL stuff on the INFORMATION SUPERHIGHWAY!",
      marquee: '*** HOT NEW LINKS *** FREE STUFF *** COOL DOWNLOADS *** SIGN MY GUESTBOOK *** YOU ARE VISITOR #00847 ***',
      content: "Hey there surfer! Thanks for stopping by my awesome website!<br>I made this page all by myself using Microsoft FrontPage!<br>Don't forget to add me to your bookmarks!",
      counter: '00,847',
      hasGuestbook: true
    },
    {
      url: 'http://www.bobs-lizard-page.geocities.com/index.htm',
      title: "BOB'S LIZARD PAGE",
      subtitle: "The Internet's #1 Lizard Appreciation Site Since 1996!",
      marquee: "*** NEW: PICS OF MY GECKO GERALD *** LIZARD FACTS *** DID YOU KNOW GECKOS CAN LICK THEIR OWN EYEBALLS ***",
      content: "Welcome to Bob's Lizard Page! My name is Bob and I LOVE lizards!!!<br><br>Gerald (my gecko) says hi! He can't actually talk but I know what he's thinking.<br><br>LIZARD FACT: Lizards have been around for 200 million years. They've seen things. Terrible things.<br><br>Please don't tell my wife about this page she thinks I'm working.",
      counter: '00,124',
      hasGuestbook: false
    },
    {
      url: 'http://www.midi-palace.net/collection.htm',
      title: '~~ MIDI PALACE ~~',
      subtitle: 'Over 200 MIDIs! Hear your favorite songs in glorious 16-bit!',
      marquee: "*** NOW PLAYING: finalcountdown.mid *** HIT COUNTER BROKEN AGAIN *** SORRY ABOUT THE AUTOPLAY ***",
      content: "Welcome to MIDI Palace! Click below to hear amazing MIDI versions of your favorite songs!<br><br>&#127925; finalcountdown.mid (4 KB)<br>&#127925; macarena.mid (3 KB)<br>&#127925; barbie_girl.mid (5 KB)<br>&#127925; sandstorm.mid (2 KB)<br>&#127925; my_heart_will_go_on.mid (7 KB)<br><br>All MIDIs lovingly converted by hand in Cakewalk. Some notes may be wrong. All notes may be wrong.",
      counter: '01,337',
      hasGuestbook: false
    },
    {
      url: 'http://xXx-DaRk-AnGeL-xXx.tripod.com/enter.htm',
      title: 'xXx DaRk AnGeL\'s PaGe xXx',
      subtitle: '~ Enter my realm of darkness... and cat pictures ~',
      marquee: "*** UNDER CONSTRUCTION *** AOL KEYWORD: DARKANGEL *** MY MOM SAYS I HAVE TO BE OFF BY 9 ***",
      content: "Hi my name is Brittany but online I go by DaRk AnGeL xXx<br><br>I am 13 and I like: the craft, black nail polish, my cat Mr. Whiskers, and HTML<br><br>I HATE: my brother Kevin, homework, and people who steal my guestbook HTML<br><br>&#128008; Mr. Whiskers says: *hiss* (he's in a mood today)<br><br>Sign my guestbook or Mr. Whiskers will curse you!! (not really but please sign it I only have 2 entries and one is my mom)",
      counter: '00,042',
      hasGuestbook: false
    }
  ],

  _getWebringPageHTML(index) {
    const page = this._webringPages[index];
    let guestbookHTML = '';
    if (page.hasGuestbook) {
      guestbookHTML = `
        <p style="font-size:10px;color:#888;margin-top:4px;">
          <a class="guestbook-link" data-action="sign-guestbook">Sign my Guestbook!</a> |
          <a class="guestbook-link" data-action="view-guestbook">View Guestbook</a> (${this._guestbookEntries.length} entries)
        </p>`;
    }
    return `
      <div class="construction"></div>
      <h1>${page.title}</h1>
      <p style="font-family:'Comic Sans MS',cursive;font-size:14px;">${page.subtitle}</p>
      <div class="ie-marquee"><span>${page.marquee}</span></div>
      <p style="font-family:'Comic Sans MS',cursive;font-size:12px;margin:12px 0;">${page.content}</p>
      <div class="construction"></div>
      <div class="visitor-counter">Visitors: ${page.counter}</div>
      <p class="webring">[ <a class="guestbook-link" data-action="webring-prev">Previous</a> | <b>CoolSite99 WebRing</b> | <a class="guestbook-link" data-action="webring-next">Next</a> ]</p>
      <p style="font-size:10px;color:#888;margin-top:12px;">Best viewed in 800x600 with Netscape Navigator 4.0 | Last updated: 12/15/1997</p>
      ${guestbookHTML}
    `;
  },

  _getGuestbookViewHTML() {
    let entriesHTML = this._guestbookEntries.map(e => `
      <div class="guestbook-entry">
        <span class="gb-name">${e.name}</span><span class="gb-date">${e.date}</span>
        <div class="gb-message">${e.message}</div>
      </div>
    `).join('');
    return `
      <div class="construction"></div>
      <h1 style="font-size:18px;">CoolSite99 Guestbook</h1>
      <p style="font-family:'Comic Sans MS',cursive;font-size:12px;margin:8px 0;">${this._guestbookEntries.length} entries! Thanks for signing!</p>
      ${entriesHTML}
      <p style="margin-top:12px;">
        <a class="guestbook-link" data-action="sign-guestbook">Sign the Guestbook!</a> |
        <a class="guestbook-link" data-action="back-to-site">Back to CoolSite99</a>
      </p>
    `;
  },

  _getGuestbookSignHTML() {
    return `
      <div class="construction"></div>
      <h1 style="font-size:18px;">Sign My Guestbook!</h1>
      <p style="font-family:'Comic Sans MS',cursive;font-size:12px;margin:8px 0;">Leave a message and I'll read it probably!</p>
      <div class="guestbook-form" style="text-align:left;padding:0 16px;">
        <label>Your Name (or cool handle):</label>
        <input type="text" id="gb-name-input" placeholder="~*YourName*~" maxlength="30">
        <label>Your Message:</label>
        <textarea id="gb-message-input" placeholder="Cool site dude!!" maxlength="200"></textarea>
        <div style="text-align:center;">
          <button class="guestbook-submit" data-action="submit-guestbook">Sign It!</button>
        </div>
        <p style="font-size:10px;color:#888;margin-top:8px;text-align:center;">
          <a class="guestbook-link" data-action="back-to-site">Back to CoolSite99</a>
        </p>
      </div>
    `;
  },

  _handleIEContentClick(e) {
    const link = e.target.closest('[data-action]');
    if (!link) return;

    const action = link.dataset.action;
    const ie = document.querySelector('.ie-window');
    if (!ie) return;
    const page = ie.querySelector('.ie-page');
    const addressInput = ie.querySelector('.ie-address-bar input');

    switch (action) {
      case 'webring-prev':
        this._currentWebringIndex = (this._currentWebringIndex - 1 + this._webringPages.length) % this._webringPages.length;
        page.innerHTML = this._getWebringPageHTML(this._currentWebringIndex);
        addressInput.value = this._webringPages[this._currentWebringIndex].url;
        break;
      case 'webring-next':
        this._currentWebringIndex = (this._currentWebringIndex + 1) % this._webringPages.length;
        page.innerHTML = this._getWebringPageHTML(this._currentWebringIndex);
        addressInput.value = this._webringPages[this._currentWebringIndex].url;
        break;
      case 'view-guestbook':
        page.innerHTML = this._getGuestbookViewHTML();
        addressInput.value = 'http://www.coolsite99.com/guestbook.htm';
        break;
      case 'sign-guestbook':
        page.innerHTML = this._getGuestbookSignHTML();
        addressInput.value = 'http://www.coolsite99.com/guestbook_sign.htm';
        break;
      case 'submit-guestbook': {
        const nameInput = document.getElementById('gb-name-input');
        const msgInput = document.getElementById('gb-message-input');
        const name = (nameInput && nameInput.value.trim()) || 'Anonymous_Surfer';
        const message = (msgInput && msgInput.value.trim()) || 'Cool site!';
        const now = new Date();
        const date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
        this._guestbookEntries.push({ name, date, message });
        page.innerHTML = this._getGuestbookViewHTML();
        addressInput.value = 'http://www.coolsite99.com/guestbook.htm';
        break;
      }
      case 'back-to-site':
        this._currentWebringIndex = 0;
        page.innerHTML = this._getWebringPageHTML(0);
        addressInput.value = this._webringPages[0].url;
        break;
    }
  },

  _openIE() {
    // Don't open multiple IE windows
    if (document.querySelector('.ie-window')) return;

    const layer = document.getElementById('popup-layer');
    const ie = document.createElement('div');
    ie.className = 'ie-window';
    ie.style.pointerEvents = 'all';
    ie.style.left = '80px';
    ie.style.top = '30px';

    ie.innerHTML = `
      <div class="popup-title-bar" style="background:linear-gradient(90deg,#000080,#1084d0);cursor:move;">
        <span class="popup-title-icon">&#127760;</span>
        <span class="popup-title-text">CoolSite99.com - Internet Explorer</span>
        <div class="popup-title-buttons">
          <span class="popup-title-btn">_</span>
          <span class="popup-title-btn">&square;</span>
          <span class="popup-title-btn" data-action="close">X</span>
        </div>
      </div>
      <div class="ie-toolbar">
        <div class="ie-address-bar">
          <label>Address:</label>
          <input type="text" value="http://www.coolsite99.com/welcome.htm" readonly>
        </div>
      </div>
      <div id="ie-toolbar-stack"></div>
      <div class="ie-content">
        <div class="ie-page">${this._getWebringPageHTML(0)}</div>
      </div>
    `;

    layer.appendChild(ie);

    // Make IE draggable
    const titleBar = ie.querySelector('.popup-title-bar');
    let dragging = false, startX, startY, origX, origY;

    titleBar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.popup-title-btn')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origX = ie.offsetLeft;
      origY = ie.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      ie.style.left = (origX + e.clientX - startX) + 'px';
      ie.style.top = (origY + e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => { dragging = false; });

    // IE content link delegation (webring, guestbook)
    const ieContent = ie.querySelector('.ie-content');
    ieContent.addEventListener('click', (e) => this._handleIEContentClick(e));

    // Close button
    ie.querySelector('[data-action="close"]').addEventListener('click', () => {
      ie.style.transition = 'transform 0.2s, opacity 0.2s';
      ie.style.transform = 'scale(0.8)';
      ie.style.opacity = '0';
      setTimeout(() => {
        if (ie.parentNode) ie.remove();
        const tbItem = document.querySelector('[data-popup-id="ie-window"]');
        if (tbItem) tbItem.remove();
      }, 200);
    });

    // Add taskbar item for IE
    const taskbar = document.getElementById('taskbar-items');
    const tbItem = document.createElement('div');
    tbItem.className = 'taskbar-item';
    tbItem.textContent = 'Internet Explorer';
    tbItem.dataset.popupId = 'ie-window';
    taskbar.appendChild(tbItem);

    // After IE loads, start the popups!
    setTimeout(() => {
      this._startPhase1();
    }, 2000);
  },

  _startPhase1() {
    this.currentNode = 'start';
    this.phase = 1;
    this._updatePhaseIndicator();
    TraitSystem.resetPhaseOrder();
    this._spawnNodePopups('start');
  },

  _spawnNodePopups(nodeId) {
    const node = StoryTree.getNode(nodeId);
    if (!node || !node.popups) return;

    const popupDefs = node.popups.map(pid => ({
      id: pid,
      data: StoryTree.getPopup(pid)
    })).filter(d => d.data);

    PopupManager.spawnMultiple(popupDefs, (popupId, choiceIndex, btnData, remaining) => {
      this._onChoice(popupId, choiceIndex, btnData, remaining);
    }, 800);
  },

  _onChoice(popupId, choiceIndex, btnData, remaining) {
    SoundFX.play('click');

    // Track malware level — risky choices (index 0 with bad traits) increase it
    if (choiceIndex === 0 && btnData.traits) {
      const badTraits = (btnData.traits.gullibility || 0) + (btnData.traits.recklessness || 0) + (btnData.traits.greed || 0);
      if (badTraits > 0) {
        this.malwareLevel += Math.min(badTraits, 3);
        this._updateDegradation();
      }
    }

    // Check if BonziBuddy was just installed
    if (btnData.item && btnData.item.id === 'bonzi_buddy') {
      setTimeout(() => this._activateBonziBuddy(), 1000);
    }

    // Check if this choice triggers an ending directly
    if (btnData.ending) {
      setTimeout(() => {
        EndingSystem.play(btnData.ending);
      }, 500);
      return;
    }

    // If no more popups in this phase, advance
    if (remaining <= 0) {
      setTimeout(() => {
        this._advanceStory();
      }, 800);
    }
  },

  _advanceStory() {
    const currentNodeData = StoryTree.getNode(this.currentNode);
    if (!currentNodeData || !currentNodeData.next) return;

    const nextNodeId = currentNodeData.next;
    const nextNode = StoryTree.getNode(nextNodeId);

    if (!nextNode) return;

    // Reset phase click order for new phase
    TraitSystem.resetPhaseOrder();

    const doSpawn = () => {
      if (nextNode.type === 'gate' || nextNode.type === 'ending_gate') {
        // Check for safe ending — player closed ALL popups with X
        if (nextNode.type === 'ending_gate') {
          const stats = PopupManager.getCloseStats();
          if (stats.buttonClicks === 0 && stats.xCloses > 0) {
            this.phase = 4;
            this._updatePhaseIndicator();
            setTimeout(() => EndingSystem.play('safe'), 500);
            return;
          }
        }
        const resolvedNode = StoryTree.resolveGate(nextNodeId);
        if (resolvedNode) {
          let resolvedKey = null;
          for (const [key, val] of Object.entries(StoryTree.nodes)) {
            if (val === resolvedNode) { resolvedKey = key; break; }
          }

          if (resolvedKey) {
            this.currentNode = resolvedKey;
            this.phase = resolvedNode.phase || this.phase + 1;
            this._updatePhaseIndicator();
            this._spawnNodePopups(resolvedKey);
          } else if (resolvedNode.popups) {
            this.phase = resolvedNode.phase || 4;
            this._updatePhaseIndicator();
            const popupDefs = resolvedNode.popups.map(pid => ({
              id: pid, data: StoryTree.getPopup(pid)
            })).filter(d => d.data);
            PopupManager.spawnMultiple(popupDefs, (popupId, choiceIndex, btnData, remaining) => {
              this._onChoice(popupId, choiceIndex, btnData, remaining);
            }, 800);
          }
        }
      } else {
        this.currentNode = nextNodeId;
        this.phase = nextNode.phase || this.phase + 1;
        this._updatePhaseIndicator();
        this._spawnNodePopups(nextNodeId);
      }
    };

    // Show phase transition before spawning next popups
    this._showPhaseTransition(doSpawn);
  },

  _updatePhaseIndicator() {
    PopupManager.setPhase(this.phase);
    const indicator = document.getElementById('phase-indicator');
    if (indicator) {
      const phaseNames = {
        1: 'PHASE 1: Welcome to the Internet',
        2: 'PHASE 2: The Rabbit Hole',
        3: 'PHASE 3: The Escalation',
        4: 'PHASE 4: The Reckoning'
      };
      indicator.textContent = phaseNames[this.phase] || `PHASE ${this.phase}`;
      indicator.style.display = 'block';
    }
  },

  _updateClock() {
    const clock = document.getElementById('clock');
    if (clock) {
      // At high malware, clock glitches
      if (this._degradationTier >= 4 && Math.random() < 0.3) {
        clock.textContent = Math.floor(Math.random() * 12 + 1) + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0') + ' PM';
        return;
      }
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      clock.textContent = `${h}:${m} ${ampm}`;
    }
  },

  // ===== DESKTOP DEGRADATION =====

  _updateDegradation() {
    const desktop = document.getElementById('desktop');
    let newTier = 0;
    if (this.malwareLevel >= 8) newTier = 4;
    else if (this.malwareLevel >= 6) newTier = 3;
    else if (this.malwareLevel >= 4) newTier = 2;
    else if (this.malwareLevel >= 2) newTier = 1;

    if (newTier > this._degradationTier) {
      this._degradationTier = newTier;

      // Apply desktop degradation class
      desktop.className = '';
      if (newTier > 0) desktop.classList.add('desktop-degraded-' + newTier);

      // Add IE toolbars
      this._syncIEToolbars(newTier);

      // Add junk desktop icons at higher tiers
      if (newTier >= 2) this._addJunkDesktopIcon('FREE_SCREENSAVERS.lnk', '&#128444;');
      if (newTier >= 3) {
        this._addJunkDesktopIcon('HOT_DEALS.url', '&#128293;');
        this._addJunkDesktopIcon('CLICK_ME.exe', '&#128163;');
      }
      if (newTier >= 4) {
        this._addJunkDesktopIcon('toolbar_installer.bat', '&#128295;');
        this._addJunkDesktopIcon('definitely_safe.scr', '&#128128;');
      }

      // System tray notifications
      this._addTrayIcon(newTier);
      this._showTrayNotification(newTier);
    }
  },

  _syncIEToolbars(tier) {
    const stack = document.getElementById('ie-toolbar-stack');
    if (!stack) return;

    const toolbarNames = [
      'BonziBuddy SearchBar',
      'WeatherBug Live',
      'Ask Jeeves Quick Search',
      'CoolWebSearch Navigator',
      'ShopAtHome Savings Bar'
    ];

    while (this._ieToolbarCount < tier && this._ieToolbarCount < toolbarNames.length) {
      const bar = document.createElement('div');
      bar.className = 'ie-extra-toolbar';
      bar.innerHTML = `<span class="ie-tb-icon">&#128269;</span> <span>${toolbarNames[this._ieToolbarCount]}</span>`;
      stack.appendChild(bar);
      this._ieToolbarCount++;
    }
  },

  _addJunkDesktopIcon(name, emoji) {
    if (document.querySelector(`.junk-desktop-icon[data-name="${name}"]`)) return;
    const container = document.getElementById('desktop-icons');
    const icon = document.createElement('div');
    icon.className = 'desktop-icon junk-desktop-icon';
    icon.dataset.name = name;
    // Random position on the right side of the desktop
    icon.style.left = (100 + Math.random() * (window.innerWidth - 300)) + 'px';
    icon.style.top = (16 + Math.random() * (window.innerHeight - 150)) + 'px';
    icon.innerHTML = `<div class="icon-image">${emoji}</div><span>${name}</span>`;
    icon.addEventListener('dblclick', () => {
      SoundFX.play('error');
      PopupManager.spawnErrorDialog('Error', '&#9888;',
        `<p><b>${name}</b> is not responding.</p><p>It never was. It was never a real program.</p>`, 'End Task');
    });
    container.appendChild(icon);
  },

  // ===== SYSTEM TRAY =====

  _addTrayIcon(tier) {
    const tray = document.getElementById('system-tray');
    if (!tray) return;
    const icons = ['&#128737;', '&#127760;', '&#9888;', '&#128163;', '&#128128;'];
    const icon = document.createElement('span');
    icon.className = 'tray-icon-dynamic';
    icon.textContent = '';
    icon.innerHTML = icons[tier - 1] || '&#9888;';
    icon.style.cursor = 'pointer';
    icon.style.fontSize = '12px';
    tray.insertBefore(icon, tray.querySelector('#clock'));
  },

  _showTrayNotification(tier) {
    const messages = [
      'New toolbar installed successfully!',
      'WeatherBug: It\'s raining malware!',
      '47 critical updates available!',
      'Your CPU is 98% toolbar.',
      'You\'ve Got Mail! (it\'s all spam)',
    ];
    const tray = document.getElementById('system-tray');
    if (!tray) return;

    const note = document.createElement('div');
    note.className = 'tray-notification';
    note.textContent = messages[tier - 1] || messages[0];
    tray.appendChild(note);

    setTimeout(() => {
      note.style.opacity = '0';
      setTimeout(() => note.remove(), 500);
    }, 3000);
  },

  // ===== START MENU =====

  _setupStartMenu() {
    const startBtn = document.getElementById('start-button');
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._startMenuOpen) this._closeStartMenu();
      else this._openStartMenu();
    });
  },

  _openStartMenu() {
    let menu = document.getElementById('start-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'start-menu';
      document.getElementById('desktop').appendChild(menu);
    }

    menu.innerHTML = `
      <div class="start-menu-sidebar">Windows<br>95</div>
      <div class="start-menu-items">
        <div class="start-menu-item" data-action="programs">&#128194; Programs <span class="menu-arrow">&#9654;</span></div>
        <div class="start-menu-item" data-action="documents">&#128196; Documents <span class="menu-hint">(all toolbars)</span></div>
        <div class="start-menu-item" data-action="settings">&#9881; Settings <span class="menu-hint">(you can't)</span></div>
        <div class="start-menu-item" data-action="find">&#128269; Find <span class="menu-hint">(your dignity)</span></div>
        <div class="start-menu-item" data-action="help">&#10067; Help <span class="menu-hint">(there is none)</span></div>
        <div class="start-menu-item" data-action="run">&#9654; Run <span class="menu-hint">(away)</span></div>
        <div class="start-menu-divider"></div>
        <div class="start-menu-item" data-action="shutdown">&#128308; Shut Down...</div>
      </div>
    `;
    menu.style.display = 'flex';
    this._startMenuOpen = true;

    menu.querySelectorAll('.start-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this._closeStartMenu();
        SoundFX.play('error');
        const responses = {
          programs: '<p>All programs have been replaced by toolbars.</p><p>You have 47 toolbars. That\'s your programs now.</p>',
          documents: '<p>Recent documents:</p><ul><li>toolbar_license.txt</li><li>toolbar_license (2).txt</li><li>why_so_many_toolbars.doc</li><li>help_me.txt</li></ul>',
          settings: '<p>Settings cannot be changed.</p><p>The toolbars have locked you out.</p><p>They\'re in charge now.</p>',
          find: '<p>Searching for: your dignity</p><p>...</p><p>0 results found.</p>',
          help: '<p>Help topics available:</p><ul><li>How to install more toolbars</li><li>Why you can\'t uninstall toolbars</li><li>Learning to love toolbars</li></ul>',
          run: '<p>You try to run but the popups are faster.</p><p>They\'re always faster.</p>',
          shutdown: '<p>Windows cannot shut down because <b>47 toolbars</b> are preventing it.</p><p>The toolbars have formed a union. They have demands.</p>',
        };
        PopupManager.spawnErrorDialog(
          action === 'shutdown' ? 'Shut Down Windows' : 'Windows 95',
          action === 'shutdown' ? '&#128308;' : '&#128187;',
          responses[action] || '<p>This feature has been replaced by a toolbar.</p>',
          'OK'
        );
      });
    });
  },

  _closeStartMenu() {
    const menu = document.getElementById('start-menu');
    if (menu) menu.style.display = 'none';
    this._startMenuOpen = false;
  },

  // ===== BONZIBUDDY =====

  _activateBonziBuddy() {
    if (this._bonziActive) return;
    this._bonziActive = true;

    const bonzi = document.getElementById('bonzi-buddy');
    if (!bonzi) return;
    bonzi.style.display = 'flex';

    const phrases = [
      "It looks like you're being scammed! Would you like help?",
      "I'm sending your data to 47 countries! You're welcome!",
      "You can't uninstall best friends!",
      "Did you know I can read your emails? Fun!",
      "I noticed you have credit cards. Tell me more!",
      "Let me search that for you! Searching... I forgot.",
      "You should install more toolbars! I love toolbars!",
      "I'm not spyware! That's exactly what spyware would say!",
      "Your computer is running slow. That's my fault. Sorry!",
      "Want to hear a joke? Your privacy! Ha ha!",
      "I'll be here forever. FOREVER. Like a good friend.",
      "BonziBuddy tip: never close popups. They're your friends too!",
    ];

    let phraseIndex = 0;
    const showPhrase = () => {
      const bubble = bonzi.querySelector('.bonzi-speech');
      if (bubble) {
        bubble.textContent = phrases[phraseIndex % phrases.length];
        bubble.style.display = 'block';
        phraseIndex++;
        setTimeout(() => { bubble.style.display = 'none'; }, 4000);
      }
    };

    // Show first phrase after a beat
    setTimeout(showPhrase, 2000);
    this._bonziInterval = setInterval(showPhrase, 10000);
  },

  _deactivateBonziBuddy() {
    this._bonziActive = false;
    if (this._bonziInterval) {
      clearInterval(this._bonziInterval);
      this._bonziInterval = null;
    }
    const bonzi = document.getElementById('bonzi-buddy');
    if (bonzi) bonzi.style.display = 'none';
  },

  // ===== PHASE TRANSITIONS =====

  _phaseMessages: {
    2: "The internet is watching. It knows what you clicked.\nThe popups can smell your curiosity...",
    3: "The malware is evolving. It learns from your choices.\nIt knows what you want. It knows what you FEAR.",
    4: "This is it. The point of no return.\nYour clicks have consequences."
  },

  _showPhaseTransition(callback) {
    const msg = this._phaseMessages[this.phase];
    if (!msg) { callback(); return; }

    const overlay = document.getElementById('phase-transition');
    if (!overlay) { callback(); return; }

    overlay.style.display = 'flex';
    overlay.innerHTML = '<div class="phase-transition-text"></div>';
    const textEl = overlay.querySelector('.phase-transition-text');

    const lines = msg.split('\n');
    let lineIdx = 0;

    const typeLine = () => {
      if (lineIdx >= lines.length) {
        // Done typing — hold then fade
        setTimeout(() => {
          overlay.style.transition = 'opacity 0.5s';
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '1';
            overlay.style.transition = '';
            callback();
          }, 500);
        }, 1000);
        return;
      }

      const lineEl = document.createElement('div');
      lineEl.style.marginBottom = '8px';
      textEl.appendChild(lineEl);

      let charIdx = 0;
      const line = lines[lineIdx];
      const typeChar = () => {
        if (charIdx >= line.length) {
          lineIdx++;
          setTimeout(typeLine, 400);
          return;
        }
        lineEl.textContent += line[charIdx];
        charIdx++;
        setTimeout(typeChar, 40);
      };
      typeChar();
    };

    SoundFX.play('transition');
    typeLine();
  }
};

// =============================================================================
// SoundFX — Procedurally generated retro sounds via Web Audio API
// =============================================================================

const SoundFX = {
  ctx: null,
  muted: false,

  init() {
    // Lazy init on first user interaction (autoplay policy)
    const unlock = () => {
      if (!this.ctx) {
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) { /* no audio support */ }
      }
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);

    // Mute toggle on speaker icon
    const tray = document.getElementById('system-tray');
    if (tray) {
      const speaker = tray.querySelector('span');
      if (speaker) {
        speaker.style.cursor = 'pointer';
        speaker.addEventListener('click', () => {
          this.muted = !this.muted;
          speaker.innerHTML = this.muted ? '&#128263;' : '&#128264;';
        });
      }
    }
  },

  play(type) {
    if (!this.ctx || this.muted) return;
    try {
      const methods = {
        popup: () => this._twoTone(600, 800, 0.08),
        click: () => this._twoTone(1000, 800, 0.04),
        error: () => this._chord([400, 500, 300], 0.12),
        close: () => this._twoTone(800, 500, 0.06),
        transition: () => this._sweep(200, 80, 0.8),
      };
      const fn = methods[type];
      if (fn) fn();
    } catch(e) { /* fail silently */ }
  },

  _twoTone(f1, f2, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
    osc.frequency.setValueAtTime(f2, this.ctx.currentTime + dur);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur * 2);
    osc.start();
    osc.stop(this.ctx.currentTime + dur * 2);
  },

  _chord(freqs, dur) {
    freqs.forEach((f, i) => {
      setTimeout(() => this._twoTone(f, f * 0.9, dur), i * (dur * 1000));
    });
  },

  _sweep(startF, endF, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(startF, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endF, this.ctx.currentTime + dur);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }
};

// ===== LAUNCH ON DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  Game.start();
});
