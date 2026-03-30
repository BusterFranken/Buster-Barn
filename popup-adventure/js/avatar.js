// =============================================================================
// avatar.js — Pixel art avatar with dynamic item rendering
// Draws a character on canvas that gains items based on popup choices
// =============================================================================

const AvatarSystem = {
  canvas: null,
  ctx: null,
  scale: 4,
  width: 24,   // logical pixels
  height: 32,  // logical pixels
  items: [],
  animatingItem: null,
  _animFrame: null,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.width * this.scale;
    this.canvas.height = this.height * this.scale;
    this.ctx.imageSmoothingEnabled = false;
    this.items = [];
    this.render();
  },

  pixel(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
  },

  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.scale, y * this.scale, w * this.scale, h * this.scale);
  },

  drawBase() {
    const skin = '#FFDCB5';
    const hair = '#4A2800';
    const shirt = '#6688CC';
    const pants = '#335599';
    const shoes = '#222222';
    const eyes = '#000000';
    const mouth = '#CC5555';

    // Hair
    this.rect(9, 4, 6, 2, hair);
    this.rect(8, 5, 8, 2, hair);

    // Head/face
    this.rect(9, 7, 6, 6, skin);
    this.rect(8, 8, 8, 4, skin);

    // Eyes
    this.pixel(10, 9, eyes);
    this.pixel(13, 9, eyes);

    // Mouth
    this.rect(11, 11, 2, 1, mouth);

    // Neck
    this.rect(11, 13, 2, 1, skin);

    // Body/shirt
    this.rect(8, 14, 8, 7, shirt);

    // Arms
    this.rect(6, 14, 2, 6, shirt);
    this.rect(16, 14, 2, 6, shirt);
    // Hands
    this.rect(6, 20, 2, 1, skin);
    this.rect(16, 20, 2, 1, skin);

    // Belt
    this.rect(8, 21, 8, 1, '#444444');

    // Pants
    this.rect(8, 22, 3, 5, pants);
    this.rect(13, 22, 3, 5, pants);

    // Shoes
    this.rect(7, 27, 4, 2, shoes);
    this.rect(13, 27, 4, 2, shoes);
  },

  drawItem(item) {
    const draw = this.itemDrawers[item.id];
    if (draw) draw.call(this);
  },

  itemDrawers: {
    // === HEAD ITEMS ===
    crown() {
      this.rect(9, 2, 6, 2, '#FFD700');
      this.pixel(9, 1, '#FFD700');
      this.pixel(11, 1, '#FFD700');
      this.pixel(14, 1, '#FFD700');
      this.pixel(10, 0, '#FF0000');
      this.pixel(12, 0, '#FF0000');
    },
    tinfoil_hat() {
      this.rect(9, 2, 6, 3, '#C0C0C0');
      this.rect(10, 0, 4, 2, '#A0A0A0');
      this.rect(11, 0, 2, 1, '#888888');
    },
    headphones() {
      this.rect(7, 5, 2, 4, '#FF0000');
      this.rect(15, 5, 2, 4, '#FF0000');
      this.rect(8, 4, 8, 1, '#333333');
    },
    hard_hat() {
      this.rect(8, 3, 8, 2, '#FFCC00');
      this.rect(7, 4, 10, 1, '#FFCC00');
      this.rect(9, 2, 6, 1, '#FFAA00');
    },
    hacker_hood() {
      this.rect(8, 4, 8, 4, '#111111');
      this.rect(9, 4, 6, 2, '#111111');
    },

    // === FACE ITEMS ===
    sunglasses() {
      this.rect(9, 8, 3, 2, '#111111');
      this.rect(12, 8, 3, 2, '#111111');
      this.pixel(8, 9, '#111111');
      this.pixel(15, 9, '#111111');
    },
    heart_glasses() {
      this.rect(9, 8, 3, 2, '#FF1493');
      this.rect(12, 8, 3, 2, '#FF1493');
      this.pixel(10, 8, '#FF69B4');
      this.pixel(13, 8, '#FF69B4');
    },
    dollar_eyes() {
      this.pixel(10, 9, '#00AA00');
      this.pixel(13, 9, '#00AA00');
      this.pixel(9, 8, '#00AA00');
      this.pixel(11, 8, '#00AA00');
      this.pixel(12, 8, '#00AA00');
      this.pixel(14, 8, '#00AA00');
    },

    // === BODY ITEMS ===
    shield() {
      this.rect(3, 15, 3, 4, '#4488FF');
      this.rect(4, 14, 1, 6, '#4488FF');
      this.pixel(4, 16, '#FFFFFF');
    },
    double_shield() {
      this.rect(2, 14, 4, 5, '#4488FF');
      this.rect(3, 13, 2, 7, '#4488FF');
      this.pixel(3, 16, '#FFD700');
      this.pixel(4, 15, '#FFD700');
      this.pixel(4, 17, '#FFD700');
      this.pixel(5, 16, '#FFD700');
    },
    cape() {
      this.rect(7, 14, 1, 10, '#FF0000');
      this.rect(16, 14, 1, 10, '#FF0000');
      this.rect(6, 22, 2, 6, '#FF0000');
      this.rect(16, 22, 2, 6, '#FF0000');
      this.rect(5, 26, 3, 3, '#CC0000');
      this.rect(16, 26, 3, 3, '#CC0000');
    },
    fbi_vest() {
      this.rect(8, 14, 8, 7, '#1a1a4e');
      this.rect(10, 16, 4, 2, '#FFD700');
    },
    hacker_hoodie() {
      this.rect(8, 14, 8, 7, '#111111');
      this.rect(6, 14, 2, 6, '#111111');
      this.rect(16, 14, 2, 6, '#111111');
    },

    // === HAND ITEMS ===
    trophy() {
      this.rect(18, 17, 3, 1, '#FFD700');
      this.rect(19, 15, 1, 2, '#FFD700');
      this.rect(18, 14, 3, 1, '#FFD700');
      this.pixel(17, 14, '#FFD700');
      this.pixel(21, 14, '#FFD700');
    },
    money_bag() {
      this.rect(18, 16, 4, 4, '#228B22');
      this.rect(19, 15, 2, 1, '#228B22');
      this.pixel(19, 17, '#FFFF00');
      this.pixel(20, 18, '#FFFF00');
    },
    floppy_disk() {
      this.rect(18, 16, 4, 4, '#3333CC');
      this.rect(19, 16, 2, 2, '#CCCCCC');
      this.pixel(19, 19, '#333333');
    },
    ipod() {
      this.rect(18, 15, 3, 5, '#FFFFFF');
      this.rect(19, 16, 1, 2, '#87CEEB');
      this.pixel(19, 19, '#CCCCCC');
    },
    dice() {
      this.rect(18, 16, 4, 4, '#FF0000');
      this.pixel(19, 17, '#FFFFFF');
      this.pixel(20, 18, '#FFFFFF');
    },
    beaker() {
      this.rect(19, 14, 2, 5, '#88CCFF');
      this.rect(18, 18, 4, 2, '#88CCFF');
      this.pixel(19, 13, '#00FF00');
      this.pixel(20, 12, '#00FF00');
    },
    credit_card() {
      this.rect(18, 17, 5, 3, '#FFD700');
      this.rect(18, 17, 5, 1, '#CC0000');
      this.rect(19, 19, 3, 1, '#333333');
    },
    pirate_flag() {
      this.rect(20, 10, 1, 10, '#8B4513');
      this.rect(17, 10, 3, 3, '#000000');
      this.pixel(18, 11, '#FFFFFF');
    },
    magnifying_glass() {
      this.rect(18, 14, 3, 3, '#8B4513');
      this.pixel(19, 15, '#87CEEB');
      this.rect(20, 17, 1, 2, '#8B4513');
    },
    gold_coins() {
      this.pixel(18, 18, '#FFD700');
      this.pixel(19, 17, '#FFD700');
      this.pixel(20, 19, '#FFD700');
      this.pixel(17, 19, '#DAA520');
    },
    secret_folder() {
      this.rect(1, 16, 4, 3, '#DAA520');
      this.rect(1, 15, 2, 1, '#DAA520');
      this.rect(2, 17, 2, 1, '#FF0000');
    },
    lottery_ticket() {
      this.rect(1, 16, 5, 3, '#FFD700');
      this.rect(2, 17, 3, 1, '#FF0000');
    },
    medical_bag() {
      this.rect(1, 16, 4, 3, '#FFFFFF');
      this.rect(2, 16, 2, 3, '#FF0000');
      this.rect(1, 17, 4, 1, '#FF0000');
    },
    padlock() {
      this.rect(10, 13, 4, 1, '#888888');
      this.rect(9, 13, 1, 2, '#888888');
      this.rect(14, 13, 1, 2, '#888888');
      this.rect(9, 14, 6, 3, '#FFD700');
    },
    windows_cd() {
      this.rect(18, 16, 4, 4, '#C0C0C0');
      this.pixel(20, 18, '#0000FF');
      this.pixel(19, 17, '#FF0000');
      this.pixel(20, 17, '#00FF00');
      this.pixel(19, 18, '#FFFF00');
    },
    vpn_key() {
      this.rect(2, 15, 1, 3, '#00FF00');
      this.rect(1, 14, 3, 1, '#00FF00');
      this.pixel(1, 16, '#00FF00');
    },

    // === SHOULDER/ACCESSORY ITEMS ===
    bonzi_buddy() {
      this.rect(17, 11, 4, 4, '#800080');
      this.rect(18, 10, 2, 1, '#800080');
      this.pixel(18, 12, '#FFFF00');
      this.pixel(19, 12, '#FFFF00');
      this.pixel(18, 13, '#FF6600');
    },
    toolbar_stack() {
      this.rect(6, 0, 12, 1, '#C0C0C0');
      this.rect(6, 1, 12, 1, '#A0A0FF');
      this.rect(6, 2, 12, 1, '#FFA0A0');
      this.rect(6, 3, 12, 1, '#A0FFA0');
    },
    star_badge() {
      this.pixel(12, 15, '#FFD700');
      this.pixel(11, 16, '#FFD700');
      this.pixel(13, 16, '#FFD700');
      this.pixel(12, 17, '#FFD700');
      this.pixel(10, 15, '#FFD700');
      this.pixel(14, 15, '#FFD700');
    },
    dark_glasses() {
      this.rect(8, 8, 4, 2, '#000000');
      this.rect(12, 8, 4, 2, '#000000');
      this.pixel(7, 9, '#333333');
      this.pixel(16, 9, '#333333');
    },
    fbi_badge() {
      this.rect(10, 15, 4, 3, '#FFD700');
      this.rect(11, 15, 2, 1, '#000080');
      this.pixel(11, 17, '#000080');
      this.pixel(12, 17, '#000080');
    },
    wire_receipt() {
      this.rect(0, 10, 5, 6, '#FFFFFF');
      this.rect(1, 11, 3, 1, '#000000');
      this.rect(1, 13, 3, 1, '#000000');
      this.rect(1, 14, 2, 1, '#000000');
    }
  },

  addItem(itemDef) {
    if (!itemDef || this.items.find(i => i.id === itemDef.id)) return;
    this.items.push(itemDef);
    this.playAddAnimation(itemDef);
    this.updateInventoryGrid();
  },

  playAddAnimation(item) {
    const panel = document.getElementById('avatar-panel');
    if (panel) {
      panel.classList.add('item-flash');
      setTimeout(() => panel.classList.remove('item-flash'), 500);
    }
    this.render();
  },

  updateInventoryGrid() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';
    this.items.forEach(item => {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.title = item.name;
      slot.textContent = item.emoji || '?';
      grid.appendChild(slot);
    });
  },

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw base character
    this.drawBase();

    // Draw equipped items (order matters for layering)
    const slotOrder = ['cape', 'body', 'accessory', 'shoulder', 'head', 'face', 'left_hand', 'right_hand'];
    for (const slot of slotOrder) {
      const slotItems = this.items.filter(i => i.slot === slot);
      slotItems.forEach(item => this.drawItem(item));
    }
  },

  getItems() {
    return [...this.items];
  }
};
