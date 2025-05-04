FROM node:16-alpine AS frontend-build

# 构建前端
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM ubuntu:20.04 AS backend-build

# 安装构建依赖
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 构建后端
WORKDIR /app/backend
COPY backend/ ./
RUN mkdir -p build && cd build && \
    cmake .. && \
    make -j$(nproc)

# 最终镜像
FROM ubuntu:20.04

# 安装运行依赖
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# 复制前端文件到nginx目录
COPY --from=frontend-build /app/frontend/build /var/www/html

# 复制nginx配置
COPY docker/nginx.conf /etc/nginx/sites-available/default

# 复制后端可执行文件
WORKDIR /app
COPY --from=backend-build /app/backend/build/quality_management_server ./

# 复制启动脚本
COPY docker/startup.sh ./
RUN chmod +x ./startup.sh

# 暴露HTTP和API端口
EXPOSE 80 8080

# 启动应用
CMD ["./startup.sh"]