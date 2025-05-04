#include <iostream>
#include <string>
#include <cstring>
#include <memory>
#include <vector>
#include <thread>
#include <functional>
#include <csignal>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "Ws2_32.lib")
#else
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#define SOCKET int
#define INVALID_SOCKET -1
#define SOCKET_ERROR -1
#define closesocket close
#endif

#include "api_handler.h"
#include "nlohmann/json.hpp"  // 使用下载的单头文件JSON库

// 使用简写命名空间
using json = nlohmann::json;

// 全局变量，用于处理终止信号
volatile sig_atomic_t g_running = 1;

// 信号处理函数
void signal_handler(int signal) {
    g_running = 0;
    std::cout << "接收到终止信号，服务器正在关闭..." << std::endl;
}

// 初始化Winsock (仅Windows平台需要)
bool init_winsock() {
#ifdef _WIN32
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        std::cerr << "WSAStartup失败: " << result << std::endl;
        return false;
    }
    return true;
#else
    return true;  // 非Windows平台不需要初始化
#endif
}

// 清理Winsock
void cleanup_winsock() {
#ifdef _WIN32
    WSACleanup();
#endif
}

// 处理客户端连接
void handle_client(SOCKET client_socket, QualityManagement::ApiHandler& api_handler) {
    const int buffer_size = 8192;
    char buffer[buffer_size];
    std::string request;
    
    while (g_running) {
        memset(buffer, 0, buffer_size);
        int bytes_received = recv(client_socket, buffer, buffer_size - 1, 0);
        
        if (bytes_received == SOCKET_ERROR) {
            std::cerr << "接收数据失败" << std::endl;
            break;
        }
        
        if (bytes_received == 0) {
            // 客户端断开连接
            break;
        }
        
        buffer[bytes_received] = '\0';
        request += buffer;
        
        // 检查请求是否完整
        if (request.find("\r\n\r\n") != std::string::npos) {
            // 解析HTTP请求
            std::string method, path, version;
            std::string headers;
            std::string body;
            
            // 提取请求行
            size_t first_line_end = request.find("\r\n");
            std::string request_line = request.substr(0, first_line_end);
            
            // 提取方法、路径和HTTP版本
            size_t method_end = request_line.find(' ');
            method = request_line.substr(0, method_end);
            
            size_t path_start = method_end + 1;
            size_t path_end = request_line.find(' ', path_start);
            path = request_line.substr(path_start, path_end - path_start);
            
            version = request_line.substr(path_end + 1);
            
            // 提取消息体
            size_t body_start = request.find("\r\n\r\n") + 4;
            body = request.substr(body_start);
            
            // 处理API请求
            std::string response_body;
            if (method == "POST") {
                try {
                    // 尝试解析请求体为JSON以验证其格式
                    json request_json;
                    if (!body.empty()) {
                        request_json = json::parse(body);
                    }
                    
                    // 调用API处理器处理请求
                    response_body = api_handler.handleRequest(path, body);
                    
                    // 验证响应是否为有效的JSON
                    json response_json = json::parse(response_body);
                } catch (const json::exception& e) {
                    // 捕获所有JSON解析相关异常
                    std::cerr << "JSON错误: " << e.what() << std::endl;
                    response_body = json({
                        {"success", false},
                        {"error", std::string("JSON处理错误: ") + e.what()},
                        {"errorType", "json_error"},
                        {"errorId", e.id}
                    }).dump();
                } catch (const std::exception& e) {
                    std::cerr << "处理请求出错: " << e.what() << std::endl;
                    response_body = json({
                        {"success", false},
                        {"error", std::string("处理请求时发生错误: ") + e.what()}
                    }).dump();
                }
            } else if (method == "OPTIONS") {
                // 处理CORS预检请求
                response_body = "{}";
            } else {
                response_body = "{\"error\": \"仅支持POST请求\"}";
            }
            
            // 构建HTTP响应
            std::string response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: application/json\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";  // 允许跨域请求
            response += "Access-Control-Allow-Methods: POST, OPTIONS\r\n";
            response += "Access-Control-Allow-Headers: Content-Type\r\n";
            response += "Content-Length: " + std::to_string(response_body.size()) + "\r\n";
            response += "\r\n";
            response += response_body;
            
            // 发送响应
            send(client_socket, response.c_str(), response.size(), 0);
            
            // 重置请求缓冲区
            request.clear();
        }
    }
    
    // 关闭客户端连接
    closesocket(client_socket);
}

int main() {
    // 注册信号处理程序
    std::signal(SIGINT, signal_handler);
    std::signal(SIGTERM, signal_handler);
    
    std::cout << "产品质量管理系统后端服务器启动中..." << std::endl;
    
    // 初始化Winsock (仅Windows平台)
    if (!init_winsock()) {
        return 1;
    }
    
    // 创建服务器套接字
    SOCKET server_socket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (server_socket == INVALID_SOCKET) {
        std::cerr << "创建套接字失败" << std::endl;
        cleanup_winsock();
        return 1;
    }
    
    // 配置服务器地址
    struct sockaddr_in server_address;
    server_address.sin_family = AF_INET;
#ifdef SERVER_PORT
    server_address.sin_port = htons(SERVER_PORT);  // 使用CMake定义的端口
#else
    server_address.sin_port = htons(3001);  // 默认使用3001端口
#endif
    server_address.sin_addr.s_addr = INADDR_ANY;
    
    // 绑定套接字
    if (bind(server_socket, (struct sockaddr*)&server_address, sizeof(server_address)) == SOCKET_ERROR) {
        std::cerr << "绑定套接字失败" << std::endl;
        closesocket(server_socket);
        cleanup_winsock();
        return 1;
    }
    
    // 开始监听
    if (listen(server_socket, SOMAXCONN) == SOCKET_ERROR) {
        std::cerr << "监听套接字失败" << std::endl;
        closesocket(server_socket);
        cleanup_winsock();
        return 1;
    }
    
#ifdef SERVER_PORT
    std::cout << "服务器已启动，监听端口" << SERVER_PORT << "..." << std::endl;
#else
    std::cout << "服务器已启动，监听端口3001..." << std::endl;
#endif
    
    // 创建API处理器
    QualityManagement::ApiHandler api_handler;
    
    // 客户端连接处理线程
    std::vector<std::thread> client_threads;
    
    // 主循环接受客户端连接
    while (g_running) {
        // 接受客户端连接
        struct sockaddr_in client_address;
        int client_address_size = sizeof(client_address);
        SOCKET client_socket = accept(server_socket, (struct sockaddr*)&client_address, &client_address_size);
        
        if (client_socket == INVALID_SOCKET) {
            if (g_running) {  // 仅在非正常关闭时报错
                std::cerr << "接受客户端连接失败" << std::endl;
            }
            continue;
        }
        
        // 创建新线程处理客户端请求
        client_threads.emplace_back(handle_client, client_socket, std::ref(api_handler));
        
        // 分离线程，让系统在线程完成时自动清理资源
        client_threads.back().detach();
    }
    
    // 关闭服务器套接字
    closesocket(server_socket);
    
    // 清理Winsock (仅Windows平台)
    cleanup_winsock();
    
    std::cout << "服务器已正常关闭" << std::endl;
    
    return 0;
}