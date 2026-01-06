FROM node:20-alpine AS builder

WORKDIR /api-ingestion

COPY package*.json ./
RUN npm install --omit-dev

COPY . . 
RUN npm run build

FROM node:20-alpine

WORKDIR /api-ingestion

COPY package*.json ./
COPY --from=builder /api-ingestion/dist ./dist
COPY --from=builder /api-ingestion/node_modules ./node_modules

EXPOSE 3003

CMD ["node", "dist/main.js"]
