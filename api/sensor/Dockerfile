FROM node:20-alpine AS builder

WORKDIR /api-sensor-data

COPY package*.json ./
RUN npm install --omit-dev

COPY . . 
RUN npm run build

FROM node:20-alpine

WORKDIR /api-sensor-data

COPY package*.json ./
COPY --from=builder /api-sensor-data/dist ./dist
COPY --from=builder /api-sensor-data/node_modules ./node_modules

EXPOSE 3006

CMD ["node", "dist/main.js"]