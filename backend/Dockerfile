FROM node:22
WORKDIR /app
COPY package*.json ./

# Forzamos la instalación de todo el core + las dos rebeldes
RUN npm install
RUN npm install bcrypt jsonwebtoken

COPY . .
CMD ["npm", "run", "dev"]