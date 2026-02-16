function fmt(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

function catLabel(cat) {
  return CATEGORY_LABELS[cat] || 'Unknown';
}

function applyUnsoldReduction(player) {
  player.unsoldCount = (player.unsoldCount || 0) + 1;
  player.basePrice = Math.max(
    Math.floor(player.basePrice * REDUCTION_FACTOR),
    MIN_PRICE
  );
}

function clearWarn() {
  const warnEl = document.getElementById('warn');
  if (warnEl) warnEl.textContent = '';
}

function showWarn(message) {
  const warnEl = document.getElementById('warn');
  if (warnEl) {
    warnEl.textContent = message;
    warnEl.classList.add('blink');
    setTimeout(() => warnEl.classList.remove('blink'), 3000);
  }
}
