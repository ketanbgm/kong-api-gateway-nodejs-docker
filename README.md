# Kong Gateway with Docker and Microservices

## **How to Run**

### **Step 1: Create Docker Network**
Create a Docker network for all containers to communicate with each other:
```bash
docker network create kong-net
```

### **Step 2: Start Docker Containers**
Start all the Docker containers (Kong, Postgres, and microservices) using the following command:
```bash
docker-compose up -d
```

### **Step 3: Verify Containers Are Running**
Check if all containers are up and running:
```bash
docker ps
```
You should see the following services running:
- **Kong Gateway**
- **Postgres (Kong Database)**
- **Service 1**
- **Service 2**

### **Step 4: Verify Services Are Up**
You can check if the services are running correctly by visiting the following URLs in your browser or using `curl` commands:
- **Service 1**: [http://localhost:3001/api/v1/service1](http://localhost:3001/api/v1/service1)
- **Service 2**: [http://localhost:3002/api/v1/service2](http://localhost:3002/api/v1/service2)

If everything is running correctly, you should see the respective responses from Service 1 and Service 2.

---

## **Configure Kong Gateway**

Once the Kong Gateway is up, you can configure it to route requests to **Service 1** and **Service 2**.

### **1. Add a Service for Service 1**
Run the following command to register **Service 1** with Kong:
```bash
curl -i -X POST http://localhost:8001/services/ \
  --data 'name=service1' \
  --data 'url=http://service1:3001'
```

### **2. Add a Route for Service 1**
Create a route for **Service 1** to make it accessible via Kong:
```bash
curl -i -X POST http://localhost:8001/services/service1/routes \
  --data 'paths[]=/service1'
```

### **3. Add a Service for Service 2**
Run the following command to register **Service 2** with Kong:
```bash
curl -i -X POST http://localhost:8001/services/ \
  --data 'name=service2' \
  --data 'url=http://service2:3002'
```

### **4. Add a Route for Service 2**
Create a route for **Service 2** to make it accessible via Kong:
```bash
curl -i -X POST http://localhost:8001/services/service2/routes \
  --data 'paths[]=/service2'
```

---

## **Test the Kong Gateway**
Once the configuration is complete, you can test if the routing is working as expected.

### **Access Service 1 via Kong Gateway**
Run the following command to check if **Service 1** is accessible via the Kong Gateway:
```bash
curl http://localhost:8000/service1/api/v1/service1
```
**Expected Output:**
```json
{
  "message": "Hello from Service 1!"
}
```

### **Access Service 2 via Kong Gateway**
Run the following command to check if **Service 2** is accessible via the Kong Gateway:
```bash
curl http://localhost:8000/service2/api/v1/service2
```
**Expected Output:**
```json
{
  "message": "Hello from Service 2!"
}
```

---

## **File Structure**
```
.
├── docker-compose.yml    # Docker Compose file to set up services
├── service1              # Directory for Service 1 (Node.js service)
├── service2              # Directory for Service 2 (Node.js service)
└── README.md             # This README file
```

---

## **Notes**
- Make sure to update the `.gitignore` to exclude **node_modules**, **logs**, and other unnecessary files.
- If you need to clear Kong Gateway configuration, you may need to re-run the `kong migrations bootstrap` command.

---

## **Troubleshooting**

1. **Kong Gateway is unhealthy**:
   - Ensure the **Postgres database** is up and running before starting the Kong service.
   - Run `docker logs kong` to debug the issue.

2. **Kong configuration issues**:
   - If Kong does not recognize routes or services, check the Kong Admin API at [http://localhost:8001](http://localhost:8001).

3. **Connection issues with services**:
   - Check if the services are running using `docker ps`.
   - Make sure the services are accessible at their respective ports (3001 for **Service 1** and 3002 for **Service 2**).

4. **Changes to `docker-compose.yml` not reflecting**:
   - Run `docker-compose down` and `docker-compose up -d` to recreate the containers.

---

Happy coding! 🚀

