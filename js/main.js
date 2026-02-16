(async function initAuction() {

  const restored = restoreAutoSavedState();
  if (!restored) cloneData();

  wireEvents();
  renderAll();
})();
