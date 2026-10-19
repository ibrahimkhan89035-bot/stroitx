# Backend Production Dockerfile
FROM node:18-alpine

WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && (node dist/cli/create-admin.js || npx ts-node src/cli/create-admin.ts || true) && node dist/server.js"]
