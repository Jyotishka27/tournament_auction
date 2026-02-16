// YOUR UPDATED renderer.js + MISSING FUNCTIONS
// [Your complete renderer.js code here] + add these missing functions:

function renderBidButtons() {
  if (!dom.bidTeamsContainer) return;
  dom.bidTeamsContainer.innerHTML = '';
  if (!state.current) return;

  const step = Math.max(1, Number(dom.bidStepInput?.value) || 0);
  const currentBid = state.current.bid;
  const hasBidder = state.current.bidder !== null;

  state.teams.forEach((team, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = hasBidder && state.current.bidder === i 
      ? 'px-2 py-1 rounded-xl bg-green-600 text-white text-xs font-bold'
      : 'px-2 py-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs';
    btn.textContent = team.name;

    const nextBid = hasBidder ? currentBid + step : currentBid;
    if (nextBid > team.budget) {
      btn.disabled = true;
      btn.className += ' opacity-50 cursor-not-allowed';
    }

    btn.addEventListener('click', () => placeBid(i));
    dom.bidTeamsContainer.appendChild(btn);
  });
}

function updateButtonStates() {
  const disable = state.timer.running;
  if (dom.btnNext) dom.btnNext.disabled = disable;
  if (dom.btnSkip) dom.btnSkip.disabled = disable;
  if (dom.btnSell) dom.btnSell.disabled = !state.current || state.current.bidder === null;
}
