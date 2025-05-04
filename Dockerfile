FROM node:16-alpine AS frontend-build

# 构建前端
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 后端构建
FROM node:16-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm ci

# 最终镜像
FROM node:16-alpine

# 安装nginx
RUN apk add --no-cache nginx

# 复制前端文件到nginx目录
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# 设置后端
WORKDIR /app
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY backend/server.js ./server.js

# 复制nginx配置
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# 复制启动脚本
COPY docker/startup.sh ./
RUN chmod +x ./startup.sh

# 暴露HTTP和API端口
EXPOSE 80 8080

# 启动应用
CMD ["./startup.sh"]