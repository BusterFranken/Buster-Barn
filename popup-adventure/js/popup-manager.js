// =============================================================================
// popup-manager.js — Creates, positions, drags, and manages popup windows
// =============================================================================

const PopupManager = {
  container: null,
  popups: [],
  highestZ: 100,
  _dragState: null,
  onChoiceCallback: null,
  _pendingCount: 0,

  init(containerId) {
    this.container = document.getElementById(containerId);
    this.popups = [];
    this.highestZ = 100;
    this._pendingCount = 0;

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

    // Close button — doesn't make a choice, just dismisses
    const closeBtn = titleBar.querySelector('.popup-close-btn');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Closing without choosing = default to the cautious option (last button)
      const lastBtn = popupData.buttons[popupData.buttons.length - 1];
      this._handleChoice(popupId, popupData.buttons.length - 1, lastBtn);
      this._removePopup(el);
    });

    this.container.appendChild(el);
    this.popups.push(el);

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
    }, 200);
  },

  clearAll() {
    this.popups.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    this.popups = [];
    this._pendingCount = 0;
    const taskbarItems = document.getElementById('taskbar-items');
    if (taskbarItems) taskbarItems.innerHTML = '';
  },

  getOpenCount() {
    return this.popups.length;
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
