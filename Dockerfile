FROM node:16-alpine AS frontend-build

# 构建前端
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 最终镜像
FROM nginx:alpine

# 安装 envsubst
RUN apk add --no-cache gettext

# 复制前端文件到nginx目录
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# 复制nginx配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 复制启动脚本
COPY docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

# 配置端口
EXPOSE 80

# 启动应用
ENTRYPOINT ["/entrypoint.sh"]