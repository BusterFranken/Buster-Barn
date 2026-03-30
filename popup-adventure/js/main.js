// =============================================================================
// main.js — Game orchestrator: boot sequence, game flow, IE window
// =============================================================================

const Game = {
  currentNode: null,
  phase: 0,
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

    this.currentNode = null;
    this.phase = 0;

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
    // Desktop is already visible, just set up click handlers
    this._setupDesktopIcons();

    // Auto-open IE after a short delay
    setTimeout(() => {
      this._openIE();
    }, 500);
  },

  _setupDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
      icon.addEventListener('dblclick', () => {
        const iconType = icon.dataset.icon;
        if (iconType === 'ie') {
          this._openIE();
        }
      });
      icon.addEventListener('click', () => {
        icons.forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
      });
    });
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
          <span class="popup-title-btn">X</span>
        </div>
      </div>
      <div class="ie-toolbar">
        <div class="ie-address-bar">
          <label>Address:</label>
          <input type="text" value="http://www.coolsite99.com/welcome.htm" readonly>
        </div>
      </div>
      <div class="ie-content">
        <div class="ie-page">
          <div class="construction"></div>
          <h1>~*~ Welcome to CoolSite99 ~*~</h1>
          <p style="font-family:'Comic Sans MS',cursive;font-size:14px;">Your #1 source for COOL stuff on the INFORMATION SUPERHIGHWAY!</p>
          <div class="ie-marquee">
            <span>*** HOT NEW LINKS *** FREE STUFF *** COOL DOWNLOADS *** SIGN MY GUESTBOOK *** YOU ARE VISITOR #00847 ***</span>
          </div>
          <p style="font-family:'Comic Sans MS',cursive;font-size:12px;margin:12px 0;">
            Hey there surfer! Thanks for stopping by my awesome website!<br>
            I made this page all by myself using Microsoft FrontPage!<br>
            Don't forget to add me to your bookmarks!
          </p>
          <div class="construction"></div>
          <div class="visitor-counter">Visitors: 00,847</div>
          <p class="webring">[ <a class="guestbook-link">Previous</a> | <b>CoolSite99 WebRing</b> | <a class="guestbook-link">Next</a> ]</p>
          <p style="font-size:10px;color:#888;margin-top:12px;">Best viewed in 800x600 with Netscape Navigator 4.0 | Last updated: 12/15/1997</p>
          <p style="font-size:10px;color:#888;margin-top:4px;"><a class="guestbook-link">Sign my Guestbook!</a> | <a class="guestbook-link">View Guestbook</a> (3 entries)</p>
        </div>
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

    if (nextNode.type === 'gate' || nextNode.type === 'ending_gate') {
      // Resolve the gate to get the actual next node
      const resolvedNode = StoryTree.resolveGate(nextNodeId);
      if (resolvedNode) {
        // Find the key for this resolved node
        let resolvedKey = null;
        for (const [key, val] of Object.entries(StoryTree.nodes)) {
          if (val === resolvedNode) {
            resolvedKey = key;
            break;
          }
        }

        if (resolvedKey) {
          this.currentNode = resolvedKey;
          this.phase = resolvedNode.phase || this.phase + 1;
          this._updatePhaseIndicator();
          this._spawnNodePopups(resolvedKey);
        } else if (resolvedNode.popups) {
          // Directly spawned from gate resolution (ending gate)
          this.phase = resolvedNode.phase || 4;
          this._updatePhaseIndicator();

          const popupDefs = resolvedNode.popups.map(pid => ({
            id: pid,
            data: StoryTree.getPopup(pid)
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
  },

  _updatePhaseIndicator() {
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
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      clock.textContent = `${h}:${m} ${ampm}`;
    }
  }
};

// ===== LAUNCH ON DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  Game.start();
});
