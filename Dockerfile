FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install npm dependencies
RUN npm install


# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the Node.js application will run
EXPOSE 6

# Command to start the Node.js application
CMD ["node", "index.js"]
