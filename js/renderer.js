// Cached DOM elements (with safe access)
const dom = {
  teamsTable: document.getElementById('teamsTable'),
  results: document.getElementById('results'),
  remainCat: document.getElementById('remainCat'),
  remainCount: document.getElementById('remainCount'),
  remainList: document.getElementById('remainList'),
  currentPlayerCard: document.getElementById('currentPlayerCard'),
  playerImg: document.getElementById('playerImg'),
  playerName: document.getElementById('playerName'),
  playerCat: document.getElementById('playerCat'),
  playerPosition: document.getElementById('playerPosition'),
  playerBase: document.getElementById('playerBase'),
  currentBid: document.getElementById('currentBid'),
  countdown: document.getElementById('countdown'),
  warn: document.getElementById('warn'),
  bidTeamsContainer: document.getElementById('bidTeamsContainer'),
  btnNext: document.getElementById('btnNext'),
  btnSkip: document.getElementById('btnSkip'),
  btnSell: document.getElementById('btnSell'),
  btnToggleResults: document.getElementById('btnToggleResults'),
  catButtons: document.querySelectorAll('.catBtn'),
  bidStepInput: document.getElementById('bidStep')
};

// ===============================
// Master render
// ===============================
function renderAll() {
  renderTeams();
  renderResults();
  renderRemain();
  renderCurrent();
  highlightCat();
}

// ===============================
// Category UI
// ===============================
function highlightCat() {
  document.querySelectorAll('.catBtn').forEach((btn) => {
    if (btn.dataset.cat === state.category) {
      btn.classList.add('bg-slate-900', 'text-white');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
    } else {
      btn.classList.remove('bg-slate-900', 'text-white');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    }
  });

  if (dom.remainCat) dom.remainCat.textContent = catLabel(state.category);
}

// ===============================
// Teams / Budgets
// ===============================
function renderTeams() {
  if (!dom.teamsTable) return;
  dom.teamsTable.innerHTML = '';

  state.teams.forEach((team, i) => {
    const row = document.createElement('div');
    row.className = 'py-2 flex items-center justify-between gap-3';

    row.innerHTML = `
      <div class="font-medium">${team.name}</div>
      <div class="text-right">
        <div class="text-xs text-slate-500">Remaining</div>
        <div class="font-semibold">
          <button data-edit-team="${i}" class="editable underline-offset-2 hover:underline text-sm">
            ₹ <span>${fmt(team.budget)}</span>
          </button>
        </div>
      </div>
    `;

    dom.teamsTable.appendChild(row);

    const editBtn = row.querySelector('[data-edit-team]');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const input = prompt(`Edit remaining budget for ${team.name}`, team.budget);
        if (input === null) return;

        const newVal = Number(input);
        if (!isNaN(newVal) && newVal >= 0) {
          state.teams[i].budget = Math.floor(newVal);
          renderTeams();
          renderBidButtons();
          renderResults();
          callAutoSave();
        }
      });
    }
  });
}

// ===============================
// Results (Live)
// ===============================
function renderResults() {
  if (!dom.results) return;
  dom.results.innerHTML = '';

  if (dom.btnToggleResults?.dataset.hidden === '1') return;

  // Team results
  const byTeam = new Map(
    state.teams.map((t, i) => [i, { teamName: t.name, players: [], spent: 0 }])
  );

  state.sales.forEach((sale) => {
    const teamData = byTeam.get(sale.teamIndex);
    if (teamData) {
      teamData.players.push(sale);
      teamData.spent += sale.price;
    }
  });

  byTeam.forEach((teamData, idx) => {
    const container = document.createElement('div');
    container.className = 'rounded-xl border border-slate-200 p-3 mb-4';

    const playerList = teamData.players.length === 0
      ? '<li class="text-slate-500 text-sm">No players yet</li>'
      : teamData.players
          .map((p) => `
            <li class="flex justify-between py-1">
              <span>
                ${p.playerName}
                <span class="text-xs text-slate-500">(${catLabel(p.category)})</span>
              </span>
              <span class="font-mono">₹ ${fmt(p.price)}</span>
            </li>
          `)
          .join('');

    container.innerHTML = `
      <div class="flex items-center justify-between mb-3 pb-2 border-b">
        <div class="font-semibold text-lg">${teamData.teamName}</div>
        <div class="text-sm text-slate-600 space-x-2">
          <span>Spent: <strong>₹ ${fmt(teamData.spent)}</strong></span>
          <span>•</span>
          <span>Left: <strong>₹ ${fmt(state.teams[idx]?.budget || 0)}</strong></span>
        </div>
      </div>
      <ul class="space-y-1 list-disc pl-5">${playerList}</ul>
    `;

    dom.results.appendChild(container);
  });

  // Unsold players section
  const unsoldSection = document.createElement('div');
  unsoldSection.className = 'rounded-xl border border-rose-300 p-4 bg-rose-50 mt-4';
  unsoldSection.innerHTML = `
    <h4 class="font-semibold text-rose-700 mb-3 text-lg">📋 UnSold Players</h4>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      ${state.pools.UNSOLD.length
        ? state.pools.UNSOLD
            .map((p) => `
              <div class="p-2 bg-white rounded-lg border shadow-sm">
                <div class="font-medium text-sm">${p.name}</div>
                <div class="text-xs text-slate-500">${p.position || 'N/A'}</div>
                <div class="text-xs font-mono">₹ ${fmt(p.basePrice)}</div>
              </div>
            `)
            .join('')
        : '<div class="col-span-full text-center py-8 text-slate-500">🎉 No unsold players!</div>'
      }
    </div>
  `;
  dom.results.appendChild(unsoldSection);
}

