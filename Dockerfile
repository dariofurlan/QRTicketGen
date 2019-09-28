FROM node:11

WORKDIR /usr/src/qr-ticket/

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 8000

CMD ["node", "server.js"]
