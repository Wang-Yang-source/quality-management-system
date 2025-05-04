#ifndef API_HANDLER_H
#define API_HANDLER_H

#include <string>
#include <vector>
#include <memory>
#include "statistics.h"

namespace QualityManagement {

class ApiHandler {
public:
    ApiHandler();
    ~ApiHandler();
    
    // 处理API请求并返回JSON响应
    std::string handleRequest(const std::string& path, const std::string& requestBody);
    
private:
    // 数据存储
    std::vector<std::vector<double>> data_;
    
    // 统计分析工具
    std::unique_ptr<Statistics> statistics_;
    
    // 各种API端点处理方法
    std::string handleGenerateData(const std::string& requestBody);
    std::string handleImportData(const std::string& requestBody);
    std::string handleDescriptiveStats(const std::string& requestBody);
    std::string handleNormalityTest(const std::string& requestBody);
    std::string handleMeanTest(const std::string& requestBody);
    std::string handleCapabilityIndices(const std::string& requestBody);
    std::string handleControlChart(const std::string& requestBody);
    std::string handleProcessAssessment(const std::string& requestBody);
    std::string handleAllAnalysis(const std::string& requestBody);
};

} // namespace QualityManagement

#endif // API_HANDLER_H
