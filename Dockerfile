FROM node:20-alpine AS builder

WORKDIR /api-auth-user

COPY package*.json ./
RUN npm install --omit-dev

COPY . . 
RUN npm run build

FROM node:20-alpine

WORKDIR /api-auth-user

COPY package*.json ./
COPY --from=builder /api-auth-user/dist ./dist
COPY --from=builder /api-auth-user/node_modules ./node_modules

EXPOSE 3002

CMD ["node", "dist/main.js"]