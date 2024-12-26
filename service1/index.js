const express = require('express');
const qs = require('qs');

const axios = require('axios'); // Import axios

const app = express();


// Middleware to verify the token
async function authenticateToken(req, res, next) {
  console.log("req.route.path", req.route.path)
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Extract token
// client secret and client will be retirved from keycloak admin login in clients menu
  let data = qs.stringify({
    'token': `${token}`,
    'client_id': 'demo_client',
    'client_secret': 'JPJmLL3VEQQqEBIW9fSrlKkEzUSSE5B3' 
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


// Define multiple endpoints for Service1
app.get('/api/v1/endpoint1', authenticateToken, (req, res) => {
  res.json({ message: 'Hello from Service 1 - Endpoint 1!' });
});

app.get('/api/v1/endpoint2', (req, res) => {
  res.json({ message: 'Hello from Service 1 - Endpoint 2!' });
});

app.get('/api/v1/endpoint3', (req, res) => {
  res.json({ message: 'Hello from Service 1 - Endpoint 3!' });
});

app.get('/api/v1/callService2Endpoint', async (req, res) => {
  try {
      // Step 1: Get the token from Keycloak
      const data = qs.stringify({
          'client_id': 'service2',
    'client_secret': 'T24MKTG6pYjkU5kRGU9rjMiIkH8xiLhW',
          'grant_type': 'client_credentials'
      });

      const configForToken = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'http://kong:8000/keycloak/realms/microservice/protocol/openid-connect/token',
          headers: { 
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: data
      };

      const tokenResponse = await axios.request(configForToken);
      const token = tokenResponse.data.access_token;
      // console.log("🚀 ~ app.get ~ token:", token)

      // Step 2: Use the token to call Service 2
      const configForService2 = {
          method: 'get',
          url: 'http://kong:8000/service2/api/v1/service2-endpoint',
          headers: {
              Authorization: `Bearer ${token}`
          }
      };

      const service2Response = await axios.request(configForService2);

      // Step 3: Send the response back to the client
      console.log(JSON.stringify(service2Response.data));
      res.json({ message: 'Hello from Service 2!', data: service2Response.data });
  } catch (error) {
      // console.log("🚀 ~ app.get ~ error:", error)
      console.error('Error:1111', error.message);
      res.status(500).json({ error: 'Failed to call Service 2' });
  }
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Service 1 is running on port ${PORT}`);
});


