#build avec node:20-alpine pour construire l'application React
FROM node:20-alpine AS build 

#indique le répertoire de travail dans le conteneur
WORKDIR /app

#Copie les fichiers package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./ 

#Installe les dépendances de l'application
RUN npm install

#Copie tous les fichiers du projet dans le répertoire de travail
COPY . .

#Construit l'application React pour la production
RUN npm run build

#Utilise l'image nginx:alpine pour servir l'application construite
FROM nginx:alpine

#Copie les fichiers construits depuis l'étape de build vers le répertoire par défaut de nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

#Démarre le serveur nginx
CMD ["nginx", "-g", "daemon off;"]
