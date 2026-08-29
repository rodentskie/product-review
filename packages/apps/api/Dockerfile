FROM node:22.18-alpine

WORKDIR /app

COPY dist .

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "main.js"]
