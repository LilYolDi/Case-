
const $ = id => document.getElementById(id);

const cases = [
  {
    id: "starter",
    name: "STARTER CASE",
    icon: "📦",
    price: 100,
    skins: [
      {name:"G22 Carbon",icon:"🔫",rarity:"common",price:25,weight:35},
      {name:"USP Pixel",icon:"🔫",rarity:"common",price:35,weight:30},
      {name:"MP5 Storm",icon:"🔫",rarity:"rare",price:75,weight:18},
      {name:"AKR Neon",icon:"🔫",rarity:"rare",price:120,weight:10},
      {name:"AWM Dragon",icon:"🎯",rarity:"epic",price:250,weight:5},
      {name:"Knife Gold",icon:"🔪",rarity:"legendary",price:600,weight:2}
    ]
  },
  {
    id: "premium",
    name: "PREMIUM CASE",
    icon: "🎁",
    price: 250,
    skins: [
      {name:"P350 Forest",icon:"🔫",rarity:"common",price:50,weight:25},
      {name:"F/S Poison",icon:"🔫",rarity:"rare",price:120,weight:25},
      {name:"AKR Treasure",icon:"🔫",rarity:"rare",price:200,weight:20},
      {name:"M4 Night",icon:"🔫",rarity:"epic",price:350,weight:15},
      {name:"AWM Genesis",icon:"🎯",rarity:"epic",price:550,weight:10},
      {name:"Knife Ruby",icon:"🔪",rarity:"legendary",price:1200,weight:5}
    ]
  },
  {
    id: "elite",
    name: "ELITE CASE",
    icon: "💎",
    price: 500,
    skins: [
      {name:"UMP Cyber",icon:"🔫",rarity:"common",price:100,weight:20},
      {name:"AKR Dragon",icon:"🔫",rarity:"rare",price:250,weight:25},
      {name:"M4 Samurai",icon:"🔫",rarity:"epic",price:500,weight:20},
      {name:"AWM BOOM",icon:"🎯",rarity:"epic",price:700,weight:15},
      {name:"Knife Butterfly",icon:"🔪",rarity:"legendary",price:1500,weight:12},
      {name:"Gloves Gold",icon:"🥊",rarity:"legendary",price:2500,weight:8}
    ]
  }
];

const rarityNames = {
  common: "ОБЫЧНЫЙ",
  rare: "РЕДКИЙ",
  epic: "ЭПИЧЕСКИЙ",
  legendary: "ЛЕГЕНДАРНЫЙ"
};

const STORAGE_KEY = "s2_cases_data";

let saved = {};

try {
  saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
} catch {
  saved = {};
}

let balance = Number.isFinite(saved.balance)
  ? Math.max(0, saved.balance)
  : 1000;

let inventory = Array.isArray(saved.inventory)
  ? saved.inventory
  : [];

let history = Array.isArray(saved.history)
  ? saved.history
  : [];

let selectedCase = cases[0];
let spinning = false;

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    balance,
    inventory,
    history
  }));
}

function updateBalance() {
  $("balance").textContent = balance.toLocaleString("ru-RU");
  $("inventoryGold").textContent = balance.toLocaleString("ru-RU");
  saveData();
}

function randomSkin(caseData) {
  const total = caseData.skins.reduce(
    (sum, skin) => sum + skin.weight, 0
  );

  let random = Math.random() * total;

  for (const skin of caseData.skins) {
    random -= skin.weight;

    if (random <= 0) return {...skin};
  }

  return {...caseData.skins[0]};
}

function skinCard(skin) {
  return `
    <div class="skin-card ${skin.rarity}">
      <div class="skin-icon">${skin.icon}</div>
      <div class="skin-name">${skin.name}</div>
      <div class="skin-rarity">${rarityNames[skin.rarity]}</div>
    </div>
  `;
}

function renderCases() {
  $("casesGrid").innerHTML = cases.map(item => `
    <div class="case-card ${item.id === selectedCase.id ? "selected" : ""}"
         data-case="${item.id}">
      <div class="case-icon">${item.icon}</div>
      <h3>${item.name}</h3>
      <div class="case-price">🟡 ${item.price} GOLD</div>
    </div>
  `).join("");

  document.querySelectorAll(".case-card").forEach(card => {
    card.addEventListener("click", () => {
      if (spinning) return;

      selectedCase = cases.find(
        item => item.id === card.dataset.case
      );

      renderCases();
      updateSelectedCase();

      $("result").textContent = "КЕЙС ВЫБРАН!";
    });
  });

  updateSelectedCase();
}

