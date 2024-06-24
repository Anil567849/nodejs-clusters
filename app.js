// server-cluster-express.js
const cluster = require('cluster');
const express = require('express');
const axios = require('axios').default;
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers for each CPU core
  for (let i = 0; i < 4; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Optionally, restart the worker process here
    // cluster.fork();
  });
} else {
  // Create Worker process of each CPU
  const app = express();

  // Route to fetch data
  app.get('/', async (req, res) => {
    try {
      let arr = [];

      // Simulate fetching data multiple times (adjust as needed)
      for (let i = 0; i < 5; i++) {
        const { data } = await axios.get('https://jsonplaceholder.typicode.com/todos');
        arr.push(data);
      }
      console.log(`Worker ${process.pid} Resolved Query.`);
      return res.json(arr);
    } catch (error) {
      console.error('Error fetching data:', error);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

  // Start Express server
  const server = app.listen(8000, () => {
    console.log(`Worker ${process.pid} started. Listening on port 8000`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}
