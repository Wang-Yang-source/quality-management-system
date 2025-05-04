#!/bin/bash
echo "开始交叉编译 Linux x86 二进制文件..."

# 创建输出目录
mkdir -p output

# 构建交叉编译 Docker 镜像
docker build -t quality-management-crosscompile -f docker/Dockerfile.crosscompile .

# 运行 Docker 容器进行编译，并将输出映射到本地目录
docker run --rm -v "$(pwd)/output:/output" quality-management-crosscompile

echo ""
echo "如果编译成功，Linux 二进制文件将位于: $(pwd)/output/quality_management_server_linux"
echo ""