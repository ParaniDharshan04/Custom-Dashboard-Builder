export function sum(values) {
  return values.reduce((acc, val) => acc + (Number(val) || 0), 0);
}

export function avg(values) {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

export function count(values) {
  return values.length;
}
