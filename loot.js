const gearSlots = ["Chest", "Legs", "Head", "Hands", "Feet"];

const charAttr = ["STR", "AGI", "INT"];

const rarity = ["Common", "Uncommon", "Rare", "Epic"];

class Gear {
  constructor() {
    this.name = "";
    this.slot = 0;
    this.rarity = 0;
    this.charAttr = 0;
    this.charAttrAmount = 0;
    this.armor = 0;
  }
}

function generateGear(level) {
  let gear = new Gear();

  gear.slot = Math.floor(Math.random() * gearSlots.length);

  let rarityRoll = Math.random();
  if (rarityRoll < 0.01) {
    gear.rarity = 3; // Epic
  } else if (rarityRoll < 0.05) {
    gear.rarity = 2; // Rare
  } else if (rarityRoll < 0.25) {
    gear.rarity = 1; // Uncommon
  } else {
    gear.rarity = 0; // Common
  }

  gear.armor = Math.floor(level * 10 * (1 + gear.rarity * 0.2));

  gear.charAttr = Math.floor(Math.random() * charAttr.length);

  gear.charAttrAmount = Math.floor(level * (1 + gear.rarity * 0.2));

  return gear;
}

function gearToText(gear) {
  let str = "";

  str += "Slot: ";
  str += gearSlots[gear.slot];
  str += "\n";

  str += "Rarity: ";
  str += rarity[gear.rarity];
  str += "\n";

  str += "Armor: ";
  str += gear.armor;
  str += "\n";

  str += "Bonus: +";
  str += gear.charAttrAmount;
  str += " " + charAttr[gear.charAttr];
  str += "\n";

  return str;
}

// test
let gear = generateGear(10);
console.log(gear);
console.log(gearToText(gear));
