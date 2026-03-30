// =============================================================================
// story-tree.js — All popup content, story nodes, and branching logic
// =============================================================================

const StoryTree = {

  // =========================================================================
  // STORY NODES — define the flow of the game
  // =========================================================================
  nodes: {
    // --- PHASE 1: First time online ---
    'start': {
      phase: 1,
      popups: ['prize_winner', 'virus_alert', 'work_from_home'],
      simultaneous: true,
      next: 'phase2_gate'
    },

    // --- PHASE 2 GATE ---
    'phase2_gate': {
      type: 'gate',
      routes: [
        { highest: 'gullibility', next: 'phase2_gullible' },
        { highest: 'greed', next: 'phase2_greedy' },
        { highest: 'paranoia', next: 'phase2_paranoid' },
        { highest: 'recklessness', next: 'phase2_reckless' },
        { highest: 'curiosity', next: 'phase2_curious' }
      ],
      fallback: 'phase2_gullible'
    },

    // --- PHASE 2 PATHS ---
    'phase2_gullible': {
      phase: 2,
      popups: ['free_ipod', 'nigerian_prince', 'toolbar_install'],
      simultaneous: true,
      next: 'phase3_gate'
    },
    'phase2_greedy': {
      phase: 2,
      popups: ['double_money', 'free_casino', 'sell_organs'],
      simultaneous: true,
      next: 'phase3_gate'
    },
    'phase2_paranoid': {
      phase: 2,
      popups: ['antivirus_upgrade', 'webcam_hacker', 'fbi_notice'],
      simultaneous: true,
      next: 'phase3_gate'
    },
    'phase2_reckless': {
      phase: 2,
      popups: ['sketchy_download', 'limewire_pro', 'bonzi_buddy'],
      simultaneous: true,
      next: 'phase3_gate'
    },
    'phase2_curious': {
      phase: 2,
      popups: ['clickbait_supreme', 'secret_docs', 'celebrity_quiz'],
      simultaneous: true,
      next: 'phase3_gate'
    },

    // --- PHASE 3 GATE ---
    'phase3_gate': {
      type: 'gate',
      routes: [
        { combo: 'greed_gullibility', next: 'phase3_gullible_greedy' },
        { combo: 'gullibility_paranoia', next: 'phase3_gullible_paranoid' },
        { combo: 'greed_recklessness', next: 'phase3_greedy_reckless' },
        { combo: 'curiosity_paranoia', next: 'phase3_paranoid_curious' },
        { combo: 'curiosity_recklessness', next: 'phase3_reckless_curious' },
        { combo: 'gullibility_recklessness', next: 'phase3_gullible_reckless' },
        { combo: 'curiosity_greed', next: 'phase3_greedy_curious' },
        { combo: 'paranoia_recklessness', next: 'phase3_paranoid_reckless' },
        { combo: 'greed_paranoia', next: 'phase3_greedy_paranoid' },
        { combo: 'curiosity_gullibility', next: 'phase3_curious_gullible' }
      ],
      fallback: 'phase3_gullible_greedy'
    },

    // --- PHASE 3 PATHS ---
    'phase3_gullible_greedy': {
      phase: 3,
      popups: ['prince_wire_transfer', 'spanish_lottery'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_gullible_paranoid': {
      phase: 3,
      popups: ['fake_microsoft_update', 'password_stolen'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_greedy_reckless': {
      phase: 3,
      popups: ['pirate_movies', 'free_trial_cc'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_paranoid_curious': {
      phase: 3,
      popups: ['learn_hacking', 'vpn_ad'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_reckless_curious': {
      phase: 3,
      popups: ['dark_web_dare', 'chemistry_hack'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_gullible_reckless': {
      phase: 3,
      popups: ['dating_popup', 'miracle_pill'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_greedy_curious': {
      phase: 3,
      popups: ['crypto_mine', 'pyramid_scheme'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_paranoid_reckless': {
      phase: 3,
      popups: ['y2k_doomsday', 'bunker_builder'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_greedy_paranoid': {
      phase: 3,
      popups: ['tax_haven', 'gold_bars'],
      simultaneous: true,
      next: 'ending_gate'
    },
    'phase3_curious_gullible': {
      phase: 3,
      popups: ['alien_contact', 'time_travel'],
      simultaneous: true,
      next: 'ending_gate'
    },

    // --- ENDING GATE ---
    'ending_gate': {
      type: 'ending_gate'
    }
  },

  // =========================================================================
  // POPUP DEFINITIONS — all the popup content
  // =========================================================================
  popups: {

    // =====================================================================
    // PHASE 1 — Welcome to the Internet
    // =====================================================================

    prize_winner: {
      style: 'prize',
      title: 'CONGRATULATIONS!!!',
      icon: '&#127881;',
      body: `
        <div class="popup-stars">&#9733; &#9733; &#9733; YOU WIN &#9733; &#9733; &#9733;</div>
        <p>YOU are our <b>1,000,000th</b> visitor!!!</p>
        <p>You have been selected to receive a <b>BRAND NEW Dell Dimension XPS</b> with <b>64MB RAM</b> and a <b>56K modem</b>!!</p>
        <p class="popup-urgent">&#9888; Offer expires in <span class="countdown">0:47</span> seconds! &#9888;</p>
      `,
      buttons: [
        {
          text: 'CLAIM MY PRIZE!!',
          traits: { gullibility: 2, greed: 1 },
          item: { id: 'trophy', name: 'Golden Trophy', slot: 'right_hand', emoji: '&#127942;' }
        },
        {
          text: 'No Thanks (ARE YOU CRAZY?!)',
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    virus_alert: {
      style: 'warning',
      title: 'CRITICAL SYSTEM WARNING',
      icon: '&#9888;',
      body: `
        <div class="popup-scan-bar"><div class="scan-fill"></div></div>
        <p class="warning-red"><b>Norton AntiVirus 97</b> has detected:</p>
        <ul class="virus-list">
          <li>&#9888; 47 VIRUSES</li>
          <li>&#9888; 12 TROJANS</li>
          <li>&#9888; 3 WORMS</li>
          <li>&#9888; 1 SCARY THING</li>
        </ul>
        <p>Your files are in <b>EXTREME DANGER</b>!! Download <b>CleanSweep Pro</b> NOW!</p>
      `,
      buttons: [
        {
          text: 'PROTECT MY PC NOW!!',
          traits: { paranoia: 1, gullibility: 1 },
          item: { id: 'shield', name: 'Antivirus Shield', slot: 'body', emoji: '&#128737;' }
        },
        {
          text: "I'll Take My Chances",
          traits: { recklessness: 2 },
          item: null
        }
      ]
    },

    work_from_home: {
      style: 'money',
      title: 'MAKE $$$ FAST!!!',
      icon: '&#128176;',
      body: `
        <p>I made <b class="money-green">$5,847 LAST WEEK</b> just by clicking buttons on my computer!!</p>
        <p>My boss <b>HATES</b> me!! My neighbors are <b>JEALOUS</b>!!</p>
        <p>One weird trick that BANKS don't want you to know!</p>
        <p class="testimonial"><i>"I bought a boat!" - Mike, Ohio</i></p>
      `,
      buttons: [
        {
          text: 'TELL ME THE SECRET!!',
          traits: { greed: 2, curiosity: 1 },
          item: { id: 'money_bag', name: 'Money Bag', slot: 'right_hand', emoji: '&#128176;' }
        },
        {
          text: 'Sounds Too Good To Be True',
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    // =====================================================================
    // PHASE 2 — GULLIBLE PATH
    // =====================================================================

    free_ipod: {
      style: 'prize',
      title: 'YOUR FREE iPOD IS READY!!',
      icon: '&#127926;',
      body: `
        <p>As our <b>LUCKY WINNER</b>, your prize has been upgraded!</p>
        <p>Receive a <b>FREE iPod</b> (256MB!) loaded with FREE music!</p>
        <p>Just confirm your shipping address and mother's maiden name!</p>
        <p class="fine-print">*Processing fee of $4.99 may apply. By clicking you agree to 74 monthly subscriptions.</p>
      `,
      buttons: [
        {
          text: 'Ship It To Me!! FREE MUSIC!!',
          traits: { gullibility: 2, greed: 1 },
          item: { id: 'ipod', name: 'Totally Real iPod', slot: 'right_hand', emoji: '&#127911;' }
        },
        {
          text: 'This seems fishy...',
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    nigerian_prince: {
      style: 'email',
      title: 'URGENT: Confidential Business Proposal',
      icon: '&#128231;',
      body: `
        <p>Dear Respected Friend,</p>
        <p>I am <b>Prince Abayomi Okonkwo</b>, son of the late King of Lagos.</p>
        <p>I have <b class="money-green">$47,000,000</b> (FORTY SEVEN MILLION US DOLLARS) trapped in a Nigerian bank account.</p>
        <p>I need YOUR trusted assistance to transfer these funds. You will receive <b>30% ($14,100,000)</b> for your help.</p>
        <p>Please reply with your full name, address, and bank account number.</p>
        <p><i>God bless you,<br>Prince Abayomi</i></p>
      `,
      buttons: [
        {
          text: "I'll Help You, Prince!",
          traits: { gullibility: 2, greed: 2 },
          item: { id: 'crown', name: 'Royal Crown', slot: 'head', emoji: '&#128081;' }
        },
        {
          text: 'Delete This Email',
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    toolbar_install: {
      style: 'download',
      trickClose: true,
      title: 'SuperSearch Toolbar v3.7',
      icon: '&#128295;',
      body: `
        <p>Make your browser <b>500% FASTER</b> with SuperSearch Toolbar!</p>
        <p>Features include:</p>
        <ul>
          <li>&#10004; Animated cursor pack (50+ cursors!)</li>
          <li>&#10004; Weather in your browser!</li>
          <li>&#10004; FREE smiley emoticons!</li>
          <li>&#10004; Search the web with EASE!</li>
        </ul>
        <p class="fine-print">*Also installs BargainBuddy, CoolWebSearch, ShopAtHome, and 14 other helpful companions.</p>
      `,
      buttons: [
        {
          text: 'INSTALL (I love toolbars!!)',
          traits: { gullibility: 1, recklessness: 1 },
          item: { id: 'toolbar_stack', name: 'Toolbar Collection', slot: 'accessory', emoji: '&#128295;' }
        },
        {
          text: 'No More Toolbars Please',
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    // =====================================================================
    // PHASE 2 — GREEDY PATH
    // =====================================================================

    double_money: {
      style: 'money',
      title: 'DOUBLE YOUR MONEY!!!',
      icon: '&#128178;',
      body: `
        <p><b class="money-green">GUARANTEED INVESTMENT OPPORTUNITY!</b></p>
        <p>Send us <b>$100</b> and we will send you back <b>$200</b>!</p>
        <p>Send <b>$1,000</b> and receive <b>$2,000</b>!</p>
        <p>It's MATH, people! How can it NOT work?!</p>
        <p class="testimonial"><i>"I sent $50 and got $100 back! Then I sent $10,000 and... well I'm still waiting." - Anonymous</i></p>
      `,
      buttons: [
        {
          text: "TAKE MY MONEY (it's math!!)",
          traits: { greed: 2, gullibility: 1 },
          item: { id: 'gold_coins', name: 'Doubled Gold', slot: 'right_hand', emoji: '&#129689;' }
        },
        {
          text: "That's Not How Math Works",
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    free_casino: {
      style: 'prize',
      trickClose: true,
      title: 'MEGA CASINO ROYALE ONLINE!!!',
      icon: '&#127920;',
      body: `
        <div class="popup-stars">&#9733; JACKPOT ALERT &#9733;</div>
        <p>Play <b>FREE slots</b> and win <b>REAL MONEY</b>!</p>
        <p>No deposit needed! No credit card required!*</p>
        <p>Current jackpot: <b class="money-green">$847,291</b></p>
        <p class="fine-print">*Credit card required for verification purposes only. All deposits non-refundable.</p>
      `,
      buttons: [
        {
          text: 'SPIN TO WIN BABY!!',
          traits: { greed: 2, recklessness: 1 },
          item: { id: 'dice', name: 'Lucky Dice', slot: 'right_hand', emoji: '&#127922;' }
        },
        {
          text: "The House Always Wins",
          traits: { paranoia: 1, curiosity: 1 },
          item: null
        }
      ]
    },

    sell_organs: {
      style: 'weird',
      title: 'OrganBay.com - Premium Body Parts',
      icon: '&#129656;',
      body: `
        <p>Why sell on eBay when you can sell on <b>OrganBay</b>?!</p>
        <p>Current market prices:</p>
        <ul>
          <li>Kidney: <b class="money-green">$262,000</b> (you have TWO!)</li>
          <li>Liver (partial): <b class="money-green">$157,000</b></li>
          <li>Appendix: <b>$3.50</b></li>
        </ul>
        <p>You're literally <b>sitting on a GOLDMINE</b> of organs!</p>
      `,
      buttons: [
        {
          text: "I Don't Need BOTH Kidneys...",
          traits: { greed: 3, recklessness: 1 },
          item: { id: 'medical_bag', name: 'Medical Kit', slot: 'left_hand', emoji: '&#129658;' }
        },
        {
          text: "I'm Keeping All My Organs",
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    // =====================================================================
    // PHASE 2 — PARANOID PATH
    // =====================================================================

    antivirus_upgrade: {
      style: 'warning',
      trickClose: true,
      title: 'ALERT: 238 NEW THREATS FOUND!!',
      icon: '&#9888;',
      body: `
        <p class="warning-red"><b>CleanSweep Pro</b> has detected <b>238 ADDITIONAL THREATS!</b></p>
        <p>Your current protection is <b>INADEQUATE!</b></p>
        <p>Upgrade to <b>CleanSweep ULTRA MEGA PRO PLATINUM</b> for complete protection!</p>
        <p>Only <b>$79.99/month</b> (auto-renews forever)</p>
      `,
      buttons: [
        {
          text: 'UPGRADE!! PROTECT ME!!',
          traits: { paranoia: 2, gullibility: 1 },
          item: { id: 'double_shield', name: 'Ultra Shield', slot: 'body', emoji: '&#128737;' }
        },
        {
          text: "I think I'm fine actually",
          traits: { recklessness: 1 },
          item: null
        }
      ]
    },

    webcam_hacker: {
      style: 'hacker',
      title: 'WEBCAM BREACH DETECTED',
      icon: '&#128248;',
      body: `
        <p class="hacker-green">ALERT: UNAUTHORIZED ACCESS DETECTED</p>
        <p>A hacker at IP <b>192.168.0.666</b> is currently watching you through your webcam!</p>
        <p>They can see <b>EVERYTHING</b> you are doing RIGHT NOW!</p>
        <p>Cover your webcam IMMEDIATELY or purchase our <b>WebCam Guard Pro</b>!</p>
      `,
      buttons: [
        {
          text: '*covers webcam with tape*',
          traits: { paranoia: 3 },
          item: { id: 'tinfoil_hat', name: 'Tinfoil Hat', slot: 'head', emoji: '&#129529;' }
        },
        {
          text: "Jokes on them I'm ugly",
          traits: { recklessness: 1, curiosity: 1 },
          item: null
        }
      ]
    },

    fbi_notice: {
      style: 'fbi',
      title: 'FEDERAL BUREAU OF INVESTIGATION',
      icon: '&#128270;',
      body: `
        <p><b>OFFICIAL NOTICE</b></p>
        <p>Your IP address <b>(127.0.0.1)</b> has been <b>LOGGED</b> by the FBI Cyber Crime Division.</p>
        <p>Your recent internet activity has been flagged for review.</p>
        <p>Click below to <b>VERIFY YOUR IDENTITY</b> and clear your record.</p>
        <p class="fine-print">Failure to comply will result in FEDERAL PROSECUTION.</p>
      `,
      buttons: [
        {
          text: 'VERIFY IDENTITY (please dont arrest me)',
          traits: { paranoia: 1, gullibility: 2 },
          item: { id: 'fbi_badge', name: 'FBI Badge', slot: 'body', emoji: '&#128994;' }
        },
        {
          text: "The FBI Wouldn't Pop Up...",
          traits: { curiosity: 1, recklessness: 1 },
          item: null
        }
      ]
    },

    // =====================================================================
    // PHASE 2 — RECKLESS PATH
    // =====================================================================

    sketchy_download: {
      style: 'download',
      dodgy: true,
      title: 'File Download',
      icon: '&#128190;',
      body: `
        <p>Download ready:</p>
        <div class="file-info">
          <b>CoolGame_TOTALLY_NOT_A_VIRUS.exe</b><br>
          Size: 2.3 MB<br>
          Source: fr33-g4m3z.ru<br>
          Verified: <span class="warning-red">NO</span>
        </div>
        <p>This file may harm your computer. Do you want to run it anyway?</p>
      `,
      buttons: [
        {
          text: 'RUN IT (YOLO)',
          traits: { recklessness: 3, curiosity: 1 },
          item: { id: 'floppy_disk', name: 'Suspicious Floppy', slot: 'right_hand', emoji: '&#128190;' }
        },
        {
          text: 'Cancel (boring)',
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    limewire_pro: {
      style: 'download',
      trickClose: true,
      title: 'LimeWire PRO GOLD Edition',
      icon: '&#127925;',
      body: `
        <p>Upgrade to <b>LimeWire PRO GOLD</b> for:</p>
        <ul>
          <li>&#10004; UNLIMITED free music downloads!</li>
          <li>&#10004; 500% faster downloads!</li>
          <li>&#10004; Definitely no viruses in the MP3s!</li>
          <li>&#10004; linkin_park_numb.exe is TOTALLY a song!</li>
        </ul>
      `,
      buttons: [
        {
          text: 'INSTALL (I need my music!!)',
          traits: { recklessness: 2, greed: 1 },
          item: { id: 'headphones', name: 'LimeWire Headphones', slot: 'head', emoji: '&#127911;' }
        },
        {
          text: "I'll Just Use Napster",
          traits: { curiosity: 1 },
          item: null
        }
      ]
    },

    bonzi_buddy: {
      style: 'bonzi',
      trickClose: true,
      dodgy: true,
      title: 'BonziBuddy Wants To Help!',
      icon: '&#128053;',
      body: `
        <p style="text-align:center;font-size:24px">&#128053;</p>
        <p>"Hi there! I'm <b>Bonzi</b>!"</p>
        <p>"I can search the web, tell you jokes, and be your <b>BEST FRIEND</b> on the internet!"</p>
        <p>"I'm totally FREE and I definitely <b>DO NOT</b> collect your personal data or browsing history!"</p>
        <p>"Install me NOW and I'll never, ever leave! <b>EVER.</b>"</p>
      `,
      buttons: [
        {
          text: "Install My New Best Friend!",
          traits: { recklessness: 1, gullibility: 1, curiosity: 1 },
          item: { id: 'bonzi_buddy', name: 'BonziBuddy', slot: 'shoulder', emoji: '&#128053;' }
        },
        {
          text: 'No Thanks Scary Monkey',
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    // =====================================================================
    // PHASE 2 — CURIOUS PATH
    // =====================================================================

    clickbait_supreme: {
      style: 'clickbait',
      title: 'You Will NOT Believe This!!',
      icon: '&#128562;',
      body: `
        <p><b>SHOCKING:</b> Scientists discover that clicking this button makes you <b>200% smarter!</b></p>
        <p>Teachers HATE this! Doctors are BAFFLED!</p>
        <p>Your parents tried to hide THIS from you!</p>
        <p><b>What happens next will BLOW YOUR MIND!</b></p>
      `,
      buttons: [
        {
          text: 'MY MIND NEEDS BLOWING',
          traits: { curiosity: 3, recklessness: 1 },
          item: { id: 'magnifying_glass', name: 'Truth Seeker Lens', slot: 'right_hand', emoji: '&#128269;' }
        },
        {
          text: "It's Probably Clickbait",
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    secret_docs: {
      style: 'hacker',
      title: 'CLASSIFIED: LEAKED DOCUMENTS',
      icon: '&#128274;',
      body: `
        <p class="hacker-green">TOP SECRET // EYES ONLY</p>
        <p>Leaked government documents reveal:</p>
        <ul>
          <li>Area 51 contains <b>ACTUAL ALIENS</b></li>
          <li>The moon landing was filmed by <b>KUBRICK</b></li>
          <li>Birds are <b>GOVERNMENT DRONES</b></li>
          <li>The internet was invented to <b>READ YOUR THOUGHTS</b></li>
        </ul>
        <p>View documents before they are <b>TAKEN DOWN!</b></p>
      `,
      buttons: [
        {
          text: 'I KNEW IT!! Show Me Everything!',
          traits: { curiosity: 2, recklessness: 1 },
          item: { id: 'secret_folder', name: 'Top Secret Folder', slot: 'left_hand', emoji: '&#128194;' }
        },
        {
          text: "I Don't Want To Get Suicided",
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    celebrity_quiz: {
      style: 'quiz',
      trickClose: true,
      title: 'SUPER FUN QUIZ TIME!!!',
      icon: '&#11088;',
      body: `
        <p>&#127775; <b>Which 90s Celebrity Are You?!</b> &#127775;</p>
        <p>Take this 100% scientifically accurate quiz to find out!</p>
        <p>Are you a <b>Leonardo DiCaprio</b>? A <b>Britney Spears</b>? A <b>Will Smith</b>?</p>
        <p>Over <b>47 million</b> people have taken this quiz!!</p>
        <p class="fine-print">*Quiz requires access to your contacts, photos, and innermost thoughts.</p>
      `,
      buttons: [
        {
          text: "OMG TAKE THE QUIZ!!",
          traits: { curiosity: 2, gullibility: 1 },
          item: { id: 'star_badge', name: 'Celebrity Star', slot: 'body', emoji: '&#11088;' }
        },
        {
          text: "I Already Know I'm a JC Chasez",
          traits: { paranoia: 0, curiosity: 0 },
          item: null
        }
      ]
    },

    // =====================================================================
    // PHASE 3 — The Escalation
    // =====================================================================

    // --- GULLIBLE + GREEDY ---
    prince_wire_transfer: {
      style: 'email',
      trickClose: true,
      title: 'RE: RE: RE: URGENT - Prince Abayomi',
      icon: '&#128231;',
      body: `
        <p>Dear Trusted Friend,</p>
        <p>The bank requires a <b>processing fee</b> of <b class="money-green">$5,000</b> to release the $47 MILLION.</p>
        <p>I know this is a lot, but think of it as an INVESTMENT!</p>
        <p>$5,000 in &rarr; <b>$14,100,000 out</b>. That is a <b>282,000% return!</b></p>
        <p>Please wire money to: Account ending in 4-2-0-6-9</p>
        <p><i>Time is running out, my friend.<br>- Prince Abayomi</i></p>
      `,
      buttons: [
        {
          text: "WIRE THE MONEY (282,000% ROI!!)",
          traits: { gullibility: 3, greed: 3 },
          item: { id: 'wire_receipt', name: 'Wire Transfer Receipt', slot: 'accessory', emoji: '&#129534;' }
        },
        {
          text: "That's A Lot Of Money...",
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    spanish_lottery: {
      style: 'prize',
      trickClose: true,
      title: 'SPANISH NATIONAL LOTTERY WINNER!!',
      icon: '&#127881;',
      body: `
        <div class="popup-stars">&#9733; GANADOR &#9733; WINNER &#9733; GANADOR &#9733;</div>
        <p>Your email was randomly selected for the <b>SPANISH NATIONAL LOTTERY!</b></p>
        <p>You have won: <b class="money-green">&euro;2,500,000</b></p>
        <p>(You never entered? That's how LOTTERIES work!!)</p>
        <p>Send &euro;500 processing fee to claim your MILLIONS!</p>
      `,
      buttons: [
        {
          text: "I Won?! COLLECT MY MILLIONS!!",
          traits: { gullibility: 2, greed: 2 },
          item: { id: 'lottery_ticket', name: 'Lottery Ticket', slot: 'left_hand', emoji: '&#127915;' }
        },
        {
          text: "I Never Entered A Spanish Lottery",
          traits: { paranoia: 1, curiosity: 1 },
          item: null
        }
      ]
    },

    // --- GULLIBLE + PARANOID ---
    fake_microsoft_update: {
      style: 'download',
      trickClose: true,
      title: 'URGENT: Windows Security Update',
      icon: '&#128187;',
      body: `
        <p><b>Microsoft&trade; Windows&reg;</b> Critical Security Update</p>
        <p>Patch KB4208147 is <b>REQUIRED</b> for your safety.</p>
        <p>Without this update, your computer is vulnerable to:</p>
        <ul>
          <li>&#9888; Russian hackers</li>
          <li>&#9888; Chinese hackers</li>
          <li>&#9888; Your neighbor Kevin (he looks suspicious)</li>
        </ul>
        <p>Install now from: micr0s0ft-upd4tes.biz</p>
      `,
      buttons: [
        {
          text: "INSTALL UPDATE (Kevin IS suspicious)",
          traits: { gullibility: 2, paranoia: 1 },
          item: { id: 'windows_cd', name: 'Windows Update CD', slot: 'right_hand', emoji: '&#128191;' }
        },
        {
          text: "Microsoft Doesn't Email Updates",
          traits: { curiosity: 2 },
          item: null
        }
      ]
    },

    password_stolen: {
      style: 'warning',
      trickClose: true,
      title: 'PASSWORD BREACH ALERT!!',
      icon: '&#128274;',
      body: `
        <p class="warning-red"><b>YOUR PASSWORD HAS BEEN COMPROMISED!</b></p>
        <p>We detected that your password "<b>password123</b>" has been leaked!</p>
        <p>(How did we know your password? Don't worry about it!)</p>
        <p>Change your password NOW by entering your current password below:</p>
        <div class="fake-input">Enter current password: ********</div>
      `,
      buttons: [
        {
          text: "CHANGE PASSWORD (how do they know it?!)",
          traits: { gullibility: 2, paranoia: 2 },
          item: { id: 'padlock', name: 'Security Padlock', slot: 'body', emoji: '&#128274;' }
        },
        {
          text: "Nice Try, That's Not My Password",
          traits: { recklessness: 1 },
          item: null
        }
      ]
    },

    // --- GREEDY + RECKLESS ---
    pirate_movies: {
      style: 'download',
      trickClose: true,
      title: 'FREE MOVIES - ALL OF THEM!!',
      icon: '&#127916;',
      body: `
        <p>Download <b>EVERY Hollywood movie EVER MADE!</b></p>
        <p>New releases, classics, movies that haven't been made yet!</p>
        <p>All in one convenient <b>2.3 GB file</b> named:</p>
        <div class="file-info"><b>AllMoviesEver_definitelyNotMalware.zip.exe</b></div>
        <p class="fine-print">*RIAA has entered the chat*</p>
      `,
      buttons: [
        {
          text: "DOWNLOAD ALL MOVIES (even future ones!!)",
          traits: { greed: 2, recklessness: 2 },
          item: { id: 'pirate_flag', name: 'Pirate Flag', slot: 'right_hand', emoji: '&#127988;' }
        },
        {
          text: "I Prefer The Theater",
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    free_trial_cc: {
      style: 'money',
      trickClose: true,
      title: 'FREE 30-DAY TRIAL!!!',
      icon: '&#128179;',
      body: `
        <p>Get <b>SuperStream Premium Gold Plus</b> absolutely FREE for 30 days!</p>
        <p>Just enter your credit card for "verification"!</p>
        <p>Cancel anytime!*</p>
        <p class="fine-print">*Cancel by sending a notarized letter via carrier pigeon to our office in the Bermuda Triangle.
        After 30 days, $499.99/month charged to your card, your children's cards, and cards you haven't applied for yet.</p>
      `,
      buttons: [
        {
          text: "FREE IS FREE!! *enters credit card*",
          traits: { greed: 1, gullibility: 2 },
          item: { id: 'credit_card', name: 'Maxed Out Card', slot: 'right_hand', emoji: '&#128179;' }
        },
        {
          text: "I Read The Fine Print For Once",
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    // --- PARANOID + CURIOUS ---
    learn_hacking: {
      style: 'hacker',
      title: 'LEARN TO HACK - Free Course',
      icon: '&#128187;',
      body: `
        <p class="hacker-green">&gt; Welcome to HackerAcademy.net</p>
        <p>"The best defense is a good offense!"</p>
        <p>Learn to:</p>
        <ul>
          <li>&gt; Hack your neighbor's WiFi</li>
          <li>&gt; Read your ex's emails</li>
          <li>&gt; Change your grades (for educational purposes)</li>
          <li>&gt; Become an ELITE CYBER WARRIOR</li>
        </ul>
        <p>First lesson: <b>FREE!</b> (we already have your IP anyway)</p>
      `,
      buttons: [
        {
          text: "ENROLL (for defensive purposes only)",
          traits: { curiosity: 2, paranoia: 1 },
          item: { id: 'hacker_hoodie', name: 'Hacker Hoodie', slot: 'body', emoji: '&#129490;' }
        },
        {
          text: "This Is Definitely A Honeypot",
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    vpn_ad: {
      style: 'warning',
      title: 'THE GOVERNMENT IS WATCHING YOU',
      icon: '&#128065;',
      body: `
        <p class="warning-red"><b>RIGHT NOW, the following entities can see EVERYTHING you do:</b></p>
        <ul>
          <li>&#128065; Your ISP</li>
          <li>&#128065; The NSA</li>
          <li>&#128065; Mark Zuckerberg (personally)</li>
          <li>&#128065; Your mom</li>
        </ul>
        <p>Install <b>TotallyAnonymousVPN</b> and become <b>INVISIBLE!</b></p>
        <p class="fine-print">*VPN logs stored on a server in a country that technically doesn't exist.</p>
      `,
      buttons: [
        {
          text: "INSTALL VPN (not my mom!!)",
          traits: { paranoia: 2, curiosity: 1 },
          item: { id: 'vpn_key', name: 'VPN Key', slot: 'left_hand', emoji: '&#128273;' }
        },
        {
          text: "VPNs Are Also Tracked",
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    // --- RECKLESS + CURIOUS ---
    dark_web_dare: {
      style: 'hacker',
      trickClose: true,
      title: 'DARE: ENTER THE DARK WEB',
      icon: '&#128128;',
      body: `
        <p class="hacker-green">&gt; ACCESSING RESTRICTED ZONE...</p>
        <p>Only <b>0.01%</b> of internet users have been to the <b>DARK WEB!</b></p>
        <p>Are you brave enough?</p>
        <p>WARNING: You may find:</p>
        <ul>
          <li>&#128128; Government secrets</li>
          <li>&#128128; Alien technology</li>
          <li>&#128128; The original recipe for New Coke</li>
          <li>&#128128; Websites that work in Internet Explorer</li>
        </ul>
      `,
      buttons: [
        {
          text: "I'M BRAVE!! TAKE ME THERE!!",
          traits: { recklessness: 3, curiosity: 2 },
          item: { id: 'dark_glasses', name: 'Dark Web Shades', slot: 'face', emoji: '&#128374;' }
        },
        {
          text: "That's Too Far Even For Me",
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    chemistry_hack: {
      style: 'weird',
      title: 'UNLIMITED ENERGY From Household Items!',
      icon: '&#9889;',
      body: `
        <p>Scientists DON'T want you to know this!</p>
        <p>Generate <b>UNLIMITED FREE ELECTRICITY</b> with items under your kitchen sink!</p>
        <p>Step 1: Gather bleach, ammonia, and a 9V battery</p>
        <p>Step 2: Mix them in your bath-- <b>WAIT NO DON'T DO THAT</b></p>
        <p>Step 3: Actually just click the button for the REAL tutorial</p>
      `,
      buttons: [
        {
          text: "SHOW ME THE REAL TUTORIAL",
          traits: { curiosity: 2, recklessness: 2 },
          item: { id: 'beaker', name: 'Science Beaker', slot: 'right_hand', emoji: '&#129514;' }
        },
        {
          text: "I Passed Chemistry, Nice Try",
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    // --- GULLIBLE + RECKLESS ---
    dating_popup: {
      style: 'dating',
      trickClose: true,
      dodgy: true,
      title: 'HOT SINGLES IN YOUR AREA!!!',
      icon: '&#128149;',
      body: `
        <p>&#128293; <b>47 HOT SINGLES</b> are waiting for you <b>RIGHT NOW!</b> &#128293;</p>
        <p>They are all within <b>0.3 miles</b> of your location!</p>
        <p>(Yes, there are 47 attractive single people in your living room. Don't look behind you.)</p>
        <p>Create your FREE profile now!</p>
        <p class="fine-print">*"Free" means $49.99/month. "Hot" is subjective. "Singles" may include married people, bots, and one very persistent raccoon.</p>
      `,
      buttons: [
        {
          text: "CREATE PROFILE (here's all my info!!)",
          traits: { gullibility: 2, recklessness: 1 },
          item: { id: 'heart_glasses', name: 'Love Glasses', slot: 'face', emoji: '&#128149;' }
        },
        {
          text: "47 People In My Living Room?!",
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    miracle_pill: {
      style: 'prize',
      trickClose: true,
      dodgy: true,
      title: 'DOCTORS HATE THIS ONE TRICK!!',
      icon: '&#128138;',
      body: `
        <p>Introducing <b>V1T4L-MAX ULTRA</b>!</p>
        <p>This ONE PILL will:</p>
        <ul>
          <li>&#10004; Make you 300% more confident!</li>
          <li>&#10004; Grow your... self-esteem!</li>
          <li>&#10004; Enlarge your... vocabulary!</li>
          <li>&#10004; Extend your... lifespan!</li>
        </ul>
        <p>Order NOW and get a <b>SECOND BOTTLE FREE!</b></p>
        <p class="fine-print">*FDA has not reviewed this. FDA does not return our calls. FDA has blocked our number.</p>
      `,
      buttons: [
        {
          text: "MY VOCABULARY NEEDS ENLARGING!!",
          traits: { gullibility: 2, recklessness: 1 },
          item: { id: 'cape', name: 'Confidence Cape', slot: 'body', emoji: '&#129464;' }
        },
        {
          text: "I Can See Through The Euphemisms",
          traits: { curiosity: 1 },
          item: null
        }
      ]
    },

    // --- GREEDY + CURIOUS ---
    crypto_mine: {
      style: 'money',
      trickClose: true,
      title: 'MINE BITCOIN FROM YOUR BROWSER!!',
      icon: '&#9939;',
      body: `
        <p>Why buy Bitcoin when you can <b>MINE IT FOR FREE?!</b></p>
        <p>Our patented <b>BrowserMiner 3000</b> uses your computer to generate:</p>
        <p class="money-green" style="font-size:20px;text-align:center"><b>$500/day in BITCOIN!</b></p>
        <p>Your computer might run a little hot. And slow. And the fans might sound like a jet engine. That means it's WORKING!</p>
      `,
      buttons: [
        {
          text: "MINE BITCOIN!! (my CPU can handle it)",
          traits: { greed: 2, curiosity: 1 },
          item: { id: 'gold_coins', name: 'Crypto Coins', slot: 'right_hand', emoji: '&#129689;' }
        },
        {
          text: "My Computer Already Sounds Like A Jet",
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    pyramid_scheme: {
      style: 'money',
      trickClose: true,
      title: 'BE YOUR OWN BOSS!!!',
      icon: '&#128176;',
      body: `
        <p>Join <b>TriForce Marketing</b> and be your own BOSS!</p>
        <p>It's NOT a pyramid scheme! It's a <b>reverse funnel system!</b></p>
        <p>Just recruit 5 friends, who each recruit 5 friends, who each recruit 5 friends...</p>
        <p>Before you know it, you'll need MORE FRIENDS than exist on EARTH!</p>
        <p>That's how you know it's <b>WORKING!</b></p>
      `,
      buttons: [
        {
          text: "I HAVE 5 FRIENDS!! (I think)",
          traits: { greed: 2, gullibility: 1 },
          item: { id: 'star_badge', name: 'Boss Badge', slot: 'body', emoji: '&#11088;' }
        },
        {
          text: "That's Literally A Triangle",
          traits: { paranoia: 1, curiosity: 1 },
          item: null
        }
      ]
    },

    // --- PARANOID + RECKLESS ---
    y2k_doomsday: {
      style: 'warning',
      title: 'Y2K BUG WILL DESTROY EVERYTHING!!',
      icon: '&#9888;',
      body: `
        <p class="warning-red"><b>THE YEAR 2000 PROBLEM IS REAL!!</b></p>
        <p>When the clock strikes midnight on Jan 1, 2000:</p>
        <ul>
          <li>&#9888; All computers will EXPLODE</li>
          <li>&#9888; ATMs will ATTACK people</li>
          <li>&#9888; Microwaves will become SENTIENT</li>
          <li>&#9888; Furbies will rise up</li>
        </ul>
        <p>Download our <b>Y2K Protection Suite</b> NOW!</p>
      `,
      buttons: [
        {
          text: "PROTECT ME FROM THE FURBIES!!",
          traits: { paranoia: 2, recklessness: 1 },
          item: { id: 'hard_hat', name: 'Y2K Helmet', slot: 'head', emoji: '&#129521;' }
        },
        {
          text: "It's 1997, I Have 3 Years To Worry",
          traits: { recklessness: 1 },
          item: null
        }
      ]
    },

    bunker_builder: {
      style: 'weird',
      title: 'BUILD A BUNKER IN YOUR BASEMENT!',
      icon: '&#127960;',
      body: `
        <p>When the INTERNET APOCALYPSE comes, will YOU be ready?</p>
        <p>Our <b>DIY Bunker Kit</b> includes:</p>
        <ul>
          <li>&#10004; 500 cans of beans</li>
          <li>&#10004; A shovel</li>
          <li>&#10004; Dial-up modem (backup)</li>
          <li>&#10004; Printed copy of the entire internet (47 pages)</li>
        </ul>
        <p>Only <b>$9,999!</b> ORDER NOW!</p>
      `,
      buttons: [
        {
          text: "THE INTERNET IS ONLY 47 PAGES?! BUY IT",
          traits: { paranoia: 1, recklessness: 2 },
          item: { id: 'toolbar_stack', name: 'Bunker Supplies', slot: 'accessory', emoji: '&#127960;' }
        },
        {
          text: "I'll Just Print The Internet Myself",
          traits: { curiosity: 1 },
          item: null
        }
      ]
    },

    // --- GREEDY + PARANOID ---
    tax_haven: {
      style: 'money',
      title: 'LEGAL Tax Loophole!!',
      icon: '&#128176;',
      body: `
        <p>The IRS doesn't want you to know about this <b>ONE LEGAL TRICK!</b></p>
        <p>Move your money to the <b>Principality of Sealand</b> and NEVER PAY TAXES AGAIN!</p>
        <p>Sealand is a real country!* (*It's an abandoned oil platform)</p>
        <p>Join <b>47,000 smart Americans</b> who have already done this!</p>
      `,
      buttons: [
        {
          text: "MOVE MY MONEY TO THE OIL PLATFORM!!",
          traits: { greed: 2, paranoia: 1 },
          item: { id: 'money_bag', name: 'Offshore Funds', slot: 'right_hand', emoji: '&#128176;' }
        },
        {
          text: "The IRS Can Hear You",
          traits: { paranoia: 2 },
          item: null
        }
      ]
    },

    gold_bars: {
      style: 'money',
      title: 'BUY GOLD BEFORE THE CRASH!!!',
      icon: '&#129689;',
      body: `
        <p class="money-green"><b>THE STOCK MARKET IS ABOUT TO CRASH!!</b></p>
        <p>(We've been saying this every day since 1987)</p>
        <p>Convert ALL your savings to <b>GOLD BARS</b> and bury them in your yard!</p>
        <p>Our special internet gold is only <b>$4,999/bar!</b></p>
        <p class="fine-print">*Gold bars are made of spray-painted chocolate. But hey, chocolate is also valuable!</p>
      `,
      buttons: [
        {
          text: "I LOVE CHOCOLATE-- I MEAN GOLD!!",
          traits: { greed: 2, gullibility: 1 },
          item: { id: 'gold_coins', name: 'Gold Bars', slot: 'right_hand', emoji: '&#129689;' }
        },
        {
          text: "Spray-Painted Chocolate? Really?",
          traits: { curiosity: 1 },
          item: null
        }
      ]
    },

    // --- CURIOUS + GULLIBLE ---
    alien_contact: {
      style: 'hacker',
      trickClose: true,
      title: 'NASA HIDING ALIEN CONTACT!!',
      icon: '&#128125;',
      body: `
        <p class="hacker-green">&gt; INTERCEPTED TRANSMISSION:</p>
        <p>NASA made contact with aliens in <b>1994</b> but COVERED IT UP!</p>
        <p>The aliens said: <b>"We have been trying to reach you about your car's extended warranty."</b></p>
        <p>DOWNLOAD the full declassified files!</p>
        <p>File: <b>alien_truth_REAL.pdf.exe.mp3.zip</b></p>
      `,
      buttons: [
        {
          text: "DOWNLOAD THE TRUTH!!",
          traits: { curiosity: 2, gullibility: 2 },
          item: { id: 'magnifying_glass', name: 'Alien Detector', slot: 'right_hand', emoji: '&#128269;' }
        },
        {
          text: "That File Extension Is Suspicious",
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    time_travel: {
      style: 'weird',
      trickClose: true,
      title: 'TIME TRAVEL IS REAL!!!',
      icon: '&#9200;',
      body: `
        <p>A scientist named <b>Dr. ChronoBlast</b> has confirmed:</p>
        <p><b>TIME TRAVEL IS REAL</b> and you can do it FROM YOUR BROWSER!</p>
        <p>Just enter your desired year and click "TRAVEL"!</p>
        <div class="fake-input">Destination Year: 2025</div>
        <p>Side effects may include: paradoxes, meeting yourself, accidentally preventing your own birth, mild nausea.</p>
      `,
      buttons: [
        {
          text: "TAKE ME TO THE FUTURE!!",
          traits: { curiosity: 3, gullibility: 1 },
          item: { id: 'beaker', name: 'Time Crystal', slot: 'right_hand', emoji: '&#129514;' }
        },
        {
          text: "Dr. ChronoBlast Isn't A Real Name",
          traits: { paranoia: 1 },
          item: null
        }
      ]
    },

    // =====================================================================
    // PHASE 4 — Final Popups (one per ending path)
    // =====================================================================

    final_bsod: {
      style: 'download',
      title: 'ULTIMATE BROWSER EXPERIENCE',
      icon: '&#128295;',
      body: `
        <p>You currently have <b>46 toolbars</b> installed.</p>
        <p>Install <b>ONE MORE</b> for the <b>ULTIMATE BROWSING EXPERIENCE!</b></p>
        <p>Your browser is now 99% toolbar and 1% website.</p>
        <p>This is <b>PEAK PERFORMANCE.</b></p>
      `,
      buttons: [
        {
          text: "INSTALL #47 (ULTIMATE POWER!!)",
          traits: { recklessness: 5 },
          item: { id: 'toolbar_stack', name: '47th Toolbar', slot: 'accessory', emoji: '&#128295;' },
          ending: 'bsod'
        },
        {
          text: "Maybe Just 46 Is Enough",
          traits: { recklessness: 3 },
          item: null,
          ending: 'bsod'
        }
      ]
    },

    final_virus: {
      style: 'hacker',
      title: 'SYSTEM ANOMALY DETECTED',
      icon: '&#128128;',
      body: `
        <p class="hacker-green">&gt; ALERT: Unusual system behavior detected...</p>
        <p>Your computer is acting... <b>strange</b>.</p>
        <p>Files are moving on their own. The cursor blinks with purpose.</p>
        <p>It's almost like your computer is... <b>alive?</b></p>
        <p>Do you investigate, or do you feed it more downloads?</p>
      `,
      buttons: [
        {
          text: "Investigate The Anomaly",
          traits: { curiosity: 5 },
          item: null,
          ending: 'virus'
        },
        {
          text: "Feed It MORE Downloads",
          traits: { recklessness: 5 },
          item: null,
          ending: 'virus'
        }
      ]
    },

    final_prince: {
      style: 'email',
      title: 'RE: RE: RE: RE: TRANSFER COMPLETE!!!',
      icon: '&#128231;',
      body: `
        <p>Dear Beloved Friend,</p>
        <p>I cannot believe I am writing this...</p>
        <p>The transfer is <b>COMPLETE</b>.</p>
        <p>Check your bank account. <b>NOW.</b></p>
        <p><b class="money-green">$14,100,000.00</b> has been deposited.</p>
        <p><i>With eternal gratitude,<br>Prince Abayomi (who was real the whole time)</i></p>
      `,
      buttons: [
        {
          text: "CHECK MY BANK ACCOUNT!!",
          traits: { gullibility: 5, greed: 5 },
          item: null,
          ending: 'prince'
        },
        {
          text: "This Can't Be Real... Can It?",
          traits: { paranoia: 1 },
          item: null,
          ending: 'prince'
        }
      ]
    },

    final_fbi: {
      style: 'fbi',
      title: '...',
      icon: '&#128680;',
      body: `
        <p style="text-align:center; font-size: 18px;"><b>KNOCK KNOCK KNOCK</b></p>
        <p style="text-align:center; font-size: 22px;"><b>KNOCK KNOCK KNOCK</b></p>
        <p style="text-align:center; font-size: 28px; color: red;"><b>KNOCK KNOCK KNOCK</b></p>
        <p style="text-align:center;">"FBI, OPEN UP!!"</p>
        <p style="text-align:center;font-size:12px;">Your browsing history has been... reviewed.</p>
      `,
      buttons: [
        {
          text: "*opens door slowly*",
          traits: {},
          item: null,
          ending: 'fbi'
        },
        {
          text: "*hides under desk*",
          traits: {},
          item: null,
          ending: 'fbi'
        }
      ]
    },

    final_hacker: {
      style: 'hacker',
      title: 'THE MATRIX AWAITS',
      icon: '&#128187;',
      body: `
        <p class="hacker-green">&gt; Connection established...</p>
        <p class="hacker-green">&gt; Firewall: MASTERED</p>
        <p class="hacker-green">&gt; Encryption: BROKEN</p>
        <p class="hacker-green">&gt; Skills: MAXIMUM</p>
        <p class="hacker-green">&gt; You have become... the HACKER.</p>
        <p class="hacker-green">&gt; The question is: do you take the red pill, or the blue pill?</p>
      `,
      buttons: [
        {
          text: "Take The Red Pill",
          traits: {},
          item: null,
          ending: 'hacker'
        },
        {
          text: "Take The Blue Pill",
          traits: {},
          item: null,
          ending: 'hacker'
        }
      ]
    }
  },

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  getNode(nodeId) {
    return this.nodes[nodeId] || null;
  },

  getPopup(popupId) {
    return this.popups[popupId] || null;
  },

  resolveGate(nodeId) {
    const node = this.nodes[nodeId];
    if (!node) return null;

    if (node.type === 'ending_gate') {
      const ending = TraitSystem.getDominantEnding();
      const finalPopupMap = {
        bsod: 'final_bsod',
        virus: 'final_virus',
        prince: 'final_prince',
        fbi: 'final_fbi',
        hacker: 'final_hacker'
      };
      return { popups: [finalPopupMap[ending]], simultaneous: false, next: null, phase: 4 };
    }

    if (node.type === 'gate') {
      // Check combo routes first (phase 3)
      if (node.routes[0] && node.routes[0].combo) {
        const comboKey = TraitSystem.getTraitComboKey();
        for (const route of node.routes) {
          if (route.combo === comboKey) {
            return this.nodes[route.next];
          }
        }
      }
      // Check highest trait routes (phase 2)
      else {
        const highest = TraitSystem.getHighest();
        for (const route of node.routes) {
          if (route.highest === highest) {
            return this.nodes[route.next];
          }
        }
      }
      // Fallback
      return this.nodes[node.fallback] || null;
    }

    return node;
  }
};
