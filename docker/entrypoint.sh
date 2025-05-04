#!/bin/sh

# 检查是否存在PORT环境变量，如果存在则修改nginx配置
if [ ! -z "$PORT" ]; then
  # 将Nginx配置文件中的80端口替换为环境变量指定的端口
  sed -i.bak "s|listen 80;|listen $PORT;|g" /etc/nginx/conf.d/default.conf
  echo "Nginx 配置已更新，监听端口: $PORT"
else
  echo "未设置PORT环境变量，使用默认端口80"
fi

# 启动 Nginx
exec nginx -g 'daemon off;'