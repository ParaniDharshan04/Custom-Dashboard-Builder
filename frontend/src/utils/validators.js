export function isValidHex(color) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPositiveNumber(val) {
  return Number(val) > 0;
}

export const PRODUCTS = [
  'Fiber Internet 300 Mbps',
  '5G Unlimited Mobile Plan',
  'Fiber Internet 1 Gbps',
  'Business Internet 500 Mbps',
  'VoIP Corporate Package',
];

export const COUNTRIES = [
  { label: 'United States', value: 'US' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Hong Kong', value: 'HongKong' },
];

export const STATUSES = ['Pending', 'In progress', 'Completed'];

export const CREATED_BY = [
  'Mr. Michael Harris',
  'Mr. Ryan Cooper',
  'Ms. Olivia Carter',
  'Mr. Lucas Martin',
];

export const PRODUCT_PRICES = {
  'Fiber Internet 300 Mbps': 49.99,
  '5G Unlimited Mobile Plan': 39.99,
  'Fiber Internet 1 Gbps': 89.99,
  'Business Internet 500 Mbps': 129.99,
  'VoIP Corporate Package': 199.99,
};

export const DATE_RANGE_OPTIONS = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last_7' },
  { label: 'Last 30 Days', value: 'last_30' },
  { label: 'Last 90 Days', value: 'last_90' },
];

export const METRIC_OPTIONS = [
  { label: 'Customer ID', value: 'id' },
  { label: 'Customer name', value: 'first_name' },
  { label: 'Email id', value: 'email' },
  { label: 'Address', value: 'street_address' },
  { label: 'Order date', value: 'order_date' },
  { label: 'Product', value: 'product' },
  { label: 'Created by', value: 'created_by' },
  { label: 'Status', value: 'status' },
  { label: 'Total amount', value: 'total_amount' },
  { label: 'Unit price', value: 'unit_price' },
  { label: 'Quantity', value: 'quantity' },
];

export const NUMERIC_METRICS = ['total_amount', 'unit_price', 'quantity'];

export const CHART_AXIS_OPTIONS = [
  { label: 'Product', value: 'product' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Unit price', value: 'unit_price' },
  { label: 'Total amount', value: 'total_amount' },
  { label: 'Status', value: 'status' },
  { label: 'Created by', value: 'created_by' },
  { label: 'Country', value: 'country' },
  { label: 'Duration', value: 'duration' },
];

export const PIE_DATA_OPTIONS = [
  { label: 'Product', value: 'product' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Unit price', value: 'unit_price' },
  { label: 'Total amount', value: 'total_amount' },
  { label: 'Status', value: 'status' },
  { label: 'Created by', value: 'created_by' },
];

export const TABLE_COLUMN_OPTIONS = [
  { label: 'Customer ID', value: 'id' },
  { label: 'Customer name', value: 'customer_name' },
  { label: 'Email id', value: 'email' },
  { label: 'Phone number', value: 'phone_number' },
  { label: 'Address', value: 'address' },
  { label: 'Order ID', value: 'id' },
  { label: 'Order date', value: 'order_date' },
  { label: 'Product', value: 'product' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Unit price', value: 'unit_price' },
  { label: 'Total amount', value: 'total_amount' },
  { label: 'Status', value: 'status' },
  { label: 'Created by', value: 'created_by' },
];

export const FILTER_OPERATORS = [
  { label: 'Equals', value: 'equals' },
  { label: 'Not equals', value: 'not equals' },
  { label: 'Contains', value: 'contains' },
  { label: 'Greater than', value: 'greater than' },
  { label: 'Less than', value: 'less than' },
];
