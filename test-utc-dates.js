// Test UTC date calculation
const testSelectedMonth = { year: 2025, month: 4 }; // April 2025

console.log('🔍 Testing UTC date calculation...\n');

// UTC calculation
const firstDay = new Date(Date.UTC(testSelectedMonth.year, testSelectedMonth.month - 1, 1)).toISOString().split('T')[0];
const lastDay = new Date(Date.UTC(testSelectedMonth.year, testSelectedMonth.month, 0)).toISOString().split('T')[0];

console.log('For April 2025 (month: 4) with UTC:');
console.log('First Day:', firstDay, '(should be 2025-04-01)');
console.log('Last Day:', lastDay, '(should be 2025-04-30)');

// Test March 2025
console.log('\n🔍 Testing March 2025 (month: 3) with UTC:');
const marchMonth = { year: 2025, month: 3 };
const marchFirst = new Date(Date.UTC(marchMonth.year, marchMonth.month - 1, 1)).toISOString().split('T')[0];
const marchLast = new Date(Date.UTC(marchMonth.year, marchMonth.month, 0)).toISOString().split('T')[0];

console.log('March First Day:', marchFirst, '(should be 2025-03-01)');
console.log('March Last Day:', marchLast, '(should be 2025-03-31)');

// Test filtering logic
const marchDate = '2025-03-15';
const aprilDate = '2025-04-15';

console.log('\n🧪 Testing filtering logic:');
console.log(`March date (${marchDate}) in April range:`);
console.log(`${marchDate} >= ${firstDay}:`, marchDate >= firstDay);
console.log(`${marchDate} <= ${lastDay}:`, marchDate <= lastDay);
console.log(`Should include: ${marchDate >= firstDay && marchDate <= lastDay}`);

console.log(`\nApril date (${aprilDate}) in April range:`);
console.log(`${aprilDate} >= ${firstDay}:`, aprilDate >= firstDay);
console.log(`${aprilDate} <= ${lastDay}:`, aprilDate <= lastDay);
console.log(`Should include: ${aprilDate >= firstDay && aprilDate <= lastDay}`);
