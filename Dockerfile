# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS builder

WORKDIR /api-capteur

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /api-capteur

COPY package*.json ./
COPY --from=builder /api-capteur/dist ./dist
COPY --from=builder /api-capteur/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]