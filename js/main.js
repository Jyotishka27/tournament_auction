(async function initAuction() {

  await loadAuctionData();   // Load base data first

  const restored = restoreAutoSavedState();  // Then restore if exists

  wireEvents();
  renderAll();

})();
