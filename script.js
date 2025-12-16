const RESOURCES = {
LEGENDARY_T1: { blueEmbers: 5 },
LEGENDARY_T2: { purpleEmbers: 5 },
LEGENDARY_T3: { redEmbers: 5 },
MYTHIC_T0: { equipment: 2, blueEmbers: 5, purpleEmbers: 3, redEmbers: 2 },
MYTHIC_T1: { essences: 2, blueEmbers: 3, purpleEmbers: 2, redEmbers: 1 },
MYTHIC_T2: { essences: 3, blueEmbers: 3, purpleEmbers: 2, redEmbers: 1 },
MYTHIC_T3: { essences: 5, blueEmbers: 3, purpleEmbers: 2, redEmbers: 1 },
REFINED_T1: { blueEmbers: 3, purpleEmbers: 2, redEmbers: 1 },
REFINED_T2: { blueEmbers: 3, purpleEmbers: 2, redEmbers: 1 },
REFINED_T3: { blueEmbers: 3, purpleEmbers: 2, redEmbers: 1 }
};

const TIER_BACKGROUNDS = {
"legendary-0": "images/item_equipment_base_05.png",
"legendary-1": "images/item_equipment_base_05_pow.png",
"legendary-2": "images/item_equipment_base_05_pow.png",
"legendary-3": "images/item_equipment_base_05_pow.png",
"mythic-0": "images/item_equipment_base_06.png",
"mythic-1": "images/item_equipment_base_06_pow.png",
"mythic-2": "images/item_equipment_base_06_pow.png",
"mythic-3": "images/item_equipment_base_06_pow.png",
"refined-1": "images/item_equipment_base_06_pow.png",
"refined-2": "images/item_equipment_base_06_pow.png",
"refined-3": "images/item_equipment_base_06_pow.png"
};

const STAR_IMAGES = {
legendary: "images/armor_star_5.png",
mythic: "images/armor_star_6.png",
refined: "images/armor_star_7.png"
};

let equipmentList = [];
let nextId = 1;
let sortable = null;
let dragSrcEl = null;

const STORAGE_KEYS = {
RESOURCES: "souls_calc_resources",
EQUIPMENT: "souls_calc_equipment",
NEXT_ID: "souls_calc_next_id"
};

function saveToLocalStorage() {
const resources = {
essences: document.getElementById("essences").value,
blueEmbers: document.getElementById("blueEmbers").value,
purpleEmbers: document.getElementById("purpleEmbers").value,
redEmbers: document.getElementById("redEmbers").value,
equipment: document.getElementById("equipment").value
};

localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipmentList));
localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId.toString());
}

function loadFromLocalStorage() {
const savedResources = localStorage.getItem(STORAGE_KEYS.RESOURCES);
const savedEquipment = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
const savedNextId = localStorage.getItem(STORAGE_KEYS.NEXT_ID);

if (savedResources) {
const resources = JSON.parse(savedResources);
document.getElementById("essences").value = resources.essences || 0;
document.getElementById("blueEmbers").value = resources.blueEmbers || 0;
document.getElementById("purpleEmbers").value = resources.purpleEmbers || 0;
document.getElementById("redEmbers").value = resources.redEmbers || 0;
document.getElementById("equipment").value = resources.equipment || 0;
}

if (savedNextId) {
nextId = parseInt(savedNextId);
}

if (savedEquipment) {
const equipment = JSON.parse(savedEquipment);
if (equipment.length > 0) {
equipmentList = equipment;
equipmentList.forEach(eq => {
const row = createEquipmentRow(eq.id);
document.getElementById("equipmentList").appendChild(row);

    if (eq.currentGrade) {
      updateGradePill(`current-grade-${eq.id}`, eq.currentGrade);
    }
    if (eq.targetGrade) {
      updateGradePill(`target-grade-${eq.id}`, eq.targetGrade);
    }
    
    if (eq.currentGrade && eq.currentTier !== null) {
      updateTierButton(document.getElementById(`current-tier-${eq.id}`), eq.currentTier, eq.currentGrade);
    }
    if (eq.targetGrade && eq.targetTier !== null) {
      updateTierButton(document.getElementById(`target-tier-${eq.id}`), eq.targetTier, eq.targetGrade);
    }
  });
  return true;
}

}

return false;
}

