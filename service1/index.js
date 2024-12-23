// const express = require('express');
// const axios = require('axios');

// const app = express();
// const PORT = 3001;

// // Simple endpoint
// app.get('/api/v1/hello', (req, res) => {
//   res.json({ message: 'Hello from Service 1' });
// });

// app.listen(PORT, async () => {
//   console.log(`Service 1 running on http://localhost:${PORT}`);

//   try {
//     // Auto-register the service with Kong Admin API
//     await axios.post('http://kong:8001/services', {
//       name: 'service1',
//       url: `http://service1:${PORT}`
//     });

//     await axios.post('http://kong:8001/routes', {
//       service: { name: 'service1' },
//       paths: ['/service1']
//     });

//     console.log('Service 1 registered with Kong');
//   } catch (err) {
//     console.error('Failed to register service with Kong', err.message);
//   }
// });

const express = require('express');
const app = express();

// Define multiple endpoints for Service1
app.get('/api/v1/endpoint1', (req, res) => {
  res.json({ message: 'Hello from Service 1 - Endpoint 1!' });
});

app.get('/api/v1/endpoint2', (req, res) => {
  res.json({ message: 'Hello from Service 1 - Endpoint 2!' });
});

app.get('/api/v1/endpoint3', (req, res) => {
  res.json({ message: 'Hello from Service 1 - Endpoint 3!' });
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Service 1 is running on port ${PORT}`);
});

