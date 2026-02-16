'use strict';

// ===============================
// STATE
// ===============================
const state = {
  category: 'X',
  pools: { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] },
  skipped: { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] },
  current: null,
  teams: [],
  sales: [],
  timer: { handle: null, left: 0, running: false },
};

// ===============================
// CONSTANTS
// ===============================
const CATEGORY_LABELS = {
  X: 'Goalkeepers (₹4L)',
  P: 'Prime (₹6L)',
  A: 'Elite (₹5L)',
  B: 'Core (₹4L)',
  C: 'Developing (₹3L)',
  UNSOLD: 'UnSold',
};

// ===============================
// LOAD JSON DATA
// ===============================
async function loadAuctionData() {
  const res = await fetch('./data/auction-data.json');
  const data = await res.json();

  state.teams = data.captains.map(c => ({
    name: c.name,
    budget: c.budget
  }));

  state.pools = {
    X: data.players.X.map(p => ({ ...p })),
    P: data.players.P.map(p => ({ ...p })),
    A: data.players.A.map(p => ({ ...p })),
    B: data.players.B.map(p => ({ ...p })),
    C: data.players.C.map(p => ({ ...p })),
    UNSOLD: []
  };

  state.skipped = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };
  state.category = 'X';
  state.current = null;
  state.sales = [];
}

// ===============================
// UTILS
// ===============================
function fmt(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}
function catLabel(cat) {
  return CATEGORY_LABELS[cat] || 'Unknown';
}

// ===============================
// DOM
// ===============================
const dom = {};

function cacheDOM() {
  dom.teamsTable = document.getElementById('teamsTable');
  dom.results = document.getElementById('results');
  dom.remainCat = document.getElementById('remainCat');
  dom.remainCount = document.getElementById('remainCount');
  dom.remainList = document.getElementById('remainList');
  dom.currentPlayerCard = document.getElementById('currentPlayerCard');
  dom.playerImg = document.getElementById('playerImg');
  dom.playerName = document.getElementById('playerName');
  dom.playerCat = document.getElementById('playerCat');
  dom.playerPosition = document.getElementById('playerPosition');
  dom.playerBase = document.getElementById('playerBase');
  dom.currentBid = document.getElementById('currentBid');
  dom.countdown = document.getElementById('countdown');
  dom.warn = document.getElementById('warn');
  dom.bidTeamsContainer = document.getElementById('bidTeamsContainer');
  dom.btnNext = document.getElementById('btnNext');
  dom.btnSkip = document.getElementById('btnSkip');
  dom.btnSell = document.getElementById('btnSell');
  dom.btnCancelTimer = document.getElementById('btnCancelTimer');
  dom.btnUndo = document.getElementById('btnUndo');
  dom.btnToggleResults = document.getElementById('btnToggleResults');
  dom.catButtons = document.querySelectorAll('.catBtn');
  dom.bidStepInput = document.getElementById('bidStep');
}

// ===============================
// RENDER
// ===============================
function renderAll() {
  renderTeams();
  renderResults();
  renderRemain();
  renderCurrent();
  highlightCat();
}

function highlightCat() {
  dom.catButtons.forEach(btn => {
    btn.classList.toggle('bg-slate-900', btn.dataset.cat === state.category);
    btn.classList.toggle('text-white', btn.dataset.cat === state.category);
  });
  dom.remainCat.textContent = catLabel(state.category);
}

function renderTeams() {
  dom.teamsTable.innerHTML = '';
  state.teams.forEach((team, i) => {
    const row = document.createElement('div');
    row.className = 'py-2 flex justify-between';
    row.innerHTML = `
      <div>${team.name}</div>
      <div>₹ ${fmt(team.budget)}</div>
    `;
    dom.teamsTable.appendChild(row);
  });
}

function renderResults() {
  dom.results.innerHTML = '';
  state.sales.forEach(sale => {
    const div = document.createElement('div');
    div.textContent = `${sale.playerName} → ${sale.team} (₹${fmt(sale.price)})`;
    dom.results.appendChild(div);
  });
}

function renderRemain() {
  const pool = state.pools[state.category] || [];
  dom.remainCount.textContent = pool.length;
  dom.remainList.innerHTML = pool.map(p =>
    `<div class="p-2 border rounded">${p.name} - ₹${fmt(p.basePrice)}</div>`
  ).join('');
}

function renderCurrent() {
  if (!state.current) {
    dom.currentPlayerCard.hidden = true;
    return;
  }
  dom.currentPlayerCard.hidden = false;
  dom.playerName.textContent = state.current.player.name;
  dom.playerBase.textContent = '₹ ' + fmt(state.current.player.basePrice);
  dom.currentBid.value = state.current.bid;
}

// ===============================
// ACTIONS
// ===============================
function setCategory(cat) {
  state.category = cat;
  renderAll();
}

function nextPlayer() {
  const pool = state.pools[state.category];
  if (!pool.length) return alert('No players left');

  const idx = Math.floor(Math.random() * pool.length);
  const player = pool.splice(idx, 1)[0];

  state.current = {
    player,
    category: state.category,
    bid: player.basePrice,
    bidder: null
  };

  renderAll();
}

function placeBid(teamIndex) {
  if (!state.current) return;

  const step = Number(dom.bidStepInput.value) || 0;
  const team = state.teams[teamIndex];

  const nextBid = state.current.bidder === null
    ? state.current.bid
    : state.current.bid + step;

  if (nextBid > team.budget) return;

  state.current.bid = nextBid;
  state.current.bidder = teamIndex;
  renderCurrent();
}

function sell() {
  if (!state.current || state.current.bidder === null) return;

  const { player, bid, bidder } = state.current;
  state.teams[bidder].budget -= bid;

  state.sales.push({
    team: state.teams[bidder].name,
    teamIndex: bidder,
    playerName: player.name,
    category: state.current.category,
    price: bid
  });

  state.current = null;
  renderAll();
}

// ===============================
// EVENTS
// ===============================
function wireEvents() {
  dom.catButtons.forEach(btn =>
    btn.addEventListener('click', () => setCategory(btn.dataset.cat))
  );

  dom.btnNext.addEventListener('click', nextPlayer);
  dom.btnSell.addEventListener('click', sell);
}

// ===============================
// INIT
// ===============================
(async function init() {
  await loadAuctionData();
  cacheDOM();
  wireEvents();
  renderAll();
})();