["essences", "blueEmbers", "purpleEmbers", "redEmbers", "equipment"].forEach(id => {
document.getElementById(id).addEventListener("input", () => {
updateResults();
saveToLocalStorage();
});
});

function getProgressionIndex(grade, tier) {
if (grade === "legendary") return tier;
if (grade === "mythic") return 4 + tier;
if (grade === "refined") return 8 + tier;
return 0;
}

function isDowngrade(equipment) {
const { currentGrade, currentTier, targetGrade, targetTier } = equipment;

if (!currentGrade || currentTier === null || !targetGrade || targetTier === null) {
return false;
}

const currentIndex = getProgressionIndex(currentGrade, currentTier);
const targetIndex = getProgressionIndex(targetGrade, targetTier);

return targetIndex < currentIndex;
}

function updateRowWarning(id) {
const equipment = equipmentList.find(eq => eq.id === id);
const row = document.getElementById(`equipment-${id}`);

if (!equipment || !row) return;

if (isDowngrade(equipment)) {
row.classList.add("warning-downgrade");
} else {
row.classList.remove("warning-downgrade");
}
}

function calculateRequirements(equipment) {
const { currentGrade, currentTier, targetGrade, targetTier } = equipment;

if (!currentGrade || currentTier === null || !targetGrade || targetTier === null) return null;

const startIndex = getProgressionIndex(currentGrade, currentTier);
const endIndex = getProgressionIndex(targetGrade, targetTier);

if (startIndex >= endIndex) return null;

const requirements = {
essences: 0, blueStones: 0, purpleStones: 0, redStones: 0,
blueEmbers: 0, purpleEmbers: 0, redEmbers: 0, equipment: 0
};

const addReqs = (reqs) => {
Object.keys(reqs).forEach(key => {
requirements[key] += reqs[key];
});
};

for (let i = startIndex + 1; i <= endIndex; i++) {
if (i === 1) addReqs(RESOURCES.LEGENDARY_T1);
else if (i === 2) addReqs(RESOURCES.LEGENDARY_T2);
else if (i === 3) addReqs(RESOURCES.LEGENDARY_T3);
else if (i === 4) addReqs(RESOURCES.MYTHIC_T0);
else if (i === 5) addReqs(RESOURCES.MYTHIC_T1);
else if (i === 6) addReqs(RESOURCES.MYTHIC_T2);
else if (i === 7) addReqs(RESOURCES.MYTHIC_T3);
else if (i === 9) addReqs(RESOURCES.REFINED_T1);
else if (i === 10) addReqs(RESOURCES.REFINED_T2);
else if (i === 11) addReqs(RESOURCES.REFINED_T3);
}

return requirements;
}

function initializeSortable() {
const el = document.getElementById("equipmentList");
if (sortable) {
sortable.destroy();
}

sortable = new Sortable(el, {
animation: 150,
handle: ".drag-handle",
ghostClass: "sortable-ghost",
chosenClass: "sortable-chosen",
dragClass: "sortable-drag",
forceFallback: true,
fallbackTolerance: 3,
touchStartThreshold: 5,
delay: 100,
delayOnTouchOnly: true,
onStart: function(evt) {
const row = evt.item;
row.querySelectorAll("button, input").forEach(el => {
el.style.pointerEvents = "none";
});
},
onEnd: function(evt) {
const row = evt.item;
row.querySelectorAll("button, input").forEach(el => {
el.style.pointerEvents = "";
});

  const movedItem = equipmentList[evt.oldIndex];
  equipmentList.splice(evt.oldIndex, 1);
  equipmentList.splice(evt.newIndex, 0, movedItem);
  saveToLocalStorage();
  updateResults();
}

});
}