// ===============================
// Remaining Players
// ===============================
function renderRemain() {
  const pool = [
    ...(state.pools[state.category] || []),
    ...(state.skipped[state.category] || [])
  ];

  if (dom.remainCount) dom.remainCount.textContent = pool.length;
  if (dom.remainList) {
    dom.remainList.innerHTML = pool
      .map((p) => `
        <div class="rounded-lg border border-slate-200 p-3 bg-white hover:shadow-md transition-shadow">
          <div class="font-medium text-sm">${p.name}</div>
          <div class="text-xs text-slate-500">${p.position || ''}</div>
          <div class="text-xs font-mono mt-1">₹ ${fmt(p.basePrice)}</div>
        </div>
      `)
      .join('');
  }
}

// ===============================
// Current Player
// ===============================
function renderCurrent() {
  if (!state.current) {
    if (dom.currentPlayerCard) dom.currentPlayerCard.hidden = true;
    return;
  }

  if (dom.currentPlayerCard) dom.currentPlayerCard.hidden = false;

  const { player, category, bid } = state.current;

  // Player image
  if (dom.playerImg && player.img) {
    dom.playerImg.src = player.img;
    dom.playerImg.onerror = () => {
      dom.playerImg.src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop';
    };
  }

  // Player info
  if (dom.playerName) {
    dom.playerName.textContent = player.unsoldCount > 0
      ? `${player.name} (↓${player.unsoldCount})`
      : player.name;
  }

  if (dom.playerCat) dom.playerCat.textContent = catLabel(category);
  if (dom.playerPosition) dom.playerPosition.textContent = player.position || '';
  if (dom.playerBase) dom.playerBase.textContent = `₹ ${fmt(player.basePrice)}`;
  if (dom.currentBid) dom.currentBid.value = bid;

  // Timer display
  if (dom.countdown) {
    if (state.timer.running) {
      dom.countdown.textContent = `${state.timer.left}s`;
      dom.countdown.classList.toggle('blink', state.timer.left <= 10);
    } else {
      dom.countdown.textContent = '—';
      dom.countdown.classList.remove('blink');
    }
  }

  renderBidButtons();
  updateButtonStates();
  clearWarn();
}

// ===============================
// Bid Buttons (UPDATED VERSION)
// ===============================
function renderBidButtons() {
  if (!dom.bidTeamsContainer) return;
  dom.bidTeamsContainer.innerHTML = '';
  if (!state.current) return;

  const step = Math.max(25000, Number(dom.bidStepInput?.value) || 25000);
  const currentBid = state.current.bid;
  const hasBidder = state.current.bidder !== null;
  const currentBidder = state.current.bidder;

  state.teams.forEach((team, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    
    // Current bidder styling
    if (hasBidder && currentBidder === i) {
      btn.className = 'px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold shadow-lg transform scale-105';
      btn.textContent = `${team.name} (₹${fmt(currentBid)})`;
    } else {
      btn.className = 'px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-all duration-200';
      btn.textContent = team.name;
    }

    const nextBid = hasBidder ? currentBid + step : currentBid;
    if (nextBid > team.budget) {
      btn.disabled = true;
      btn.className += ' opacity-50 cursor-not-allowed';
      btn.title = `Insufficient budget (needs ₹${fmt(nextBid)}, has ₹${fmt(team.budget)})`;
    }

    btn.addEventListener('click', () => placeBid(i));
    dom.bidTeamsContainer.appendChild(btn);
  });
}

// ===============================
// Button states
// ===============================
function updateButtonStates() {
  const disable = state.timer.running;
  
  if (dom.btnNext) dom.btnNext.disabled = disable;
  if (dom.btnSkip) dom.btnSkip.disabled = disable;
  if (dom.btnSell) {
    dom.btnSell.disabled = !state.current || state.current.bidder === null;
  }
}

// ===============================
// Warning utilities (from util.js)
// ===============================
function clearWarn() {
  if (dom.warn) {
    dom.warn.textContent = '';
    dom.warn.classList.remove('blink');
  }
}
