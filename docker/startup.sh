#!/bin/bash
# 配置nginx来使用环境变量PORT（Render平台专用）
if [ -n "$PORT" ]; then
  sed -i "s/listen 80/listen $PORT/g" /etc/nginx/sites-available/default
fi

# 启动nginx服务
service nginx start

# 启动后端服务
cd /app
./quality_management_server &

# 保持容器运行
tail -f /dev/null