function createEquipmentRow(id) {
const row = document.createElement("div");
row.className = "equipment-row bg-slate-700 rounded-lg py-2 px-3 mb-3";
row.id = `equipment-${id}`;
row.setAttribute("data-id", id);
row.innerHTML = `
<div class="flex items-center gap-2">
<button class="remove-btn text-red-400 hover:text-red-300 flex-shrink-0" data-id="${id}">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
</button>

  <div class="flex gap-1.5 items-center flex-1">
    <button id="current-grade-${id}" class="grade-pill relative flex-shrink-0" data-id="${id}" data-field="currentGrade">
      <div class="grade-segment legendary"></div>
      <div class="grade-segment mythic"></div>
      <div class="grade-segment refined"></div>
      <div class="grade-pill-indicator"></div>
    </button>
    <button id="current-tier-${id}" class="tier-cycle-btn rounded" data-id="${id}" data-field="currentTier"></button>
  </div>
  
  <div class="text-lg text-slate-400">→</div>
  
  <div class="flex gap-1.5 items-center flex-1">
    <button id="target-grade-${id}" class="grade-pill relative flex-shrink-0" data-id="${id}" data-field="targetGrade">
      <div class="grade-segment legendary"></div>
      <div class="grade-segment mythic"></div>
      <div class="grade-segment refined"></div>
      <div class="grade-pill-indicator"></div>
    </button>
    <button id="target-tier-${id}" class="tier-cycle-btn rounded" data-id="${id}" data-field="targetTier"></button>
  </div>
  
  <div class="drag-handle flex-shrink-0 ml-2" data-id="${id}">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
  </div>
</div>

`;

attachRowListeners(row, id);
return row;
}

function updateGradePill(pillId, grade) {
const pill = document.getElementById(pillId);
pill.classList.remove("unselected", "selected-legendary", "selected-mythic", "selected-refined");
if (grade) {
pill.classList.add(`selected-${grade}`);
} else {
pill.classList.add("unselected");
}
}

function updateTierButton(button, tier, grade) {
const bgKey = `${grade}-${tier}`;
const bgImage = TIER_BACKGROUNDS[bgKey];

if (bgImage) {
button.style.backgroundImage = `url("${bgImage}")`;
}

const starImage = STAR_IMAGES[grade];
let stars = "";

const numStars = (grade === "refined" && tier === 0) ? 0 : tier;

stars = `<div class="tier-stars-container">`;
for (let i = 0; i < numStars; i++) {
stars += `<img src="${starImage}" class="tier-star" alt="tier star">`;
}
stars += "</div>";

button.innerHTML = stars;
}

function attachRowListeners(row, id) {
row.querySelector(".remove-btn").addEventListener("click", function() {
equipmentList = equipmentList.filter(eq => eq.id !== id);
row.remove();
saveToLocalStorage();
updateResults();
});

["current-grade", "target-grade"].forEach(prefix => {
const btn = row.querySelector(`#${prefix}-${id}`);
const tierField = prefix.replace("-grade", "-tier");

btn.addEventListener("click", function() {
  const field = this.dataset.field;
  const equipment = equipmentList.find(eq => eq.id === id);
  
  if (equipment) {
    const grades = ["legendary", "mythic", "refined"];
    const currentIndex = equipment[field] ? grades.indexOf(equipment[field]) : -1;
    const nextIndex = (currentIndex + 1) % grades.length;
    equipment[field] = grades[nextIndex];
    
    const minTier = (equipment[field] === "refined") ? 1 : 0;
    equipment[field.replace("Grade", "Tier")] = minTier;
    
    updateGradePill(this.id, equipment[field]);
    
    const tierBtn = row.querySelector(`#${tierField}-${id}`);
    const tierFieldName = field.replace("Grade", "Tier");
    updateTierButton(tierBtn, equipment[tierFieldName], equipment[field]);
    
    updateRowWarning(id);
    saveToLocalStorage();
    updateResults();
  }
});

});

["current", "target"].forEach(prefix => {
const btn = row.querySelector(`#${prefix}-tier-${id}`);
btn.addEventListener("click", function(e) {
const equipment = equipmentList.find(eq => eq.id === id);
const field = prefix + "Tier";
const gradeField = prefix + "Grade";

  if (equipment && equipment[gradeField]) {
    const maxTier = 3;
    const minTier = equipment[gradeField] === "refined" ? 1 : 0;
    
    equipment[field] = equipment[field] + 1;
    if (equipment[field] > maxTier) {
      equipment[field] = minTier;
    }
    
    updateTierButton(this, equipment[field], equipment[gradeField]);
    updateRowWarning(id);
    saveToLocalStorage();
    updateResults();
  }
});

});
}

