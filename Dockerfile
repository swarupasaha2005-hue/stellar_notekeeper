# Build stage
FROM node:20-alpine AS build

# Set working directory for the frontend
WORKDIR /app/frontend

# Copy frontend package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the Vite application
RUN npm run build

# Serve stage using Nginx
FROM nginx:alpine

# Copy built assets from the build stage to Nginx directory
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
