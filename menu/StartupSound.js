// =============================================================================
// StartupSound.js — Win95-style boot chiptune jingle using Web Audio API
// =============================================================================

const StartupSound = (() => {

  var played = false;

  /**
   * Play a short chiptune boot jingle (inspired by the Windows 95 startup).
   * Only plays once per page load, triggered by user interaction.
   */
  function play() {
    if (played) return;
    played = true;

    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var masterGain = ctx.createGain();
      masterGain.gain.value = 0.15;
      masterGain.connect(ctx.destination);

      // Notes: a short ascending arpeggio
      // C4 -> E4 -> G4 -> C5 -> E5 (major chord climb)
      var notes = [
        { freq: 262, start: 0.0,  dur: 0.15 },  // C4
        { freq: 330, start: 0.12, dur: 0.15 },  // E4
        { freq: 392, start: 0.24, dur: 0.15 },  // G4
        { freq: 523, start: 0.36, dur: 0.20 },  // C5
        { freq: 659, start: 0.50, dur: 0.35 },  // E5 (held longer)
      ];

      var now = ctx.currentTime;

      notes.forEach(function(n) {
        // Square wave for that chiptune feel
        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = n.freq;

        var noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, now + n.start);
        noteGain.gain.linearRampToValueAtTime(0.3, now + n.start + 0.02);
        noteGain.gain.setValueAtTime(0.3, now + n.start + n.dur * 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + n.start);
        osc.stop(now + n.start + n.dur + 0.05);
      });

      // Bonus: a soft pad chord underneath (triangle waves)
      var padNotes = [262, 330, 392]; // C major
      padNotes.forEach(function(freq) {
        var osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        var padGain = ctx.createGain();
        padGain.gain.setValueAtTime(0, now);
        padGain.gain.linearRampToValueAtTime(0.08, now + 0.3);
        padGain.gain.setValueAtTime(0.08, now + 0.6);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(padGain);
        padGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.3);
      });

      // Clean up context after sound finishes
      setTimeout(function() { ctx.close(); }, 2000);

    } catch (e) {
      // Web Audio not available, fail silently
    }
  }

  /**
   * Set up to play on first user click anywhere on the page.
   */
  function init() {
    var handler = function() {
      play();
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
  }

  return { init: init, play: play };

})();
