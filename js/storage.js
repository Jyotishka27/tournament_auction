function autoSaveState() {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
      category: state.category,
      pools: state.pools,
      skipped: state.skipped,
      current: state.current,
      teams: state.teams,
      sales: state.sales,
      savedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Autosave failed:', e);
  }
}

function restoreAutoSavedState() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return false;

    const saved = JSON.parse(raw);
    Object.assign(state, saved, {
      timer: { handle: null, left: 0, running: false }
    });
    console.log('✅ Restored autosave');
    return true;
  } catch (e) {
    console.warn('Failed to restore autosave:', e);
    localStorage.removeItem(AUTOSAVE_KEY);
    return false;
  }
}

function callAutoSave() {
  autoSaveState();
}
