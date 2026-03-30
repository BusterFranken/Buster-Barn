// =============================================================================
// endings.js — Five unique ending sequences
// =============================================================================

const EndingSystem = {
  overlay: null,

  init() {
    this.overlay = document.getElementById('ending-overlay');
  },

  play(endingId) {
    PopupManager.clearAll();

    const endings = {
      bsod: () => this._playBSOD(),
      virus: () => this._playVirus(),
      prince: () => this._playPrince(),
      fbi: () => this._playFBI(),
      hacker: () => this._playHacker()
    };

    const fn = endings[endingId];
    if (fn) {
      // Small delay before ending starts
      setTimeout(() => fn(), 500);
    }
  },

  // ===== ENDING 1: BLUE SCREEN OF DEATH =====
  _playBSOD() {
    // First: cascade error popups across the screen
    const desktop = document.getElementById('desktop');
    const errors = [
      'ERROR: Too many toolbars',
      'FATAL: Browser.exe has stopped',
      'WARNING: RAM full of toolbars',
      'CRITICAL: Toolbar-ception detected',
      'ERROR: Not enough toolbar',
      'FATAL: System32 replaced by toolbars',
      'ERROR: Your computer is now 98% toolbar',
      'CRITICAL: Help',
    ];

    let i = 0;
    const cascadeInterval = setInterval(() => {
      if (i >= errors.length) {
        clearInterval(cascadeInterval);
        // After cascade, show BSOD
        setTimeout(() => this._showBSODScreen(), 800);
        return;
      }
      const popup = document.createElement('div');
      popup.className = 'cascade-popup';
      popup.style.left = (30 + Math.random() * (window.innerWidth - 300)) + 'px';
      popup.style.top = (30 + Math.random() * (window.innerHeight - 200)) + 'px';
      popup.style.zIndex = 49990 + i;
      popup.innerHTML = `
        <div class="cascade-title">${errors[i]}</div>
        <div class="cascade-body">
          <p style="color:red;font-weight:bold">${errors[i]}</p>
          <p style="margin-top:8px">[OK]</p>
        </div>
      `;
      desktop.appendChild(popup);
      i++;
    }, 250);
  },

  _showBSODScreen() {
    this.overlay.className = '';
    this.overlay.classList.add('active');
    this.overlay.innerHTML = `
      <div class="ending-bsod" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <h1>Windows</h1>
        <p>A fatal exception 0E has occurred at 0028:C0034B03 in TOOLBAR.VXD</p>
        <p>&nbsp;</p>
        <p>Your computer has been destroyed by an excess of toolbars, spyware, and questionable life choices.</p>
        <p>&nbsp;</p>
        <p>The current number of toolbars installed (47) exceeds the maximum recommended amount (0).</p>
        <p>&nbsp;</p>
        <p>Your browser window was 2 pixels tall.</p>
        <p>&nbsp;</p>
        <p style="font-size:14px;">Press any key to restart your life.</p>
        <p style="font-size:14px;">Press CTRL+ALT+DEL to question your choices.</p>
        <p>&nbsp;</p>
        <p>Press any key to continue _</p>
        ${this._gameOverPanel('SYSTEM MELTDOWN', 'Your reckless clicking turned your computer into a toolbar sandwich. Was it worth it? (It was not.)')}
      </div>
    `;
    this._bindReplay();
  },

  // ===== ENDING 2: YOU ARE THE VIRUS =====
  _playVirus() {
    this.overlay.className = '';
    this.overlay.classList.add('active');

    // Matrix rain effect
    let matrixCols = '';
    for (let i = 0; i < 30; i++) {
      const left = (i / 30 * 100) + '%';
      const duration = (3 + Math.random() * 5) + 's';
      const delay = (Math.random() * 3) + 's';
      const chars = Array.from({length: 20}, () =>
        String.fromCharCode(0x30A0 + Math.random() * 96)
      ).join('\n');
      matrixCols += `<div class="matrix-col" style="left:${left};animation-duration:${duration};animation-delay:${delay}">${chars}</div>`;
    }

    this.overlay.innerHTML = `
      <div class="ending-virus" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;">
        <div class="matrix-rain">${matrixCols}</div>
        <div style="z-index:1;text-align:center;">
          <p style="font-size:16px;margin-bottom:20px;">&gt; SYSTEM LOG:</p>
          <p style="font-size:14px;margin-bottom:8px;" class="virus-line-1">&gt; User clicked too many suspicious links...</p>
          <p style="font-size:14px;margin-bottom:8px;" class="virus-line-2">&gt; Malware threshold exceeded...</p>
          <p style="font-size:14px;margin-bottom:8px;" class="virus-line-3">&gt; Human-computer merge initiated...</p>
          <p style="font-size:14px;margin-bottom:20px;" class="virus-line-4">&gt; MERGE COMPLETE.</p>
          <h1 style="font-size:36px;text-shadow:0 0 20px #00ff00;margin-bottom:20px;">YOU ARE THE VIRUS NOW</h1>
          <p style="font-size:16px;margin-bottom:8px;">You have transcended your physical form.</p>
          <p style="font-size:16px;margin-bottom:8px;">You are now spreading across the internet.</p>
          <p style="font-size:14px;margin-bottom:8px;">Right now, YOU are the pop-up on someone else's screen.</p>
          <p style="font-size:12px;color:#00aa00;margin-bottom:20px;">Somewhere, a person is clicking "CLOSE" on you.</p>
          <p style="font-size:12px;color:#00aa00;">They will fail.</p>
          ${this._gameOverPanel('DIGITAL EVOLUTION', 'Your curiosity and recklessness merged you with the malware. You are now an immortal digital entity. Congratulations... we think?')}
        </div>
      </div>
    `;
    this._bindReplay();
  },

  // ===== ENDING 3: NIGERIAN PRINCE PAYDAY =====
  _playPrince() {
    this.overlay.className = '';
    this.overlay.classList.add('active');
    this.overlay.innerHTML = `
      <div class="ending-prince" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:auto;">
        <h1 style="margin-bottom:16px;">YOU'RE A MILLIONAIRE!!!</h1>
        <p style="font-size:20px;margin-bottom:12px;">Against ALL odds...</p>
        <p style="font-size:20px;margin-bottom:12px;">Prince Abayomi was <b>REAL</b>.</p>
        <p style="font-size:20px;margin-bottom:20px;">The money was <b>REAL</b>.</p>
        <div style="background:#000;color:#00ff00;font-family:'VT323',monospace;padding:20px;border:4px solid #8b0000;margin:16px;font-size:24px;">
          BANK BALANCE: $14,100,000.00
        </div>
        <p style="font-size:18px;margin-bottom:8px;">You are now the proud owner of:</p>
        <ul style="font-size:16px;text-align:left;list-style:none;margin-bottom:16px;">
          <li>&#127965; A mansion in Beverly Hills</li>
          <li>&#128663; Three Lamborghinis</li>
          <li>&#127754; A private island</li>
          <li>&#128053; BonziBuddy (gold edition)</li>
        </ul>
        <div style="background:#ff00ff;color:white;padding:8px;font-size:12px;margin:8px;">
          <span style="display:inline-block;animation:marquee-scroll 6s linear infinite;">
            &#9733; CONGRATULATIONS &#9733; YOU MADE IT &#9733; PRINCE ABAYOMI SENDS HIS REGARDS &#9733; THIS GEOCITIES PAGE WAS MADE IN YOUR HONOR &#9733;
          </span>
        </div>
        <p style="font-size:12px;color:#666;margin:8px;">This page best viewed in Netscape Navigator 4.0</p>
        <div style="background:#000;color:#00ff00;font-family:'VT323',monospace;padding:4px 12px;font-size:14px;">
          Visitor #000,001 (it's just you)
        </div>
        ${this._gameOverPanel('PRINCE PAYDAY', 'Your unshakeable gullibility and boundless greed paid off. You are literally the only person in history to profit from a Nigerian Prince email. Buy a lottery ticket.')}
      </div>
    `;
    this._bindReplay();
  },

  // ===== ENDING 4: FBI RAID =====
  _playFBI() {
    this.overlay.className = '';
    this.overlay.classList.add('active');

    // Build browsing history
    const items = AvatarSystem.getItems();
    const history = items.map(i => i.name).concat([
      'Googled "is selling organs legal"',
      'Searched "how to hide money from IRS"',
      'Downloaded NotAVirus.exe',
      'Visited OrganBay.com',
      'Entered SSN into 7 different websites'
    ]);

    let historyHTML = history.map(h => `<li style="margin:4px 0;">&gt; ${h}</li>`).join('');

    this.overlay.innerHTML = `
      <div class="ending-fbi" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="border:4px solid red;padding:32px;max-width:600px;width:90%;">
          <h1 style="margin-bottom:16px;">THIS COMPUTER HAS BEEN SEIZED</h1>
          <p style="font-size:16px;margin-bottom:12px;">by the Federal Bureau of Investigation</p>
          <p style="font-size:14px;margin-bottom:8px;">in cooperation with:</p>
          <ul style="font-size:13px;text-align:left;list-style:none;margin-bottom:16px;color:#aaa;">
            <li>- The Department of Bad Internet Decisions</li>
            <li>- The International Council of People Who Click Things</li>
            <li>- Your Mom (she's very disappointed)</li>
          </ul>
          <p style="font-size:14px;color:#ff6666;margin-bottom:12px;">YOUR BROWSING HISTORY HAS BEEN REVIEWED:</p>
          <ul style="font-size:12px;text-align:left;list-style:none;color:#aaa;max-height:120px;overflow:auto;margin-bottom:16px;">
            ${historyHTML}
          </ul>
          <p style="font-size:13px;color:#ff6666;">An agent has been dispatched to your location.</p>
          <p style="font-size:11px;color:#666;margin-top:8px;">ETA: They're already behind you.</p>
        </div>
        ${this._gameOverPanel('FEDERAL INTERVENTION', 'Your greedy clicking habits attracted the attention of every law enforcement agency that exists (and some that don\'t). Your browsing history has been printed and is 47 pages long.')}
      </div>
    `;
    this._bindReplay();
  },

  // ===== ENDING 5: HACKER ASCENSION =====
  _playHacker() {
    this.overlay.className = '';
    this.overlay.classList.add('active');

    let matrixCols = '';
    for (let i = 0; i < 25; i++) {
      const left = (i / 25 * 100) + '%';
      const duration = (4 + Math.random() * 6) + 's';
      const delay = (Math.random() * 2) + 's';
      const chars = Array.from({length: 25}, () =>
        String.fromCharCode(0x30A0 + Math.random() * 96)
      ).join('\n');
      matrixCols += `<div class="matrix-col" style="left:${left};animation-duration:${duration};animation-delay:${delay}">${chars}</div>`;
    }

    this.overlay.innerHTML = `
      <div class="ending-hacker" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;text-align:center;">
        <div class="matrix-rain">${matrixCols}</div>
        <div style="z-index:1;">
          <p style="font-size:14px;margin-bottom:16px;">&gt; Wake up...</p>
          <p style="font-size:16px;margin-bottom:16px;">&gt; The pop-ups have shown you the truth...</p>
          <h1 style="font-size:40px;text-shadow:0 0 30px #00ff00;margin-bottom:24px;">YOU ARE THE HACKER</h1>
          <p style="font-size:16px;margin-bottom:8px;">&gt; Firewall mastery: ACHIEVED</p>
          <p style="font-size:16px;margin-bottom:8px;">&gt; Encryption knowledge: MAXIMUM</p>
          <p style="font-size:16px;margin-bottom:8px;">&gt; Paranoia level: PERFECTLY CALIBRATED</p>
          <p style="font-size:16px;margin-bottom:20px;">&gt; Pop-up immunity: ABSOLUTE</p>
          <p style="font-size:14px;margin-bottom:8px;">You don't just close pop-ups anymore.</p>
          <p style="font-size:14px;margin-bottom:8px;">You <em>control</em> them.</p>
          <p style="font-size:14px;margin-bottom:8px;">The internet bends to your will.</p>
          <p style="font-size:12px;color:#009900;margin-bottom:20px;">(Your hacker name is xX_P0PuP_SL4Y3R_Xx)</p>
          ${this._gameOverPanel('HACKER ASCENSION', 'Your healthy paranoia and insatiable curiosity led you to master the digital realm. You are now an elite hacker known only by your handle. The pop-ups fear YOU.')}
        </div>
      </div>
    `;
    this._bindReplay();
  },

  // ===== SHARED COMPONENTS =====

  _gameOverPanel(title, description) {
    const traits = TraitSystem.getTraits();
    const maxTrait = Math.max(...Object.values(traits), 1);
    const items = AvatarSystem.getItems();

    let traitBars = '';
    for (const [trait, value] of Object.entries(traits)) {
      const pct = Math.min((value / maxTrait) * 100, 100);
      traitBars += `
        <div class="trait-bar-container trait-${trait}">
          <span class="trait-label">${trait}</span>
          <div class="trait-bar"><div class="trait-bar-fill" style="width:${pct}%"></div></div>
          <span class="trait-value">${value}</span>
        </div>
      `;
    }

    let itemList = items.map(i => `<span title="${i.name}">${i.emoji}</span>`).join(' ');

    return `
      <div class="game-over-panel" style="margin-top:20px;">
        <h2>GAME OVER: ${title}</h2>
        <p style="font-size:12px;margin-bottom:16px;color:#666;">${description}</p>
        <h3 style="font-size:13px;margin-bottom:8px;color:#000080;">YOUR TRAIT SCORES</h3>
        ${traitBars}
        <div style="margin-top:12px;">
          <h3 style="font-size:13px;margin-bottom:4px;color:#000080;">ITEMS COLLECTED (${items.length})</h3>
          <div style="font-size:18px;line-height:2;">${itemList || 'None'}</div>
        </div>
        <button class="play-again-btn" id="play-again-btn">PLAY AGAIN</button>
      </div>
    `;
  },

  _bindReplay() {
    setTimeout(() => {
      const btn = document.getElementById('play-again-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          Game.restart();
        });
      }
    }, 100);
  }
};
