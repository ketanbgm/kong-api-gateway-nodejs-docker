# Use the official Node.js image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy application files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application files
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
