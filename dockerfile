# Étape 1: Construire l'application Angular
FROM node:16 AS build
WORKDIR /app
# Copier les fichiers package.json et package-lock.json
COPY package*.json ./
# Installer les dépendances
RUN npm install
# Copier le reste des fichiers de l'application
COPY . .
# Construire l'application pour la production
RUN npm run build --prod

# Étape 2: Servir l'application avec Nginx
FROM nginx:alpine
# Copier les fichiers construits à partir de l'étape 1
COPY --from=build /app/dist/miagenda /usr/share/nginx/html
# Copier la configuration Nginx si vous en avez une. Sinon, vous pouvez ignorer cette ligne.
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
