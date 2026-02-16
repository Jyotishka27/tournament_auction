// Make AUCTION_DATA globally available
let AUCTION_DATA = null;

async function loadAuctionData() {
  try {
    const response = await fetch('./data/auction-data.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load auction data`);
    }

    AUCTION_DATA = await response.json();
    console.log('✅ Loaded auction data:', AUCTION_DATA);

    // FIXED: Transform YOUR JSON structure to match app needs
    Object.keys(AUCTION_DATA.players).forEach(category => {
      state.pools[category] = [...AUCTION_DATA.players[category]];
    });

    // Use YOUR captains as teams
    state.teams = AUCTION_DATA.captains.map(captain => ({
      name: captain.name,
      budget: captain.budget
    }));

    state.category = 'X';
    
    // Initialize skipped pools
    state.skipped = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };

    // Reset runtime
    state.sales = [];
    state.current = null;
    state.timer = { handle: null, left: 0, running: false };

    console.log('✅ Auction state initialized with your data');
  } catch (err) {
    console.error('❌ Auction data load error:', err);
    alert('⚠️ Failed to load auction data. Check data/auction-data.json');
    
    // Fallback with your captains
    state.teams = [
      { name: "Aakash Singh", budget: 3000000 },
      { name: "Ankit Aich", budget: 3000000 }
    ];
    state.pools = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };
    state.skipped = { X: [], P: [], A: [], B: [], C: [], UNSOLD: [] };
  }
}

function findPlayerInMaster(id, cat) {
  return (AUCTION_DATA?.players?.[cat] || []).find(p => p.id === id) || null;
}

// Export functions (unchanged)
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

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `auction-state-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}
