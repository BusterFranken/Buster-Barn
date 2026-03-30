// =============================================================================
// InventoryUI.js — Win95-style tabbed inventory dialog (DOM-based)
// =============================================================================

const InventoryUI = (() => {

  const SLOTS = [
    { key: 'head',      label: 'HEAD' },
    { key: 'back',      label: 'BACK' },
    { key: 'hooves',    label: 'HOOVES' },
    { key: 'accessory', label: 'ACCESSORY' }
  ];

  /**
   * Open the inventory dialog on a specific tab.
   * @param {'equipment'|'powerups'|'cosmetics'} tab
   */
  function open(tab) {
    tab = tab || 'equipment';

    var bodyHTML = _buildTabs(tab) + _buildPanels(tab);

    var ref = MenuDialogs.custom('Inventory — ' + GameState.profile.name, bodyHTML, [
      { label: 'Close', primary: true }
    ], { width: 460 });

    // Wire tab clicks
    var tabs = ref.body.querySelectorAll('.inventory-tab');
    tabs.forEach(function(tabEl) {
      tabEl.addEventListener('click', function() {
        var target = this.dataset.tab;
        _switchTab(ref.body, target);
      });
    });
  }

  // -------------------------------------------------------------------------
  // Build HTML
  // -------------------------------------------------------------------------

  function _buildTabs(activeTab) {
    var html = '<div class="inventory-tabs">';
    var tabDefs = [
      { key: 'equipment', label: 'Equipment' },
      { key: 'powerups',  label: 'Power-Ups' },
      { key: 'cosmetics', label: 'Cosmetics' }
    ];
    tabDefs.forEach(function(t) {
      var cls = 'inventory-tab' + (t.key === activeTab ? ' active' : '');
      html += '<div class="' + cls + '" data-tab="' + t.key + '">' + t.label + '</div>';
    });
    html += '</div>';
    return html;
  }

  function _buildPanels(activeTab) {
    var html = '';

    // Equipment panel
    html += '<div class="inventory-panel' + (activeTab === 'equipment' ? ' active' : '') + '" data-panel="equipment">';
    html += _buildEquipmentGrid();
    html += '</div>';

    // Power-ups panel
    html += '<div class="inventory-panel' + (activeTab === 'powerups' ? ' active' : '') + '" data-panel="powerups">';
    html += _buildPowerupsList();
    html += '</div>';

    // Cosmetics panel
    html += '<div class="inventory-panel' + (activeTab === 'cosmetics' ? ' active' : '') + '" data-panel="cosmetics">';
    html += _buildCosmeticsList();
    html += '</div>';

    return html;
  }

  function _buildEquipmentGrid() {
    var inv = GameState.inventory;
    var html = '<div class="equip-grid">';

    SLOTS.forEach(function(slot) {
      var item = _findEquipped(inv.equipment, slot.key);
      html += '<div class="equip-slot">';
      html += '<div class="equip-slot-label">' + slot.label + '</div>';

      if (item) {
        html += '<div class="equip-item-icon">' + item.icon + '</div>';
        html += '<div class="equip-item-name">' + _esc(item.name);
        html += ' <span class="equip-item-rarity rarity-' + item.rarity + '">' + item.rarity.toUpperCase() + '</span>';
        html += '</div>';
        html += '<div class="equip-item-desc">' + _esc(item.description) + '</div>';
      } else {
        html += '<div class="equip-slot-empty">- Empty -</div>';
      }

      html += '</div>';
    });

    html += '</div>';

    // Show unequipped items below if any
    var unequipped = inv.equipment.filter(function(e) { return !e.equipped; });
    if (unequipped.length > 0) {
      html += '<div style="margin-top:12px;border-top:1px solid #808080;padding-top:8px">';
      html += '<div style="font-size:12px;color:#808080;margin-bottom:6px">UNEQUIPPED:</div>';
      unequipped.forEach(function(item) {
        html += '<div class="equip-slot" style="margin-bottom:4px">';
        html += '<span class="equip-item-icon">' + item.icon + '</span>';
        html += '<span class="equip-item-name">' + _esc(item.name) + '</span>';
        html += ' <span class="equip-item-rarity rarity-' + item.rarity + '">' + item.rarity.toUpperCase() + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    return html;
  }

  function _buildPowerupsList() {
    var powerups = GameState.inventory.powerups;
    if (!powerups || powerups.length === 0) {
      return '<div class="inventory-empty">No power-ups collected yet.<br><br>' +
             'Power-ups are found in worlds and give<br>temporary boosts during gameplay!</div>';
    }
    var html = '<div>';
    powerups.forEach(function(p) {
      html += '<div class="equip-slot" style="margin-bottom:4px">';
      html += '<span class="equip-item-icon">' + (p.icon || '⚡') + '</span>';
      html += '<span class="equip-item-name">' + _esc(p.name) + '</span>';
      if (p.quantity > 1) html += ' <span style="color:#808080">x' + p.quantity + '</span>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function _buildCosmeticsList() {
    var cosmetics = GameState.inventory.cosmetics;
    if (!cosmetics || cosmetics.length === 0) {
      return '<div class="inventory-empty">No cosmetics unlocked yet.<br><br>' +
             'Complete worlds and achievements to<br>unlock new looks for Violet!</div>';
    }
    var html = '<div>';
    cosmetics.forEach(function(c) {
      html += '<div class="equip-slot" style="margin-bottom:4px">';
      html += '<span class="equip-item-icon">' + (c.icon || '✨') + '</span>';
      html += '<span class="equip-item-name">' + _esc(c.name) + '</span>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function _findEquipped(equipment, slotKey) {
    for (var i = 0; i < equipment.length; i++) {
      if (equipment[i].slot === slotKey && equipment[i].equipped) return equipment[i];
    }
    return null;
  }

  function _switchTab(bodyEl, tabKey) {
    // Update tab styling
    bodyEl.querySelectorAll('.inventory-tab').forEach(function(t) {
      t.classList.toggle('active', t.dataset.tab === tabKey);
    });
    // Show correct panel
    bodyEl.querySelectorAll('.inventory-panel').forEach(function(p) {
      p.classList.toggle('active', p.dataset.panel === tabKey);
    });
  }

  function _esc(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { open: open };

})();
