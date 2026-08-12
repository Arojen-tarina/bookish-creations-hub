# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first so Docker can cache them if package files do not change.
COPY package-lock.json package.json ./
RUN npm ci

# Copy the rest of the repository and build the app.
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Remove the default Nginx static files.
RUN rm -rf /usr/share/nginx/html/*

# Copy the built app into Nginx web root.
COPY --from=build /app/dist /usr/share/nginx/html

# Use a custom Nginx config that listens on the Cloud Run port.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the Cloud Run port.
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
