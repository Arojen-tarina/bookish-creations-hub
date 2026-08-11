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

# Expose HTTP port.
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
