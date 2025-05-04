#!/bin/bash
# 配置nginx来使用环境变量PORT（Render平台专用）
if [ -n "$PORT" ]; then
  sed -i "s/listen 80/listen $PORT/g" /etc/nginx/sites-available/default
fi

# 启动nginx服务
service nginx start

# 使用Wine启动Windows后端可执行文件
cd /app
wine quality_management_server.exe &

# 保持容器运行
tail -f /dev/null