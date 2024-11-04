
# Dockerfile for the React frontend
FROM node:16 AS build
WORKDIR /app
# Copy package.json and install dependencies
COPY ./MedTrack/package*.json /app/
RUN npm install
# Copy all the frontend source code
COPY ./MedTrack /app
# Build the React app
RUN npm run build
# Use nginx to serve the app
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 80 for the frontend
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]