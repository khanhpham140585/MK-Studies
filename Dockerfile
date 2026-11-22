FROM node:20-bookworm-slim

WORKDIR /app

# Cài đặt dependencies (bao gồm devDependencies cho ts-node/typescript)
COPY package*.json tsconfig.json ./
RUN npm install

# Copy source code và dữ liệu ứng dụng
COPY src ./src
COPY data ./data

# Đảm bảo mount point data/pdfs sạch và sẵn sàng nhận volume từ host
RUN rm -rf ./data/pdfs && mkdir -p ./data/pdfs

ENV PORT=3001
ENV NODE_ENV=production
ENV SQLITE_DB_PATH=/app/data/agent.db

EXPOSE 3001

CMD ["npm", "start"]