function updateResults() {
const totals = equipmentList.reduce((total, eq) => {
const reqs = calculateRequirements(eq);
if (!reqs) return total;

Object.keys(reqs).forEach(key => {
  total[key] += reqs[key];
});
return total;

}, {
essences: 0, blueStones: 0, purpleStones: 0, redStones: 0,
blueEmbers: 0, purpleEmbers: 0, redEmbers: 0, equipment: 0
});

document.getElementById("spent-essences").textContent = totals.essences;
document.getElementById("spent-blueEmbers").textContent = totals.blueEmbers;
document.getElementById("spent-purpleEmbers").textContent = totals.purpleEmbers;
document.getElementById("spent-redEmbers").textContent = totals.redEmbers;

const inventory = {
essences: parseInt(document.getElementById("essences").value) || 0,
blueEmbers: parseInt(document.getElementById("blueEmbers").value) || 0,
purpleEmbers: parseInt(document.getElementById("purpleEmbers").value) || 0,
redEmbers: parseInt(document.getElementById("redEmbers").value) || 0,
equipment: parseInt(document.getElementById("equipment").value) || 0
};

["blueEmbers", "purpleEmbers", "redEmbers"].forEach(key => {
const remaining = inventory[key] - totals[key];
const element = document.getElementById(`remaining-${key}`);
element.textContent = remaining;

if (remaining < 0) {
  element.classList.add("negative");
} else {
  element.classList.remove("negative");
}

});

const essenceRemaining = inventory.essences - totals.essences;
const essenceElement = document.getElementById("remaining-essences");

if (essenceRemaining < 0) {
const equipmentAdjustedRemaining = inventory.equipment - totals.equipment + essenceRemaining;

essenceElement.textContent = "0";
essenceElement.classList.remove("negative");

const equipmentRemainingEl = document.getElementById("remaining-equipment");
equipmentRemainingEl.textContent = equipmentAdjustedRemaining;
if (equipmentAdjustedRemaining < 0) {
  equipmentRemainingEl.classList.add("text-red-400", "font-bold");
} else {
  equipmentRemainingEl.classList.remove("text-red-400", "font-bold");
}

} else {
essenceElement.textContent = essenceRemaining;
essenceElement.classList.remove("negative");

const equipmentRemaining = inventory.equipment - totals.equipment;
const equipmentRemainingEl = document.getElementById("remaining-equipment");
equipmentRemainingEl.textContent = equipmentRemaining;
if (equipmentRemaining < 0) {
  equipmentRemainingEl.classList.add("text-red-400", "font-bold");
} else {
  equipmentRemainingEl.classList.remove("text-red-400", "font-bold");
}

}
}

