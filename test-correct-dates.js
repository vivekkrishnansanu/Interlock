// Test the correct date calculation
const testSelectedMonth = { year: 2025, month: 4 }; // April 2025

console.log('🔍 Testing CORRECT date calculation...\n');

// Correct calculation for April 2025
// month: 4 (1-based) = April
// Date constructor expects 0-based months, so April = 3
const correctFirstDay = new Date(testSelectedMonth.year, testSelectedMonth.month - 1, 1).toISOString().split('T')[0];
const correctLastDay = new Date(testSelectedMonth.year, testSelectedMonth.month, 0).toISOString().split('T')[0];

console.log('For April 2025 (month: 4):');
console.log('First Day:', correctFirstDay, '(should be 2025-04-01)');
console.log('Last Day:', correctLastDay, '(should be 2025-04-30)');

// Let's debug step by step
console.log('\n🔧 Step by step:');
console.log('selectedMonth.year:', testSelectedMonth.year);
console.log('selectedMonth.month:', testSelectedMonth.month, '(1-based)');
console.log('selectedMonth.month - 1:', testSelectedMonth.month - 1, '(0-based for Date constructor)');

const firstDayDate = new Date(testSelectedMonth.year, testSelectedMonth.month - 1, 1);
const lastDayDate = new Date(testSelectedMonth.year, testSelectedMonth.month, 0);

console.log('First day Date object:', firstDayDate);
console.log('Last day Date object:', lastDayDate);

// Test with March 2025
console.log('\n🔍 Testing March 2025 (month: 3):');
const marchMonth = { year: 2025, month: 3 };
const marchFirst = new Date(marchMonth.year, marchMonth.month - 1, 1).toISOString().split('T')[0];
const marchLast = new Date(marchMonth.year, marchMonth.month, 0).toISOString().split('T')[0];

console.log('March First Day:', marchFirst, '(should be 2025-03-01)');
console.log('March Last Day:', marchLast, '(should be 2025-03-31)');
