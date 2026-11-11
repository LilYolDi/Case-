
const $ = id => document.getElementById(id);

// Реальные изображения скинов Standoff 2
const skins = {
  akrScale: {
    name: "AKR Scale",
    image: "https://esports.ru/wp-content/uploads/2026/01/akr-scale-photoroom.png",
    rarity: "uncommon", price: 120
  },
  uspChameleon: {
    name: "USP Chameleon",
    image: "https://esports.ru/wp-content/uploads/2026/01/usp-chameleon-photoroom.png",
    rarity: "legendary", price: 600
  },
  awmBoom: {
    name: "AWM BOOM",
    image: "https://esports.ru/wp-content/uploads/2026/01/awm-boom-photoroom.png",
    rarity: "arcane", price: 1800
  },
  p350Oni: {
    name: "P350 Oni",
    image: "https://esports.ru/wp-content/uploads/2026/01/p350-oni-photoroom.png",
    rarity: "rare", price: 180
  },
  m4Demon: {
    name: "M4 Demon",
    image: "https://esports.ru/wp-content/uploads/2026/01/m4-demon-photoroom.png",
    rarity: "rare", price: 220
  },
  m4a1Bubblegum: {
    name: "M4A1 Bubblegum",
    image: "https://esports.ru/wp-content/uploads/2026/01/m4a1-bubblegum-photoroom.png",
    rarity: "arcane", price: 2200
  },
  deagleOrochi: {
    name: "Desert Eagle Orochi",
    image: "https://esports.ru/wp-content/uploads/2026/01/desert-eagle-orochi-photoroom.png",
    rarity: "legendary", price: 750
  },
  awmElevation: {
    name: "AWM Elevation",
    image: "https://esports.ru/wp-content/uploads/2026/01/awm-elevation-photoroom.png",
    rarity: "uncommon", price: 90
  },
  m60SteamBeast: {
    name: "M60 Steam Beast",
    image: "https://esports.ru/wp-content/uploads/2026/01/m60-steam-beast-photoroom.png",
    rarity: "epic", price: 400
  },
  famasAnger: {
    name: "FAMAS Anger",
    image: "https://esports.ru/wp-content/uploads/2026/01/famas-anger-photoroom.png",
    rarity: "epic", price: 350
  },
  glovesBurningFists: {
    name: "Gloves Burning Fists",
    image: "https://esports.ru/wp-content/uploads/2026/01/gloves-burning-fists.png",
    rarity: "arcane", price: 2500
  }
};

function makeSkin(id, weight) {
  return { ...skins[id], weight };
}

const cases = [
  {
    id: "starter",
    name: "STARTER CASE",
    icon: "📦",
    price: 100,
    skins: [
      makeSkin("awmElevation", 35),
      makeSkin("akrScale", 30),
      makeSkin("p350Oni", 18),
      makeSkin("m4Demon", 10),
      makeSkin("famasAnger", 5),
      makeSkin("uspChameleon", 2)
    ]
  },
  {
    id: "premium",
    name: "PREMIUM CASE",
    icon: "🎁",
    price: 250,
    skins: [
      makeSkin("p350Oni", 25),
      makeSkin("akrScale", 25),
      makeSkin("m4Demon", 20),
      makeSkin("m60SteamBeast", 15),
      makeSkin("deagleOrochi", 10),
      makeSkin("awmBoom", 5)
    ]
  },
  {
    id: "elite",
    name: "ELITE CASE",
    icon: "💎",
    price: 500,
    skins: [
      makeSkin("m4Demon", 20),
      makeSkin("famasAnger", 20),
      makeSkin("m60SteamBeast", 20),
      makeSkin("uspChameleon", 15),
      makeSkin("m4a1Bubblegum", 15),
      makeSkin("glovesBurningFists", 10)
    ]
  }
];

const rarityNames = {
  common: "ОБЫЧНЫЙ",
  uncommon: "НЕОБЫЧНЫЙ",
  rare: "РЕДКИЙ",
  epic: "ЭПИЧЕСКИЙ",
  legendary: "ЛЕГЕНДАРНЫЙ",
  arcane: "ТАЙНЫЙ"
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
    if (random <= 0) return { ...skin };
  }

  return { ...caseData.skins[0] };
}

// Разделяем название оружия и название скина
function getSkinTitle(name) {
  const prefixes = [
    "Desert Eagle",
    "Gloves",
    "M4A1",
    "AWM",
    "AKR",
    "USP",
    "P350",
    "M60",
    "FAMAS"
  ];

  for (const prefix of prefixes) {
    if (name.startsWith(prefix + " ")) {
      return {
        weapon: prefix,
        skin: name.slice(prefix.length).trim()
      };
    }
  }

  const parts = name.split(" ");
  return {
    weapon: parts.shift() || name,
    skin: parts.join(" ")
  };
}

function skinImage(skin, className = "skin-image") {
  if (!skin.image) {
    return `<div class="skin-icon">${skin.icon || "🔫"}</div>`;
  }

  return `
    <img
      class="${className}"
      src="${skin.image}"
      alt="${skin.name}"
      loading="lazy"
      onerror="this.outerHTML='<div class=\\'image-fallback\\'>${skin.name}</div>'"
    >
  `;
}

// Карточка скина в стиле примера
function skinCard(skin) {
  const title = getSkinTitle(skin.name);

  return `
    <div class="skin-card ${skin.rarity}">
      <div class="skin-price">${skin.price} G</div>

      <div class="skin-art">
        <div class="skin-neon"></div>
        ${skinImage(skin)}
      </div>

      <div class="skin-card-info">
        <div class="skin-weapon">${title.weapon}</div>
        <div class="skin-card-bottom">
          <span class="skin-name">${title.skin}</span>
          <span class="rarity-triangles">▼▼▼</span>
        </div>
      </div>
    </div>
  `;
}

// Карточки кейсов с изображениями их содержимого
function renderCases() {
  $("casesGrid").innerHTML = cases.map(item => `
    <div class="case-card ${item.id === selectedCase.id ? "selected" : ""}"
         data-case="${item.id}">

      <div class="case-preview">
        ${item.skins.slice(0, 3).map(skin => `
          <div class="case-preview-item">
            ${skinImage(skin)}
          </div>
        `).join("")}
      </div>

      <h3>${item.name}</h3>
      <div class="case-price">🟡 ${item.price} GOLD</div>

      <div class="case-skin-count">
        ${item.skins.length} СКИНОВ ВНУТРИ
      </div>
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

      const target = cardCenter - viewport.clientWidth / 2;

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
      ...winner,
      caseName: selectedCase.name,
      date: item.date
    });

    history = history.slice(0, 50);

    $("result").innerHTML =
      `ТВОЙ ВЫИГРЫШ: ${skinImage(winner, "result-image")} ${winner.name}<br>` +
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
    <div class="inventory-item ${item.rarity}">
      <div class="inventory-skin-art">
        ${skinImage(item)}
      </div>

      <h3>${item.name}</h3>
      <p>${rarityNames[item.rarity] || item.rarity}</p>
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
      <div class="history-skin">
        ${skinImage(item)}
        <div>
          <strong>${item.name}</strong>
          <div>${item.caseName}</div>
          <small>${item.date}</small>
        </div>
      </div>
      <div>${rarityNames[item.rarity] || item.rarity}</div>
    </div>
  `).join("");
}

updateBalance();
renderCases();
renderInventory();
renderHistory();
