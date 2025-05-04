cmake_minimum_required(VERSION 3.10)
project(quality_management VERSION 1.0)

# 指定C++标准
set(CMAKE_CXX_STANDARD 17)  # 从C++14升级到C++17
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 包含头文件目录
include_directories(${PROJECT_SOURCE_DIR}/include)

# 创建目标文件
add_library(statistics_lib
  src/statistics.cpp
)

add_library(api_handler_lib
  src/api_handler.cpp
)

# 链接库
target_link_libraries(api_handler_lib PRIVATE statistics_lib)

# 主服务器可执行文件
add_executable(quality_management_server src/main.cpp)
target_link_libraries(quality_management_server PRIVATE api_handler_lib statistics_lib)

# 为不同构建类型设置不同的端口号 - Visual Studio兼容方式
# Debug模式使用3001, Release模式使用3002
target_compile_definitions(quality_management_server PRIVATE 
    $<$<CONFIG:Debug>:SERVER_PORT=3001>
    $<$<CONFIG:Release>:SERVER_PORT=3002>
)

# 安装目标
install(TARGETS quality_management_server DESTINATION bin)

# 添加测试
enable_testing()
