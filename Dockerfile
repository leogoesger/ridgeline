FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY db.js server.js ./
COPY internal ./internal
COPY middleware ./middleware
COPY routes ./routes
COPY services ./services

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
