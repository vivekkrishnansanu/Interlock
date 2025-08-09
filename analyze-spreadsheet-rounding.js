// Analyze the spreadsheet's rounding logic

console.log('🔍 Analyzing spreadsheet rounding logic...\n');

// Spreadsheet data from RAVI KAMMARI
const spreadsheetData = {
  rates: {
    nt: 0.625,
    rot: 0.719, 
    hot: 0.863
  },
  sampleCalculations: [
    // March 1: NT=5, ROT=5.034, HOT=0
    { date: '2025-03-01', nt: 5.0, rot: 5.034, hot: 0.0 },
    // March 3: NT=5, ROT=2.158, HOT=0  
    { date: '2025-03-03', nt: 5.0, rot: 2.158, hot: 0.0 },
    // March 5: NT=5, ROT=0, HOT=0
    { date: '2025-03-05', nt: 5.0, rot: 0.0, hot: 0.0 }
  ]
};

console.log('📊 Spreadsheet Rates:');
console.log(`   NT Rate: ${spreadsheetData.rates.nt}`);
console.log(`   ROT Rate: ${spreadsheetData.rates.rot}`);
console.log(`   HOT Rate: ${spreadsheetData.rates.hot}\n`);

console.log('🧮 Detailed Calculation Analysis:\n');

spreadsheetData.sampleCalculations.forEach(day => {
  console.log(`📅 ${day.date}:`);
  console.log(`   Hours: NT=${day.nt}, ROT=${day.rot}, HOT=${day.hot}`);
  
  // Raw calculations (no rounding)
  const rawNT = day.nt * spreadsheetData.rates.nt;
  const rawROT = day.rot * spreadsheetData.rates.rot;
  const rawHOT = day.hot * spreadsheetData.rates.hot;
  const rawTotal = rawNT + rawROT + rawHOT;
  
  console.log(`   Raw Calculations:`);
  console.log(`     NT: ${day.nt} × ${spreadsheetData.rates.nt} = ${rawNT.toFixed(6)}`);
  console.log(`     ROT: ${day.rot} × ${spreadsheetData.rates.rot} = ${rawROT.toFixed(6)}`);
  console.log(`     HOT: ${day.hot} × ${spreadsheetData.rates.hot} = ${rawHOT.toFixed(6)}`);
  console.log(`     Total: ${rawTotal.toFixed(6)}`);
  
  // Test different rounding strategies
  console.log(`   Rounding Tests:`);
  
  // Strategy 1: Round each component to 3 decimal places
  const round3NT = Math.round(rawNT * 1000) / 1000;
  const round3ROT = Math.round(rawROT * 1000) / 1000;
  const round3HOT = Math.round(rawHOT * 1000) / 1000;
  const round3Total = round3NT + round3ROT + round3HOT;
  console.log(`     3-decimal: NT=${round3NT.toFixed(3)}, ROT=${round3ROT.toFixed(3)}, HOT=${round3HOT.toFixed(3)}, Total=${round3Total.toFixed(3)}`);
  
  // Strategy 2: Round each component to 2 decimal places
  const round2NT = Math.round(rawNT * 100) / 100;
  const round2ROT = Math.round(rawROT * 100) / 100;
  const round2HOT = Math.round(rawHOT * 100) / 100;
  const round2Total = round2NT + round2ROT + round2HOT;
  console.log(`     2-decimal: NT=${round2NT.toFixed(3)}, ROT=${round2ROT.toFixed(3)}, HOT=${round2HOT.toFixed(3)}, Total=${round2Total.toFixed(3)}`);
  
  // Strategy 3: Round total only to 3 decimal places
  const totalRound3 = Math.round(rawTotal * 1000) / 1000;
  console.log(`     Total-only-3: ${totalRound3.toFixed(3)}`);
  
  // Strategy 4: No rounding (full precision)
  console.log(`     No-rounding: ${rawTotal.toFixed(3)}`);
  
  console.log('');
});

// Analyze what the expected values should be
console.log('🎯 Expected Results (from verification):');
console.log('   March 1: Manual=6.744, System=6.772 (diff=0.028)');
console.log('   March 3: Manual=4.677, System=4.705 (diff=0.028)');
console.log('   March 5: Manual=3.125, System=3.150 (diff=0.025)');

console.log('\n💡 Analysis:');
console.log('   The spreadsheet likely uses 3-decimal precision for final totals');
console.log('   System difference suggests database rates are rounded (0.625→0.63, 0.719→0.72)');
console.log('   Need to implement proper rounding in wage calculator');
