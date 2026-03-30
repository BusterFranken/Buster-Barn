/**
 * DatabaseBridge - Persistence adapter for MOO-QUEST
 * Currently backed by localStorage. All methods return Promises
 * so the interface can be swapped to API calls later.
 */
class DatabaseBridge {
  /**
   * Save the full game state to localStorage.
   * Strips non-serializable properties (functions) before saving.
   */
  static async saveProgress(gameState) {
    const data = JSON.parse(JSON.stringify(gameState));
    delete data.reset; // don't serialize functions
    localStorage.setItem('mooquest_save', JSON.stringify(data));
    return true;
  }

  /**
   * Load previously saved game state, or null if none exists.
   */
  static async loadProgress() {
    const data = localStorage.getItem('mooquest_save');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Save a high score for a specific world.
   * Only overwrites if the new score is higher than the stored one.
   */
  static async saveHighScore(worldId, score) {
    const scores = JSON.parse(localStorage.getItem('mooquest_scores') || '{}');
    if (!scores[worldId] || score > scores[worldId]) {
      scores[worldId] = score;
      localStorage.setItem('mooquest_scores', JSON.stringify(scores));
    }
    return true;
  }

  /**
   * Load all stored high scores as a { worldId: score } map.
   */
  static async loadHighScores() {
    return JSON.parse(localStorage.getItem('mooquest_scores') || '{}');
  }

  /**
   * Save inventory separately so it persists across individual game sessions.
   */
  static async saveInventory(inventory) {
    localStorage.setItem('mooquest_inventory', JSON.stringify(inventory));
    return true;
  }

  /**
   * Load saved inventory, or null if none exists.
   */
  static async loadInventory() {
    const data = localStorage.getItem('mooquest_inventory');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Save player profile (name, moo-coins, playtime, games played).
   */
  static async saveProfile(profile) {
    localStorage.setItem('mooquest_profile', JSON.stringify(profile));
    return true;
  }

  /**
   * Load saved profile, or null if none exists.
   */
  static async loadProfile() {
    const data = localStorage.getItem('mooquest_profile');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Export full save as a downloadable .moo file.
   */
  static async exportSave(gameState) {
    const data = JSON.parse(JSON.stringify(gameState));
    delete data.reset;
    delete data.resetInventory;
    delete data.resetProfile;
    delete data.resetAll;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mooquest_save_' + Date.now() + '.moo';
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  /**
   * Import a .moo save file. Returns the parsed state or throws.
   */
  static async importSave(file) {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const state = JSON.parse(e.target.result);
          if (state.player && state.worlds) {
            resolve(state);
          } else {
            reject(new Error('Invalid save file format'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = function() { reject(new Error('Failed to read file')); };
      reader.readAsText(file);
    });
  }

  // =========================================================================
  // Leaderboard
  // =========================================================================

  /**
   * Add a score entry to the leaderboard.
   * @param {{ name: string, score: number, world: string, rank: string }} entry
   */
  static async addLeaderboardEntry(entry) {
    const entries = JSON.parse(localStorage.getItem('mooquest_leaderboard') || '[]');
    entries.push({
      name: entry.name,
      score: entry.score,
      world: entry.world || 'tutorial',
      rank: entry.rank || '',
      date: Date.now()
    });
    // Sort descending by score, keep top 50
    entries.sort(function(a, b) { return b.score - a.score; });
    if (entries.length > 50) entries.length = 50;
    localStorage.setItem('mooquest_leaderboard', JSON.stringify(entries));
    return true;
  }

  /**
   * Load all leaderboard entries, sorted by score descending.
   */
  static async loadLeaderboard() {
    const entries = JSON.parse(localStorage.getItem('mooquest_leaderboard') || '[]');
    entries.sort(function(a, b) { return b.score - a.score; });
    return entries;
  }

  /**
   * Clear only the leaderboard.
   */
  static async clearLeaderboard() {
    localStorage.removeItem('mooquest_leaderboard');
    return true;
  }

  /**
   * Wipe all saved data (progress, high scores, inventory, profile, leaderboard).
   */
  static async clearSave() {
    localStorage.removeItem('mooquest_save');
    localStorage.removeItem('mooquest_scores');
    localStorage.removeItem('mooquest_inventory');
    localStorage.removeItem('mooquest_profile');
    localStorage.removeItem('mooquest_leaderboard');
    return true;
  }
}
