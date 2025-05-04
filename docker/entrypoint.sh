#!/bin/sh

# 替换 Nginx 配置文件中的环境变量
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# 启动 Nginx
nginx -g 'daemon off;'