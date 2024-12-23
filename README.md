Here's a sample `README.md` file for your setup:

---

# Kong API Gateway with Keycloak, MySQL, PostgreSQL, and Microservices

This project uses Docker Compose to set up a Kong API Gateway with Keycloak as an identity provider, MySQL and PostgreSQL databases, and two microservices for load balancing.

## Services Overview

- **Keycloak**: Provides identity and access management for the APIs.
- **MySQL Database for Keycloak**: Stores Keycloak data.
- **PostgreSQL Database for Kong**: Stores Kong configuration and API data.
- **Kong Gateway**: The API Gateway for routing and load balancing.
- **Service1**: A Node.js microservice with two instances.
- **Service2**: Another Node.js microservice with two instances.

## Prerequisites

- Docker and Docker Compose installed on your machine.
- Basic understanding of Docker, API Gateway, and Microservices.

## Project Structure

```plaintext
.
├── docker-compose.yml           # Docker Compose configuration
├── service1/                    # Service 1 source code
│   ├── index.js                 # Main application file for Service 1
├── service2/                    # Service 2 source code
│   ├── index.js                 # Main application file for Service 2
```

## Getting Started

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Start the Docker Containers**:

   Run the following command to bring up all the services:

   ```bash
   docker-compose up -d
   ```

   This will start the following containers:
   - `keycloak-db`: MySQL database for Keycloak.
   - `keycloak`: Keycloak identity provider.
   - `kong-db`: PostgreSQL database for Kong.
   - `kong-migrations`: Initializes Kong database migrations.
   - `kong-ce`: Kong Gateway for API routing and load balancing.
   - `service1-1`, `service1-2`: Instances of Service 1.
   - `service2-1`, `service2-2`: Instances of Service 2.

3. **Verify the Services**:

   Check that the containers are running correctly:

   ```bash
   docker ps
   ```

   You should see the following services running:
   - `keycloak-db`
   - `keycloak`
   - `kong-db`
   - `kong-migrations`
   - `kong-ce`
   - `service1-1`, `service1-2`
   - `service2-1`, `service2-2`

4. **Configure Kong Gateway**:

   - **Create Upstreams for Service1 and Service2**:

     Create upstreams for `service1` and `service2`:

     ```bash
     curl -i -X POST http://localhost:8001/upstreams --data "name=service1-upstream"
     curl -i -X POST http://localhost:8001/upstreams --data "name=service2-upstream"
     ```

   - **Add Instances to Upstreams**:

     Add both instances for each service to their respective upstreams:

     ```bash
     curl -i -X POST http://localhost:8001/upstreams/service1-upstream/targets --data "target=service1-1:3001"
     curl -i -X POST http://localhost:8001/upstreams/service1-upstream/targets --data "target=service1-2:3001"

     curl -i -X POST http://localhost:8001/upstreams/service2-upstream/targets --data "target=service2-1:3002"
     curl -i -X POST http://localhost:8001/upstreams/service2-upstream/targets --data "target=service2-2:3002"
     ```

   - **Create Routes for Service1 and Service2**:

     Create routes for `service1` and `service2` to forward traffic:

     ```bash
     curl -i -X POST http://localhost:8001/services --data "name=service1" --data "url=http://service1-upstream"
     curl -i -X POST http://localhost:8001/services/service1/routes --data "paths[]=/service1"

     curl -i -X POST http://localhost:8001/services --data "name=service2" --data "url=http://service2-upstream"
     curl -i -X POST http://localhost:8001/services/service2/routes --data "paths[]=/service2"
     ```

5. **Test Load Balancing**:

   Test the load balancing for `service1`:

   ```bash
   curl http://localhost:8000/service1/api/v1/endpoint1
   curl http://localhost:8000/service1/api/v1/endpoint2
   curl http://localhost:8000/service1/api/v1/endpoint3
   ```

   Test the load balancing for `service2`:

   ```bash
   curl http://localhost:8000/service2/api/v1/endpoint1
   curl http://localhost:8000/service2/api/v1/endpoint2
   curl http://localhost:8000/service2/api/v1/endpoint3
   ```

6. **Shut Down the Services**:

   To shut down the services, run:

   ```bash
   docker-compose down
   ```

## Custom Configuration

- **Keycloak**: You can configure Keycloak through the `KC_DB`, `KC_DB_URL`, `KC_DB_USERNAME`, and `KC_DB_PASSWORD` environment variables.
- **Kong Gateway**: Kong's configuration is controlled via environment variables like `KONG_DATABASE`, `KONG_PG_HOST`, `KONG_PROXY_LISTEN`, and others.
  
