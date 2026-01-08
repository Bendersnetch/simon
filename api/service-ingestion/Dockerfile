FROM node:20-alpine AS builder

WORKDIR /service-ingestion-bdd

COPY package*.json ./
RUN npm install --omit-dev

COPY . . 

RUN npm run test
RUN npm run test:e2e

RUN npm run build

FROM node:20-alpine

WORKDIR /service-ingestion-bdd

COPY package*.json ./
COPY --from=builder /service-ingestion-bdd/dist ./dist
COPY --from=builder /service-ingestion-bdd/node_modules ./node_modules

EXPOSE 3004

CMD ["node", "dist/main.js"]