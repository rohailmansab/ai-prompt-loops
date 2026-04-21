# Railway / any container host — Node 20 + tools for mysql2/sharp native bits
FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

# Railway injects PORT; backend uses process.env.PORT || 5000
EXPOSE 5000

CMD ["npm", "start"]
