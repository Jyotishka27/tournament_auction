(async function initAuction() {
  console.log('🚀 Initializing Football Auctioneer...');
  
  // 1. Load data
  await loadAuctionData();
  
  // 2. Ensure state structure
  if (!state.skipped) {
    state.skipped = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };
  }
  
  // 3. Restore autosave
  restoreAutoSavedState();
  
  // 4. Wire UI
  wireEvents();
  
  // 5. First render
  renderAll();
  
  // 6. Multi-tab sync
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel('auction_updates');
    channel.addEventListener('message', (e) => {
      state.sales = e.data.sales || state.sales;
      state.teams.forEach((team, i) => {
        team.budget = e.data.budgets?.[i] || team.budget;
      });
      renderAll();
    });
  }
  
  // 7. Periodic autosave
  setInterval(autoSaveState, 30000); // 30s
  
  console.log('✅ Auctioneer ready!');
})();
