// =============================================================================
// popup-manager.js — Creates, positions, drags, and manages popup windows
// =============================================================================

const PopupManager = {
  container: null,
  popups: [],
  junkPopups: [],
  highestZ: 100,
  _dragState: null,
  onChoiceCallback: null,
  _pendingCount: 0,
  _currentPhase: 0,

  // Pool of junk popup templates — pure annoyance, no story impact
  _junkPool: [
    { style: 'prize', title: 'FREE Cursor Pack!!!', icon: '&#128433;', body: '<p>Download <b>500+ ANIMATED CURSORS</b> including a dinosaur that follows your mouse!</p>', btnText: 'OK' },
    { style: 'warning', title: 'PC Speed Alert', icon: '&#9888;', body: '<p>Your computer is running <b>47% slower</b> than other computers in your area!</p><p>Click OK to do absolutely nothing about it.</p>', btnText: 'OK' },
    { style: 'money', title: 'Hot Deal Alert!', icon: '&#128176;', body: '<p>You\'ve been pre-approved for a credit card with <b>99.9% APR!</b></p><p>That\'s almost <b>100%!</b> What a number!</p>', btnText: 'No Thanks' },
    { style: 'clickbait', title: 'SHOCKING!!', icon: '&#128562;', body: '<p>Local man clicks popup, you won\'t BELIEVE what happens next!</p><p>(Nothing. Nothing happens.)</p>', btnText: 'Wow' },
    { style: 'download', title: 'Update Available', icon: '&#128190;', body: '<p><b>BargainBuddy v6.9</b> wants to update.</p><p>You didn\'t install this. Nobody installed this. It just appeared.</p>', btnText: 'OK (I guess)' },
    { style: 'dating', title: 'Message From CyberLover!', icon: '&#128149;', body: '<p>"Hey there! I\'m definitely a real person and not a bot! Want to chat? My hobbies include existing and having a face!"</p>', btnText: 'Close' },
    { style: 'prize', title: 'SPIN THE WHEEL!!', icon: '&#127905;', body: '<p>You\'ve been selected to <b>SPIN THE WHEEL</b> of prizes!</p><p>The wheel has 47 sections. All of them say "TOOLBAR".</p>', btnText: 'I\'ll Pass' },
    { style: 'warning', title: 'Memory Low', icon: '&#9888;', body: '<p>Your computer is running low on memory because it\'s trying to remember all the bad decisions you\'ve made today.</p>', btnText: 'Fair' },
    { style: 'bonzi', title: 'Bonzi Says Hi!', icon: '&#128053;', body: '<p>"Hey friend! Just wanted to remind you that I\'m still here! I\'ll always be here! <b>ALWAYS.</b>"</p>', btnText: 'Please Stop' },
    { style: 'money', title: 'Tax Refund!!', icon: '&#128176;', body: '<p>The IRS owes YOU money! Click to claim your <b>$3.50</b> refund!</p><p class="fine-print">*Processing fee: $499.99</p>', btnText: 'Nope' },
    { style: 'weird', title: 'Fun Fact!', icon: '&#129300;', body: '<p>Did you know? The average internet user in 1997 closes <b>847 popups per session</b>.</p><p>You\'re doing great!</p>', btnText: 'Thanks?' },
    { style: 'download', title: 'Toolbar Installed!', icon: '&#10004;', body: '<p><b>WeatherBug Pro SearchBar</b> was successfully installed!</p><p>You didn\'t ask for this. Welcome to the internet.</p>', btnText: 'Why' },
  ],

  _xCloseCount: 0,
  _buttonClickCount: 0,

  init(containerId) {
    this.container = document.getElementById(containerId);
    this.popups = [];
    this.junkPopups = [];
    this.highestZ = 100;
    this._pendingCount = 0;
    this._currentPhase = 0;
    this._xCloseCount = 0;
    this._buttonClickCount = 0;

    // Global mouse handlers for dragging
    document.addEventListener('mousemove', (e) => this._onMouseMove(e));
    document.addEventListener('mouseup', () => this._onMouseUp());
    // Touch support
    document.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    document.addEventListener('touchend', () => this._onMouseUp());
  },

  spawnPopup(popupId, popupData, position, onChoice) {
    this.onChoiceCallback = onChoice;
    this._pendingCount++;

    const el = document.createElement('div');
    el.className = `popup-window popup-style-${popupData.style}`;
    el.dataset.popupId = popupId;
    el.style.left = position.x + 'px';
    el.style.top = position.y + 'px';
    el.style.zIndex = ++this.highestZ;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'popup-title-bar';
    titleBar.innerHTML = `
      <span class="popup-title-icon">${popupData.icon}</span>
      <span class="popup-title-text">${popupData.title}</span>
      <div class="popup-title-buttons">
        <span class="popup-title-btn" data-action="minimize">_</span>
        <span class="popup-title-btn popup-close-btn" data-action="close">X</span>
      </div>
    `;

    // Body
    const body = document.createElement('div');
    body.className = 'popup-body';
    body.innerHTML = popupData.body;

    // Buttons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'popup-buttons';

    popupData.buttons.forEach((btn, index) => {
      const button = document.createElement('button');
      button.className = 'popup-choice-btn';
      button.textContent = btn.text;
      button.addEventListener('click', () => {
        this._buttonClickCount++;
        this._handleChoice(popupId, index, btn);
        this._removePopup(el);
      });
      buttonsDiv.appendChild(button);
    });

    el.appendChild(titleBar);
    el.appendChild(body);
    el.appendChild(buttonsDiv);

    // Drag handling
    titleBar.addEventListener('mousedown', (e) => this._onDragStart(e, el));
    titleBar.addEventListener('touchstart', (e) => this._onTouchStart(e, el), { passive: false });

    // Click to bring to front
    el.addEventListener('mousedown', () => {
      el.style.zIndex = ++this.highestZ;
    });

    // Close button behavior
    const closeBtn = titleBar.querySelector('.popup-close-btn');

    // Dodge behavior — popup moves away when you try to close it
    if (popupData.dodgy) {
      let dodgeCount = 0;
      const maxDodges = 2 + Math.floor(Math.random() * 2); // 2-3 dodges
      closeBtn.addEventListener('mouseenter', () => {
        if (dodgeCount >= maxDodges) return;
        dodgeCount++;
        const dx = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 60);
        const dy = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 50);
        el.style.transition = 'left 0.2s ease-out, top 0.2s ease-out';
        el.style.left = Math.max(10, Math.min(el.offsetLeft + dx, window.innerWidth - 350)) + 'px';
        el.style.top = Math.max(10, Math.min(el.offsetTop + dy, window.innerHeight - 300)) + 'px';
        setTimeout(() => { el.style.transition = ''; }, 250);
      });
    }

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Trick close — spawn junk popups instead of just closing
      if (popupData.trickClose) {
        const junkCount = 1 + Math.floor(Math.random() * 2); // 1-2 junk popups
        for (let j = 0; j < junkCount; j++) {
          setTimeout(() => this.spawnJunkPopup(el), j * 200);
        }
      }
      // X close = neutral choice (no traits, no items) for safe ending tracking
      this._xCloseCount++;
      this._handleChoice(popupId, -1, { text: '[X]', traits: {}, item: null });
      this._removePopup(el);
    });

    this.container.appendChild(el);
    this.popups.push(el);

    // Sound effect
    if (typeof SoundFX !== 'undefined') SoundFX.play('popup');

    // Add taskbar item
    this._addTaskbarItem(popupId, popupData.title, el);

    // Start countdown timer if present
    const countdown = body.querySelector('.countdown');
    if (countdown) this._startCountdown(countdown);

    // Keep popup in bounds
    requestAnimationFrame(() => this._keepInBounds(el));

    return el;
  },

  spawnMultiple(popupDefs, onChoice, delayBetween) {
    const delay = delayBetween || 600;
    const containerRect = this.container.getBoundingClientRect();
    const positions = this._calculatePositions(popupDefs.length, containerRect);

    popupDefs.forEach((def, i) => {
      setTimeout(() => {
        this.spawnPopup(def.id, def.data, positions[i], onChoice);
      }, i * delay);
    });
  },

  _calculatePositions(count, rect) {
    const positions = [];
    const margin = 40;
    const popupW = 380;
    const popupH = 350;
    const availW = rect.width - margin * 2 - 150; // reserve space for avatar
    const availH = rect.height - margin * 2;

    if (count === 1) {
      positions.push({
        x: (availW - popupW) / 2 + margin,
        y: (availH - popupH) / 2 + margin
      });
    } else if (count === 2) {
      positions.push({ x: margin + 20, y: margin + 40 });
      positions.push({ x: margin + 180, y: margin + 120 });
    } else if (count === 3) {
      positions.push({ x: margin, y: margin + 20 });
      positions.push({ x: margin + 200, y: margin + 60 });
      positions.push({ x: margin + 80, y: margin + 160 });
    }

    // Add some randomness
    return positions.map(p => ({
      x: Math.max(10, p.x + (Math.random() - 0.5) * 60),
      y: Math.max(10, p.y + (Math.random() - 0.5) * 40)
    }));
  },

  _handleChoice(popupId, choiceIndex, btnData) {
    // Record this click in trait system
    TraitSystem.recordClick(popupId);
    const isFirst = TraitSystem.isFirstClick(popupId);

    // Apply trait changes
    if (btnData.traits) {
      TraitSystem.addTraits(btnData.traits, isFirst);
    }

    // Add item to avatar
    if (btnData.item) {
      AvatarSystem.addItem(btnData.item);
    }

    this._pendingCount--;

    // Notify game
    if (this.onChoiceCallback) {
      this.onChoiceCallback(popupId, choiceIndex, btnData, this._pendingCount);
    }
  },

  _removePopup(el) {
    el.style.transition = 'transform 0.2s, opacity 0.2s';
    el.style.transform = 'scale(0.8)';
    el.style.opacity = '0';
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
      this.popups = this.popups.filter(p => p !== el);
      this._removeTaskbarItem(el.dataset.popupId);

      // Popup multiplication — chance to spawn junk on dismiss
      if (this._currentPhase === 2 && Math.random() < 0.15) {
        this.spawnJunkPopup(el);
      } else if (this._currentPhase === 3 && Math.random() < 0.30) {
        const count = 1 + Math.floor(Math.random() * 2);
        for (let j = 0; j < count; j++) {
          setTimeout(() => this.spawnJunkPopup(null), j * 300);
        }
      }
    }, 200);
  },

  clearAll() {
    this.popups.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    this.junkPopups.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    this.popups = [];
    this.junkPopups = [];
    this._pendingCount = 0;
    this._currentPhase = 0;
    const taskbarItems = document.getElementById('taskbar-items');
    if (taskbarItems) taskbarItems.innerHTML = '';
  },

  setPhase(phase) {
    this._currentPhase = phase;
  },

  // Spawn a junk popup near a source popup (or random position)
  spawnJunkPopup(sourceEl) {
    if (!this.container) return;
    const template = this._junkPool[Math.floor(Math.random() * this._junkPool.length)];

    const el = document.createElement('div');
    el.className = `popup-window popup-style-${template.style}`;
    el.style.zIndex = ++this.highestZ;

    // Position near source or random
    if (sourceEl) {
      el.style.left = Math.max(10, sourceEl.offsetLeft + (Math.random() - 0.5) * 120) + 'px';
      el.style.top = Math.max(10, sourceEl.offsetTop + (Math.random() - 0.5) * 80) + 'px';
    } else {
      el.style.left = (50 + Math.random() * (window.innerWidth - 400)) + 'px';
      el.style.top = (50 + Math.random() * (window.innerHeight - 300)) + 'px';
    }

    el.innerHTML = `
      <div class="popup-title-bar">
        <span class="popup-title-icon">${template.icon}</span>
        <span class="popup-title-text">${template.title}</span>
        <div class="popup-title-buttons">
          <span class="popup-title-btn popup-close-btn" data-action="close">X</span>
        </div>
      </div>
      <div class="popup-body">${template.body}</div>
      <div class="popup-buttons">
        <button class="popup-choice-btn">${template.btnText}</button>
      </div>
    `;

    // Close on button click or X click
    const closeJunk = () => {
      el.style.transition = 'transform 0.15s, opacity 0.15s';
      el.style.transform = 'scale(0.8)';
      el.style.opacity = '0';
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
        this.junkPopups = this.junkPopups.filter(p => p !== el);
      }, 150);
    };

    el.querySelector('.popup-choice-btn').addEventListener('click', closeJunk);
    el.querySelector('.popup-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      closeJunk();
    });

    // Drag on title bar
    const titleBar = el.querySelector('.popup-title-bar');
    titleBar.addEventListener('mousedown', (e) => this._onDragStart(e, el));

    // Click to bring to front
    el.addEventListener('mousedown', () => { el.style.zIndex = ++this.highestZ; });

    this.container.appendChild(el);
    this.junkPopups.push(el);
  },

  // Spawn a simple error dialog (used by desktop icons, start menu, etc.)
  spawnErrorDialog(title, icon, body, buttonText) {
    if (!this.container) return;
    const el = document.createElement('div');
    el.className = 'popup-window popup-style-download';
    el.style.zIndex = ++this.highestZ;
    el.style.minWidth = '280px';
    el.style.maxWidth = '360px';
    el.style.left = (window.innerWidth / 2 - 160 + (Math.random() - 0.5) * 80) + 'px';
    el.style.top = (window.innerHeight / 2 - 120 + (Math.random() - 0.5) * 60) + 'px';

    el.innerHTML = `
      <div class="popup-title-bar" style="background:linear-gradient(90deg,#000080,#1084d0);">
        <span class="popup-title-icon">${icon || '&#9888;'}</span>
        <span class="popup-title-text">${title}</span>
        <div class="popup-title-buttons">
          <span class="popup-title-btn popup-close-btn" data-action="close">X</span>
        </div>
      </div>
      <div class="popup-body" style="display:flex;gap:12px;align-items:flex-start;">
        <span style="font-size:32px;line-height:1;">${icon || '&#9888;'}</span>
        <div>${body}</div>
      </div>
      <div class="popup-buttons" style="flex-direction:row;justify-content:center;">
        <button class="popup-choice-btn" style="min-width:80px;">${buttonText || 'OK'}</button>
      </div>
    `;

    const closeDialog = () => {
      el.style.transition = 'transform 0.15s, opacity 0.15s';
      el.style.transform = 'scale(0.8)';
      el.style.opacity = '0';
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 150);
    };

    el.querySelector('.popup-choice-btn').addEventListener('click', closeDialog);
    el.querySelector('.popup-close-btn').addEventListener('click', (e) => { e.stopPropagation(); closeDialog(); });
    const titleBar = el.querySelector('.popup-title-bar');
    titleBar.addEventListener('mousedown', (e) => this._onDragStart(e, el));
    el.addEventListener('mousedown', () => { el.style.zIndex = ++this.highestZ; });

    this.container.appendChild(el);
  },

  getOpenCount() {
    return this.popups.length;
  },

  getCloseStats() {
    return { xCloses: this._xCloseCount, buttonClicks: this._buttonClickCount };
  },

  // --- DRAG HANDLING ---

  _onDragStart(e, el) {
    if (e.target.closest('.popup-title-btn')) return;
    e.preventDefault();
    el.style.zIndex = ++this.highestZ;
    this._dragState = {
      el: el,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.offsetLeft,
      origY: el.offsetTop
    };
  },

  _onTouchStart(e, el) {
    if (e.target.closest('.popup-title-btn')) return;
    e.preventDefault();
    const touch = e.touches[0];
    el.style.zIndex = ++this.highestZ;
    this._dragState = {
      el: el,
      startX: touch.clientX,
      startY: touch.clientY,
      origX: el.offsetLeft,
      origY: el.offsetTop
    };
  },

  _onMouseMove(e) {
    if (!this._dragState) return;
    const dx = e.clientX - this._dragState.startX;
    const dy = e.clientY - this._dragState.startY;
    this._dragState.el.style.left = (this._dragState.origX + dx) + 'px';
    this._dragState.el.style.top = (this._dragState.origY + dy) + 'px';
  },

  _onTouchMove(e) {
    if (!this._dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - this._dragState.startX;
    const dy = touch.clientY - this._dragState.startY;
    this._dragState.el.style.left = (this._dragState.origX + dx) + 'px';
    this._dragState.el.style.top = (this._dragState.origY + dy) + 'px';
  },

  _onMouseUp() {
    this._dragState = null;
  },

  _keepInBounds(el) {
    const rect = el.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    if (rect.right > containerRect.right - 10) {
      el.style.left = (containerRect.width - rect.width - 10) + 'px';
    }
    if (rect.bottom > containerRect.bottom - 10) {
      el.style.top = (containerRect.height - rect.height - 10) + 'px';
    }
  },

  // --- TASKBAR ---

  _addTaskbarItem(popupId, title, el) {
    const taskbar = document.getElementById('taskbar-items');
    if (!taskbar) return;
    const item = document.createElement('div');
    item.className = 'taskbar-item active';
    item.dataset.popupId = popupId;
    item.textContent = title;
    item.addEventListener('click', () => {
      el.style.zIndex = ++this.highestZ;
    });
    taskbar.appendChild(item);
  },

  _removeTaskbarItem(popupId) {
    const taskbar = document.getElementById('taskbar-items');
    if (!taskbar) return;
    const item = taskbar.querySelector(`[data-popup-id="${popupId}"]`);
    if (item) item.remove();
  },

  // --- COUNTDOWN ---

  _startCountdown(el) {
    let seconds = parseInt(el.textContent.split(':')[1]) || 47;
    const interval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        el.textContent = '0:00';
        clearInterval(interval);
      } else {
        el.textContent = '0:' + String(seconds).padStart(2, '0');
      }
    }, 1000);
  }
};
