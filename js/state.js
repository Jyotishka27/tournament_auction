function cloneData() {
  // Deep clone base pools from config
  state.pools = JSON.parse(JSON.stringify(BASE_POOLS));

  // Reset other runtime values
  state.skipped = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };
  state.category = 'X';
  state.current = null;
  state.sales = [];
  state.timer = { handle: null, left: 0, running: false };

  // Clone base teams from config
  state.teams = JSON.parse(JSON.stringify(BASE_TEAMS));
}