function updateSelectedCase() {
  $("selectedCaseName").textContent = selectedCase.name;
  $("selectedCasePrice").textContent =
    `Стоимость: ${selectedCase.price} Gold`;
}

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", () => {
    if (spinning) return;

    document.querySelectorAll(".nav-btn").forEach(btn =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    document.querySelectorAll(".page").forEach(page =>
      page.classList.remove("active")
    );

    const pages = {
      cases: "casesPage",
      inventory: "inventoryPage",
      history: "historyPage"
    };

    $(pages[button.dataset.page]).classList.add("active");

    renderInventory();
    renderHistory();
    updateBalance();
  });
});

function createRoulette(winner) {
  const track = $("rouletteTrack");
  const winnerIndex = 40;

  const items = [];

  for (let i = 0; i < 50; i++) {
    items.push(
      i === winnerIndex ? winner : randomSkin(selectedCase)
    );
  }

  track.innerHTML = items.map(skinCard).join("");
  track.style.transition = "none";
  track.style.transform = "translateX(0px)";

  return winnerIndex;
}

function openCase() {
  if (spinning) return;

  if (balance < selectedCase.price) {
    $("result").textContent = "НЕДОСТАТОЧНО GOLD!";
    return;
  }

  spinning = true;

  $("openButton").disabled = true;
  $("openButton").textContent = "РУЛЕТКА КРУТИТСЯ...";

  balance -= selectedCase.price;
  updateBalance();

  const winner = randomSkin(selectedCase);
  const winnerIndex = createRoulette(winner);

  const track = $("rouletteTrack");
  const viewport = document.querySelector(".roulette-window");

  const winningCard = track.children[winnerIndex];

  $("result").textContent = "ИЩЕМ ТВОЙ СКИН...";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const cardCenter =
        winningCard.offsetLeft + winningCard.offsetWidth / 2;

      const target =
        cardCenter - viewport.clientWidth / 2;

      track.style.transition =
        "transform 6.5s cubic-bezier(0.10, 0.70, 0.10, 1)";

      track.style.transform = `translateX(-${target}px)`;
    });
  });

  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    spinning = false;

    const item = {
      id: Date.now() + Math.random(),
      ...winner,
      caseName: selectedCase.name,
      date: new Date().toLocaleString("ru-RU")
    };

    inventory.unshift(item);

    history.unshift({
      name: winner.name,
      icon: winner.icon,
      rarity: winner.rarity,
      caseName: selectedCase.name,
      date: item.date
    });

    history = history.slice(0, 50);

    $("result").innerHTML =
      `ТВОЙ ВЫИГРЫШ: ${winner.icon} ${winner.name}<br>` +
      `<span>${rarityNames[winner.rarity]} · ${winner.price} GOLD</span>`;

    $("openButton").disabled = false;
    $("openButton").textContent = "ОТКРЫТЬ ЕЩЁ РАЗ";

    saveData();
    updateBalance();
    renderInventory();
    renderHistory();
  }

  track.addEventListener("transitionend", event => {
    if (event.propertyName === "transform") finish();
  });

  setTimeout(finish, 7500);
}

$("openButton").addEventListener("click", openCase);

function renderInventory() {
  const grid = $("inventoryGrid");

  if (!inventory.length) {
    grid.innerHTML =
      '<div class="empty">Инвентарь пока пуст</div>';
    return;
  }

  grid.innerHTML = inventory.map(item => `
    <div class="inventory-item">
      <div class="skin-icon">${item.icon}</div>
      <h3>${item.name}</h3>
      <p>${rarityNames[item.rarity]}</p>
      <p>Цена продажи: ${item.price} Gold</p>
      <button class="sell-button" data-id="${item.id}">
        ПРОДАТЬ
      </button>
    </div>
  `).join("");

  grid.querySelectorAll(".sell-button").forEach(button => {
    button.addEventListener("click", () => {
      sellSkin(button.dataset.id);
    });
  });
}

function sellSkin(id) {
  const index = inventory.findIndex(
    item => String(item.id) === String(id)
  );

  if (index === -1) return;

  const item = inventory[index];

  balance += item.price;
  inventory.splice(index, 1);

  updateBalance();
  renderInventory();
}

function renderHistory() {
  const list = $("historyList");

  if (!history.length) {
    list.innerHTML =
      '<div class="empty">История открытий пока пуста</div>';
    return;
  }

  list.innerHTML = history.map(item => `
    <div class="history-item">
      <div>
        <strong>${item.icon} ${item.name}</strong>
        <div>${item.caseName}</div>
        <small>${item.date}</small>
      </div>
      <div>${rarityNames[item.rarity]}</div>
    </div>
  `).join("");
}

updateBalance();
renderCases();
renderInventory();
renderHistory();
