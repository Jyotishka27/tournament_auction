async function loadAuctionData() {
  try {
    const response = await fetch('./data/auction-data.json');
    if (!response.ok) {
      throw new Error('Failed to load auction data');
    }

    const data = await response.json();

    // Initialize with proper structure
    state.pools = data.pools || { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };
    state.teams = data.teams || [];
    state.category = data.category || 'X';
    
    // CRITICAL: Initialize skipped pools
    state.skipped = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };

    // Reset runtime
    state.sales = [];
    state.current = null;
    state.timer = { handle: null, left: 0, running: false };

    console.log('✅ Auction data loaded successfully');
  } catch (err) {
    console.error('❌ Auction data load error:', err);
    alert('⚠️ Using fallback state - please check auction-data.json');
    
    // Fallback
    state.pools = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };
    state.skipped = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };
    state.category = 'X';
    state.teams = [];
  }
}

function exportCSV() {
  const rows = [];

  state.teams.forEach((team, idx) => {
    rows.push([`Team: ${team.name}`, '', '', '', '']);
    rows.push(['Time', 'Player', 'Category', 'Position', 'Price']);

    const teamSales = state.sales.filter(s => s.teamIndex === idx);
    teamSales.forEach(sale => {
      rows.push([
        sale.timeISO,
        sale.playerName,
        catLabel(sale.category),
        sale.position || '',
        String(sale.price)
      ]);
    });

    rows.push([]); 
  });

  const csvContent = rows
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `auction-results-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

function saveState() {
  const snapshot = {
    state: {
      category: state.category,
      pools: state.pools,
      skipped: state.skipped,
      current: state.current,
      teams: state.teams,
      sales: state.sales
    },
    savedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: 'application/json'
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `auction-state-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}
