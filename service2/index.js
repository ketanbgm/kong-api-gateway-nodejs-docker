const express = require('express');
const qs = require('qs');

const axios = require('axios'); // Import axios
const app = express();

async function authenticateInternalToken(req, res, next) {
  console.log("req.route.path", req.route.path)
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Extract token
// client secret and client will be retirved from keycloak admin login in clients menu
  let data = qs.stringify({
    'token': `${token}`,
    'client_id': 'service2',
    'client_secret': 'T24MKTG6pYjkU5kRGU9rjMiIkH8xiLhW' 
  });
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://kong:8000/keycloak/realms/microservice/protocol/openid-connect/token/introspect',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
  
  await axios.request(config)
  .then((response) => {
    console.log(response.data);
    if(response.data.active){
      next();
    } else{
    res.json({ message: 'Invalid token' });
    }
  
    // req.user = user; // Attach user information to the request
  })
  .catch((error) => {
    console.log("🚀 ~ authenticateToken ~ error:", error)
    res.json({ message: 'Invalid token' });
  });
}

// Define multiple endpoints for Service2
app.get('/api/v1/endpoint1', (req, res) => {
  res.json({ message: 'Hello from Service 2 - Endpoint 1!' });
});

app.get('/api/v1/endpoint2', (req, res) => {
  res.json({ message: 'Hello from Service 2 - Endpoint 2!' });
});

app.get('/api/v1/endpoint3', (req, res) => {
  res.json({ message: 'Hello from Service 2 - Endpoint 3!' });
});

app.get('/api/v1/service2-endpoint', authenticateInternalToken, (req, res) => {
  res.json({ message: 'Hello from Service 2 - Endpoint 3!' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Service 2 is running on port ${PORT}`);
});