## Troubleshooting

- **Healthcheck Failures**: If any services fail their health checks, check the logs for more details:

  ```bash
  docker-compose logs <service-name>
  ```

- **Kong Gateway Not Responding**: Ensure that the Kong database (`kong-db`) is fully initialized before starting the gateway (`kong-ce`).


## Kong Proxy for Keycloak API

---

## 1️⃣ Configure Kong to Proxy Keycloak API

### 1. Add Keycloak as a Service

First, we need to register Keycloak as a service in Kong.

```bash
curl --location --request POST 'http://localhost:8001/services/' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "keycloak-service",
  "url": "http://keycloak:8080"
}'
```

**Explanation:**
- `name`: The name of the service in Kong (keycloak-service).
- `url`: The URL of Keycloak, running at `http://keycloak:8080`.

---

### 2. Create a Route for the Keycloak Service

Next, create a route to expose Keycloak’s API via Kong.

```bash
curl --location --request POST 'http://localhost:8001/services/keycloak-service/routes' \
--header 'Content-Type: application/json' \
--data-raw '{
  "paths": ["/keycloak"]
}'
```

**Explanation:**
- `paths`: Defines the path where the Keycloak API will be accessible via Kong. For example, `http://localhost:8000/keycloak/`.

After this step, any request to `http://localhost:8000/keycloak/` will be routed to Keycloak at `http://keycloak:8080/`.

---

### 3. Verify Keycloak Proxy

To verify if Kong is correctly proxying the Keycloak service, run the following command:

```bash
curl --location --request GET 'http://localhost:8000/keycloak/realms/master/'
```

If successful, you should receive Keycloak’s realm information.

---

## 2️⃣ Add a User via Keycloak API through Kong

Now that Kong is exposing Keycloak's API, we can add a user by making a POST request to Kong.

### 1. Get Admin Token (via Kong)

To get an admin token from Keycloak via Kong, use the following request:

```bash
curl --location --request POST 'http://localhost:8000/keycloak/realms/master/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=admin-cli' \
--data-urlencode 'username=admin' \
--data-urlencode 'password=admin' \
--data-urlencode 'grant_type=password'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "6a2b...",
  "scope": "email profile"
}
```

---

### 2. Create a User via Kong

Use the access token obtained in the previous step to create a user via Kong:

```bash
curl --location --request POST 'http://localhost:8000/keycloak/admin/realms/master/users' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {access_token}' \
--data-raw '{
  "username": "testuser",
  "email": "testuser@example.com",
  "firstName": "Test",
  "lastName": "User",
  "enabled": true,
  "credentials": [
    {
      "type": "password",
      "value": "Test@123",
      "temporary": false
    }
  ]
}'
```

**Parameters:**
- Replace `{access_token}` with the actual access token obtained from the previous step.
- This will create a user named `testuser` with the password `Test@123`.

---

## 3️⃣ Authenticate User via Keycloak (via Kong)

To authenticate a user, request a token using their username and password.

### Request:

```bash
curl --location --request POST 'http://localhost:8000/keycloak/realms/master/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=admin-cli' \
--data-urlencode 'username=testuser' \
--data-urlencode 'password=Test@123' \
--data-urlencode 'grant_type=password'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "6a2b...",
  "scope": "email profile"
}
```

---

## 4️⃣ Add Security Plugins (Optional)

You can add additional layers of security to Keycloak's API using Kong plugins, such as JWT validation and rate limiting.

### 1. JWT Validation Plugin

To apply the JWT validation plugin:

```bash
curl --location --request POST 'http://localhost:8001/services/keycloak-service/plugins' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "jwt",
  "config": {
    "secret_is_base64": false,
    "claims_to_verify": ["exp"]
  }
}'
```

---

### 2. Rate Limiting Plugin

To apply the rate limiting plugin:

```bash
curl --location --request POST 'http://localhost:8001/services/keycloak-service/plugins' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "rate-limiting",
  "config": {
    "minute": 10
  }
}'
```

This configuration limits requests to 10 per minute for the Keycloak service.

---




## Notes

- This setup uses **Docker Compose** version 2.1 to manage all services.
- **Load balancing** is achieved via Kong using the **round-robin** or **least_conn** strategy.
  
---

Feel free to modify the instructions based on your specific project setup.