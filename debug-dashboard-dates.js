// Debug script to check Dashboard date filtering
const testSelectedMonth = { year: 2025, month: 4 }; // April 2025

console.log('🔍 Testing Dashboard date filtering...\n');

// Test different interpretations
console.log('=== If selectedMonth.month is 1-based (April = 4) ===');
const firstDay1 = new Date(testSelectedMonth.year, testSelectedMonth.month - 1, 1).toISOString().split('T')[0];
const lastDay1 = new Date(testSelectedMonth.year, testSelectedMonth.month, 0).toISOString().split('T')[0];

console.log('=== If selectedMonth.month is 0-based (April = 3) ===');
const firstDay2 = new Date(testSelectedMonth.year, testSelectedMonth.month, 1).toISOString().split('T')[0];
const lastDay2 = new Date(testSelectedMonth.year, testSelectedMonth.month + 1, 0).toISOString().split('T')[0];

console.log('1-based calculation:');
console.log('First Day:', firstDay1);
console.log('Last Day:', lastDay1);

console.log('\n0-based calculation:');
console.log('First Day:', firstDay2);
console.log('Last Day:', lastDay2);

// Use the 1-based version (which should be correct)
const firstDay = firstDay1;
const lastDay = lastDay1;

console.log('Selected Month:', testSelectedMonth);
console.log('First Day:', firstDay);
console.log('Last Day:', lastDay);

// Test with March data
const marchDate = '2025-03-15';
console.log(`\nMarch date (${marchDate}) should be filtered out for April:`);
console.log(`${marchDate} >= ${firstDay}:`, marchDate >= firstDay);
console.log(`${marchDate} <= ${lastDay}:`, marchDate <= lastDay);
console.log(`Should include: ${marchDate >= firstDay && marchDate <= lastDay}`);

// Test with actual April date
const aprilDate = '2025-04-15';
console.log(`\nApril date (${aprilDate}) should be included for April:`);
console.log(`${aprilDate} >= ${firstDay}:`, aprilDate >= firstDay);
console.log(`${aprilDate} <= ${lastDay}:`, aprilDate <= lastDay);
console.log(`Should include: ${aprilDate >= firstDay && aprilDate <= lastDay}`);

console.log('\n🎯 If March data is showing in April, there might be:');
console.log('1. Issue with selectedMonth context');
console.log('2. Database query not filtering correctly');
console.log('3. Date parsing issue');
