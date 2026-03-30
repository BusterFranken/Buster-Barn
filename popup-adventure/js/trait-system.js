// =============================================================================
// trait-system.js — Hidden trait tracking for the pop-up adventure
// Traits: gullibility, curiosity, greed, paranoia, recklessness
// =============================================================================

const TraitSystem = {
  traits: {
    gullibility: 0,
    curiosity: 0,
    greed: 0,
    paranoia: 0,
    recklessness: 0
  },

  // Track popup interaction order within a phase
  _phaseClickOrder: [],

  reset() {
    this.traits = { gullibility: 0, curiosity: 0, greed: 0, paranoia: 0, recklessness: 0 };
    this._phaseClickOrder = [];
  },

  resetPhaseOrder() {
    this._phaseClickOrder = [];
  },

  recordClick(popupId) {
    if (!this._phaseClickOrder.includes(popupId)) {
      this._phaseClickOrder.push(popupId);
    }
  },

  isFirstClick(popupId) {
    return this._phaseClickOrder[0] === popupId;
  },

  getClickPosition(popupId) {
    return this._phaseClickOrder.indexOf(popupId);
  },

  addTraits(traitObj, isFirstClick) {
    for (const [trait, value] of Object.entries(traitObj)) {
      if (this.traits.hasOwnProperty(trait)) {
        // First popup clicked in a phase gets +1 bonus to its primary trait
        const bonus = isFirstClick ? 1 : 0;
        this.traits[trait] += value + bonus;
      }
    }
  },

  getTraits() {
    return { ...this.traits };
  },

  getHighest() {
    let max = -1;
    let highest = 'gullibility';
    for (const [trait, value] of Object.entries(this.traits)) {
      if (value > max) {
        max = value;
        highest = trait;
      }
    }
    return highest;
  },

  getTop2() {
    const sorted = Object.entries(this.traits)
      .sort((a, b) => b[1] - a[1]);
    return [sorted[0][0], sorted[1][0]];
  },

  getTraitComboKey() {
    const [first, second] = this.getTop2();
    // Normalize order for consistent gate matching
    const pair = [first, second].sort();
    return pair[0] + '_' + pair[1];
  },

  getDominantEnding() {
    const combo = this.getTraitComboKey();
    const highest = this.getHighest();
    const t = this.traits;

    // Ending 1: BSOD — reckless and not careful
    if (highest === 'recklessness' && t.paranoia <= 2) return 'bsod';
    // Ending 2: You ARE the Virus — curious + reckless
    if (combo === 'curiosity_recklessness') return 'virus';
    if (highest === 'curiosity' && t.recklessness >= 4) return 'virus';
    // Ending 3: Nigerian Prince Payday — gullible + greedy
    if (combo === 'greed_gullibility') return 'prince';
    if (highest === 'gullibility' && t.greed >= 3) return 'prince';
    // Ending 4: FBI Raid — greedy + not paranoid
    if (highest === 'greed' && t.paranoia <= 2) return 'fbi';
    if (combo === 'curiosity_greed') return 'fbi';
    // Ending 5: Hacker Ascension — paranoid + curious
    if (combo === 'curiosity_paranoia') return 'hacker';
    if (highest === 'paranoia' && t.curiosity >= 3) return 'hacker';

    // Fallback based on single highest
    const fallbacks = {
      gullibility: 'prince',
      greed: 'fbi',
      paranoia: 'hacker',
      recklessness: 'bsod',
      curiosity: 'virus'
    };
    return fallbacks[highest] || 'bsod';
  }
};