function showModal(title, message, finePrint, confirmText, onConfirm) {
const modal = document.getElementById("modal");
document.getElementById("modalTitle").textContent = title;
document.getElementById("modalMessage").textContent = message;
document.getElementById("modalFinePrint").textContent = finePrint;
document.getElementById("modalConfirm").textContent = confirmText;

const confirmBtn = document.getElementById("modalConfirm");
const cancelBtn = document.getElementById("modalCancel");
const closeBtn = document.getElementById("modalClose");

const closeModal = () => {
modal.classList.add("hidden");
confirmBtn.replaceWith(confirmBtn.cloneNode(true));
cancelBtn.replaceWith(cancelBtn.cloneNode(true));
closeBtn.replaceWith(closeBtn.cloneNode(true));
};

document.getElementById("modalConfirm").addEventListener("click", () => {
onConfirm();
closeModal();
});

document.getElementById("modalCancel").addEventListener("click", closeModal);
document.getElementById("modalClose").addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
if (e.target.id === "modal") {
closeModal();
}
});

modal.classList.remove("hidden");
}

function resetMaterials() {
document.getElementById("essences").value = 0;
document.getElementById("blueEmbers").value = 0;
document.getElementById("purpleEmbers").value = 0;
document.getElementById("redEmbers").value = 0;
document.getElementById("equipment").value = 0;
saveToLocalStorage();
updateResults();
}

function clearEquipment() {
document.getElementById("equipmentList").innerHTML = "";
equipmentList = [];

const id = nextId++;
const equipment = {
id,
currentGrade: "legendary",
currentTier: 0,
targetGrade: "mythic",
targetTier: 0
};
equipmentList.push(equipment);

const row = createEquipmentRow(id);
document.getElementById("equipmentList").appendChild(row);

updateGradePill(`current-grade-${id}`, "legendary");
updateGradePill(`target-grade-${id}`, "mythic");

updateTierButton(document.getElementById(`current-tier-${id}`), 0, "legendary");
updateTierButton(document.getElementById(`target-tier-${id}`), 0, "mythic");

initializeSortable();
saveToLocalStorage();
updateResults();
}

document.getElementById("resetMaterialsBtn").addEventListener("click", function() {
showModal(
"Reset Materials",
"Do you want to reset all owned material quantities?",
"All current data will be cleared from the input fields.",
"Reset",
resetMaterials
);
});

document.getElementById("clearEquipmentBtn").addEventListener("click", function() {
showModal(
"Remove Equipment",
"Do you want to remove all added equipment entries?",
"The equipment list will be cleared and reset to a single default entry.",
"Remove",
clearEquipment
);
});

window.addEventListener("DOMContentLoaded", function() {
const hasLoadedData = loadFromLocalStorage();

if (!hasLoadedData) {
const id = nextId++;
const equipment = {
id,
currentGrade: "legendary",
currentTier: 0,
targetGrade: "mythic",
targetTier: 0
};
equipmentList.push(equipment);

const row = createEquipmentRow(id);
document.getElementById("equipmentList").appendChild(row);

updateGradePill(`current-grade-${id}`, "legendary");
updateGradePill(`target-grade-${id}`, "mythic");

updateTierButton(document.getElementById(`current-tier-${id}`), 0, "legendary");
updateTierButton(document.getElementById(`target-tier-${id}`), 0, "mythic");

}

initializeSortable();
updateResults();
});

document.getElementById("addEquipmentBtn").addEventListener("click", function() {
const id = nextId++;
const equipment = {
id,
currentGrade: "legendary",
currentTier: 0,
targetGrade: "mythic",
targetTier: 0
};
equipmentList.push(equipment);

const row = createEquipmentRow(id);
document.getElementById("equipmentList").appendChild(row);

updateGradePill(`current-grade-${id}`, "legendary");
updateGradePill(`target-grade-${id}`, "mythic");

updateTierButton(document.getElementById(`current-tier-${id}`), 0, "legendary");
updateTierButton(document.getElementById(`target-tier-${id}`), 0, "mythic");

saveToLocalStorage();
updateResults();
});