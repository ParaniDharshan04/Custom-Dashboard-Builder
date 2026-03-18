export function formatCurrency(value, precision = 2) {
  const num = Number(value) || 0;
  return `$${num.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatNumber(value, precision = 0) {
  const num = Number(value) || 0;
  return num.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function truncateUUID(uuid) {
  if (!uuid) return '';
  return uuid.substring(0, 8) + '...';
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
