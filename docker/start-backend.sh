#!/bin/bash

# 检查PORT环境变量
if [ ! -z "$PORT" ]; then
  # 将Nginx配置中的8080端口替换为环境变量指定的端口
  sed -i.bak "s|listen 8080|listen $PORT|g" /etc/nginx/sites-available/default
  echo "Nginx配置已更新，监听端口: $PORT"
else
  echo "未设置PORT环境变量，使用默认端口8080"
fi

# 启动Nginx
service nginx start

# 启动后端服务
cd /app
./quality_management_server &

# 记录启动信息
echo "质量管理系统后端服务已启动"

# 保持容器运行
tail -f /dev/null