const cron = require('node-cron');

async function fraudScan() {
    
}

// Schedule a task to run once every day at midnight (server time)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily fraud scan and report job...');
  try {
    await fraudScan();
    console.log('Fraud scan and report completed successfully.');
  } catch (error) {
    console.error('Error during fraud scan and report:', error);
  }
});
