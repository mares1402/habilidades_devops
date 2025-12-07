FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
# Crear un usuario de la aplicación y cambiar a él
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY . .
EXPOSE 4000
CMD ["node", "app.js"]
