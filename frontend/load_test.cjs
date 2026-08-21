const autocannon = require('autocannon');

console.log('🚀 Starting Baseline/Load Test...');
console.log('👥 Virtual Users: 100');
console.log('⏱️  Duration: 1 minute');
console.log('🔗 Target: http://localhost:5173\n');
console.log('Sending thousands of requests to measure Requests per second (RPS) and Response Time...\n');

const instance = autocannon({
  url: 'http://localhost:5173',
  connections: 100, // 100 virtual users
  duration: 60,     // 1 minute
}, (err, result) => {
  if (err) {
    console.error('\n❌ ERROR: Failed to complete the load test.');
    console.error(err);
    return;
  }
  
  console.log('\n======================================================');
  console.log('📊 LOAD TEST RESULTS');
  console.log('======================================================\n');
  
  console.log('What you will see');
  console.log('Requests per second (RPS)');
  console.log(`Example:\n${Math.round(result.requests.average)} req/sec`);
  console.log(`Meaning your API is handling about ${Math.round(result.requests.average)} requests every second.`);
  console.log('________________________________________\n');
  
  console.log('Response Time');
  console.log('Example:');
  console.log(`Average: ${result.latency.average}ms`);
  console.log(`Min: ${result.latency.min}ms`);
  console.log(`Max: ${result.latency.max}ms`);
  console.log('\nMeaning:');
  console.log(`• Fastest response = ${result.latency.min}ms`);
  console.log(`• Average = ${result.latency.average}ms`);
  console.log(`• Slowest = ${result.latency.max >= 1000 ? (result.latency.max / 1000).toFixed(1) + 's' : result.latency.max + 'ms'}`);
  console.log('\n======================================================\n');
});

// Provide progress feedback while it runs
autocannon.track(instance, { renderProgressBar: true });

instance.on('error', (err) => {
  console.error('\n❌ Connection Error! Make sure your server (e.g., Vite/API) is running at http://localhost:5173');
});
