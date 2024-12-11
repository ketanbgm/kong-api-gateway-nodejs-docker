// const express = require('express');
// const axios = require('axios');

// const app = express();
// const PORT = 3002;

// // Simple endpoint
// app.get('/api/v1/hello', (req, res) => {
//   res.json({ message: 'Hello from Service 2' });
// });

// app.listen(PORT, async () => {
//   console.log(`Service 2 running on http://localhost:${PORT}`);

//   try {
//     // Auto-register the service with Kong Admin API
//     await axios.post('http://kong:8001/services', {
//       name: 'service2',
//       url: `http://service2:${PORT}`
//     });

//     await axios.post('http://kong:8001/routes', {
//       service: { name: 'service2' },
//       paths: ['/service2']
//     });

//     console.log('Service 2 registered with Kong');
//   } catch (err) {
//     console.error('Failed to register service with Kong', err.message);
//   }
// });


const express = require('express');
const app = express();

app.get('/api/v1/service2', (req, res) => {
  res.json({ message: 'Hello from Service 2!' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Service 2 is running on port ${PORT}`);
});
