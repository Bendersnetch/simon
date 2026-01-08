# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS builder

WORKDIR /api-gateway-client

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit-dev

COPY . . 

RUN npm run test
RUN npm run test:e2e

RUN npm run build

FROM node:20-alpine

WORKDIR /api-gateway-client

COPY package*.json ./
COPY --from=builder /api-gateway-client/dist ./dist
COPY --from=builder /api-gateway-client/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]