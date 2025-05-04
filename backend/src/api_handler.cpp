#include "../include/api_handler.h"
#include "../include/nlohmann/json.hpp"  // 添加JSON库的包含
#include <iostream>
#include <algorithm>
#include <numeric>
#include <map>
#include <functional>

namespace QualityManagement {

// 使用nlohmann的json库
using json = nlohmann::json;

ApiHandler::ApiHandler() : statistics_(std::make_unique<Statistics>()) {
    // 初始化路由表
    std::map<std::string, std::function<json(const json&)>> routes;
    routes["/generate-data"] = [this](const json& params) { return this->handleGenerateData(params); };
    routes["/import-data"] = [this](const json& params) { return this->handleImportData(params); };
    routes["/descriptive-stats"] = [this](const json& params) { return this->handleDescriptiveStats(params); };
    routes["/normality-test"] = [this](const json& params) { return this->handleNormalityTest(params); };
    routes["/mean-test"] = [this](const json& params) { return this->handleMeanTest(params); };
    routes["/capability-indices"] = [this](const json& params) { return this->handleCapabilityIndices(params); };
    routes["/control-chart"] = [this](const json& params) { return this->handleControlChart(params); };
    routes["/process-assessment"] = [this](const json& params) { return this->handleProcessAssessment(params); };
    routes["/all-analysis"] = [this](const json& params) { return this->handleAllAnalysis(params); };
}

ApiHandler::~ApiHandler() {
    // 析构函数
}

std::string ApiHandler::handleRequest(const std::string& path, const std::string& requestBody) {
    try {
        // 解析请求体为JSON
        nlohmann::json requestParams;
        if (!requestBody.empty()) {
            try {
                requestParams = nlohmann::json::parse(requestBody);
            } catch (const nlohmann::json::exception& e) {
                return nlohmann::json({
                    {"success", false}, 
                    {"error", std::string("JSON解析错误: ") + e.what()},
                    {"errorType", "json_parse_error"}
                }).dump();
            }
        }
        
        // 创建路由表
        std::map<std::string, std::function<nlohmann::json(const nlohmann::json&)>> routes;
        routes["/generate-data"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleGenerateData(params.dump())); 
        };
        routes["/import-data"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleImportData(params.dump())); 
        };
        routes["/descriptive-stats"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleDescriptiveStats(params.dump())); 
        };
        routes["/normality-test"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleNormalityTest(params.dump())); 
        };
        routes["/mean-test"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleMeanTest(params.dump())); 
        };
        routes["/capability-indices"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleCapabilityIndices(params.dump())); 
        };
        routes["/control-chart"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleControlChart(params.dump())); 
        };
        routes["/process-assessment"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleProcessAssessment(params.dump())); 
        };
        routes["/all-analysis"] = [this](const nlohmann::json& params) { 
            return nlohmann::json::parse(this->handleAllAnalysis(params.dump())); 
        };
        
        // 查找路由处理函数
        auto it = routes.find(path);
        if (it != routes.end()) {
            try {
                // 调用对应的处理函数
                nlohmann::json response = it->second(requestParams);
                return response.dump();
            } catch (const nlohmann::json::exception& e) {
                // 捕获JSON异常
                return nlohmann::json({
                    {"success", false}, 
                    {"error", std::string("JSON处理错误: ") + e.what()},
                    {"errorType", "json_process_error"}
                }).dump();
            } catch (const std::exception& e) {
                // 捕获其他异常
                return nlohmann::json({
                    {"success", false}, 
                    {"error", std::string("处理请求时发生错误: ") + e.what()}
                }).dump();
            }
        } else {
            // 未找到路由
            return nlohmann::json({
                {"success", false},
                {"error", "路由不存在: " + path}
            }).dump();
        }
    } catch (const std::exception& e) {
        // 处理异常
        return nlohmann::json({
            {"success", false}, 
            {"error", std::string("处理请求时发生错误: ") + e.what()}
        }).dump();
    }
}

std::string ApiHandler::handleGenerateData(const std::string& requestBody) {
    try {
        json params = json::parse(requestBody);
        int groups = params.value("groups", 25);
        int samplesPerGroup = params.value("samplesPerGroup", 5);
        double mean = params.value("mean", 100.0);
        double stddev = params.value("stddev", 10.0);
        
        // 生成数据
        data_ = statistics_->generateSampleData(groups, samplesPerGroup, mean, stddev);
        
        // 更新统计类中的数据
        statistics_->setData(data_);
        
        // 转换为JSON格式返回
        json result;
        for (size_t i = 0; i < data_.size(); ++i) {
            json group;
            for (size_t j = 0; j < data_[i].size(); ++j) {
                group.push_back(data_[i][j]);
            }
            result.push_back(group);
        }
        
        return json({{"success", true}, {"data", result}}).dump();
    } catch (const std::exception& e) {
        return json({{"success", false}, {"error", e.what()}}).dump();
    }
}

std::string ApiHandler::handleImportData(const std::string& requestBody) {
    try {
        json params = json::parse(requestBody);
        
        // 检查参数是否为数组格式
        if (params.contains("data") && params["data"].is_array()) {
            data_.clear();
            for (const auto& group : params["data"]) {
                if (group.is_array()) {
                    std::vector<double> groupData;
                    for (const auto& item : group) {
                        if (item.is_number()) {
                            groupData.push_back(item.get<double>());
                        }
                    }
                    if (!groupData.empty()) {
                        data_.push_back(groupData);
                    }
                }
            }
            
            // 更新统计类中的数据
            statistics_->setData(data_);
            
            return json({{"success", true}, {"message", "数据导入成功"}, {"count", data_.size()}}).dump();
        } else {
            return json({{"success", false}, {"error", "无效的参数格式"}}).dump();
        }
    } catch (const std::exception& e) {
        return json({{"success", false}, {"error", e.what()}}).dump();
    }
}

std::string ApiHandler::handleDescriptiveStats(const std::string& requestBody) {
    try {
        if (data_.empty()) {
            return json({{"success", false}, {"error", "没有可用数据"}}).dump();
        }
        
        // 计算整体描述性统计量
        DescriptiveStats stats = statistics_->calculateOverallStats();
        
        // 计算每组的统计量
        std::vector<DescriptiveStats> groupStats = statistics_->calculateGroupStats();
        
        // 计算总体组统计量
        json overallResult = {
            {"mean", stats.mean},
            {"variance", stats.variance},
            {"standardDeviation", stats.standardDeviation},
            {"range", stats.range},
            {"minimum", stats.minimum},
            {"maximum", stats.maximum},
            {"median", stats.median},
            {"skewness", stats.skewness},
            {"kurtosis", stats.kurtosis},
            {"sampleSize", stats.sampleSize}
        };
        
        // 生成直方图数据
        std::vector<double> histogram = statistics_->generateHistogram();
        
        // 计算组统计量的平均值
        double groupMeanAvg = 0.0;
        double groupStdDevAvg = 0.0;
        double groupRangeAvg = 0.0;
        double groupMinAvg = 0.0;
        double groupMaxAvg = 0.0;
        
        if (!groupStats.empty()) {
            for (const auto& gs : groupStats) {
                groupMeanAvg += gs.mean;
                groupStdDevAvg += gs.standardDeviation;
                groupRangeAvg += gs.range;
                groupMinAvg += gs.minimum;
                groupMaxAvg += gs.maximum;
            }
            
            groupMeanAvg /= groupStats.size();
            groupStdDevAvg /= groupStats.size();
            groupRangeAvg /= groupStats.size();
            groupMinAvg /= groupStats.size();
            groupMaxAvg /= groupStats.size();
        }
        
        json groupsResult = {
            {"mean", groupMeanAvg},
            {"standardDeviation", groupStdDevAvg},
            {"range", groupRangeAvg},
            {"minimum", groupMinAvg},
            {"maximum", groupMaxAvg}
        };
        
        return json({
            {"success", true}, 
            {"stats", {
                {"overall", overallResult},
                {"groups", groupsResult},
                {"histogram", histogram}
            }}
        }).dump();
    } catch (const std::exception& e) {
        return json({{"success", false}, {"error", e.what()}}).dump();
    }
}

std::string ApiHandler::handleNormalityTest(const std::string& requestBody) {
    try {
        if (data_.empty()) {
            return json({{"success", false}, {"error", "没有可用数据"}}).dump();
        }
        
        // 进行正态性检验
        NormalityTest test = statistics_->testNormality();
        
        return json({
            {"success", true}, 
            {"isNormal", test.isNormal}, 
            {"pValue", test.pValue},
            {"statistic", test.statistic},
            {"testMethod", test.testMethod},
            {"conclusion", test.conclusion}
        }).dump();
    } catch (const std::exception& e) {
        return json({{"success", false}, {"error", e.what()}}).dump();
    }
}

std::string ApiHandler::handleMeanTest(const std::string& requestBody) {
    try {
        if (data_.empty()) {
            return json({{"success", false}, {"error", "没有可用数据"}}).dump();
        }
        
        json params = json::parse(requestBody);
        // 期望的总体均值，默认为100
        double expectedMean = params.value("expectedMean", 100.0);
        double alpha = params.value("alpha", 0.05);
        
        // 进行均值检验
        MeanTest result = statistics_->testMean(expectedMean, alpha);
        
        return json({
            {"success", true}, 
            {"sampleMean", result.sampleMean},
            {"expectedMean", result.expectedMean},
            {"tStatistic", result.tStatistic},
            {"pValue", result.pValue},
            {"alpha", result.alpha},
            {"testResult", result.testResult},
            {"conclusion", result.conclusion}
        }).dump();
    } catch (const std::exception& e) {
        return json({{"success", false}, {"error", e.what()}}).dump();
    }
}

std::string ApiHandler::handleCapabilityIndices(const std::string& requestBody) {
    try {
        if (data_.empty()) {
            return json({{"success", false}, {"error", "没有可用数据"}}).dump();
        }
        
        json params = json::parse(requestBody);
        // 规格限
        double lsl = params.value("lsl", 70.0); // 下规格限
        double usl = params.value("usl", 130.0); // 上规格限
        
        // 计算能力指数
        CapabilityIndices indices = statistics_->calculateCapabilityIndices(lsl, usl);
        
        // 构建包含所有字段的响应
        json response = {
            {"success", true}, 
            {"cp", indices.cp},
            {"cpk", indices.cpk},
            {"cpl", indices.cpl},
            {"cpu", indices.cpu},
            {"pp", indices.pp},
            {"ppk", indices.ppk},
            {"k", indices.k},
            {"lsl", indices.lsl},
            {"usl", indices.usl},
            {"cpm", indices.cpm},
            {"within", {
                {"sigma", indices.within.sigma},
                {"lowerZ", indices.within.lowerZ},
                {"upperZ", indices.within.upperZ}
            }},
            {"overall", {
                {"sigma", indices.overall.sigma},
                {"lowerZ", indices.overall.lowerZ},
                {"upperZ", indices.overall.upperZ}
            }},
            {"ppm", {
                {"expected", indices.ppm.expected},
                {"observed", indices.ppm.observed}
            }}
        };
        
        return response.dump();
    } catch (const json::exception& e) {
        // 处理JSON异常
        return json({
            {"success", false}, 
            {"error", std::string("JSON处理错误: ") + e.what()}
        }).dump();
    } catch (const std::exception& e) {
        return json({{"success", false}, {"error", e.what()}}).dump();
    }
}

std::string ApiHandler::handleControlChart(const std::string& requestBody) {
    try {
        if (data_.empty()) {
            return json({{"success", false}, {"error", "没有可用数据"}}).dump();
        }
        
        // 生成控制图数据
        ControlChartData chartData = statistics_->generateControlChartData();
        
        // 转换为JSON格式返回 - 确保所有字段类型一致
        json means = json::array();
        for (const auto& mean : chartData.means) {
            means.push_back(mean);
        }
        
        json ranges = json::array();
        for (const auto& range : chartData.ranges) {
            ranges.push_back(range);
        }
        
        // 始终使用数组类型
        json outOfControlPoints = json::array();
        
        json response = {
            {"success", true}, 
            {"data", {
                {"means", means},
                {"ranges", ranges},
                {"uclMean", chartData.uclMean},
                {"lclMean", chartData.lclMean},
                {"clMean", chartData.clMean},
                {"uclRange", chartData.uclRange},
                {"lclRange", chartData.lclRange},
                {"clRange", chartData.clRange},
                {"isControlled", chartData.isControlled},
                {"outOfControlPoints", outOfControlPoints}
            }}
        };
        
        return response.dump();
    } catch (const std::exception& e) {
        return json({{"success", false}, {"error", e.what()}}).dump();
    }
}

std::string ApiHandler::handleProcessAssessment(const std::string& requestBody) {
    try {
        if (data_.empty()) {
            return json({{"success", false}, {"error", "没有可用数据"}}).dump();
        }
        
        json params = json::parse(requestBody);
        // 规格限
        double lsl = params.value("lsl", 70.0); // 下规格限
        double usl = params.value("usl", 130.0); // 上规格限
        
        // 评估过程
        ProcessAssessment assessment = statistics_->assessProcess(lsl, usl);
        
        // 获取能力指数用于返回
        CapabilityIndices indices = statistics_->calculateCapabilityIndices(lsl, usl);
        
        // 确保这些字段确实是字符串类型
        std::string stabStatus = assessment.stabilityStatus;
        std::string capLevel = assessment.capabilityLevel;
        std::string recommendations = assessment.recommendations;
        
        return json({
            {"success", true}, 
            {"stabilityStatus", stabStatus},
            {"capabilityLevel", capLevel},
            {"recommendations", recommendations},
            {"cp", indices.cp},
            {"cpk", indices.cpk}
        }).dump();
    } catch (const json::exception& e) {
        // 专门处理JSON异常
        return json({
            {"success", false}, 
            {"error", std::string("JSON解析错误: ") + e.what()},
            {"errorType", "json_error"}
        }).dump();
    } catch (const std::exception& e) {
        return json({{"success", false}, {"error", e.what()}}).dump();
    }
}

std::string ApiHandler::handleAllAnalysis(const std::string& requestBody) {
    try {
        if (data_.empty()) {
            return json({{"success", false}, {"error", "没有可用数据"}}).dump();
        }
        
        json params = json::parse(requestBody);
        // 规格限
        double lsl = params.value("lsl", 70.0); // 下规格限
        double usl = params.value("usl", 130.0); // 上规格限
        double expectedMean = params.value("expectedMean", 100.0);
        double alpha = params.value("alpha", 0.05);
        
        // 1. 描述性统计分析
        DescriptiveStats stats = statistics_->calculateOverallStats();
        
        // 2. 正态性检验
        NormalityTest normalityTest = statistics_->testNormality();
        
        // 3. 均值检验
        MeanTest meanTest = statistics_->testMean(expectedMean, alpha);
        
        // 4. 计算能力指数
        CapabilityIndices indices = statistics_->calculateCapabilityIndices(lsl, usl);
        
        // 5. 生成控制图数据
        ControlChartData chartData = statistics_->generateControlChartData();
        
        // 6. 评估过程
        ProcessAssessment assessment = statistics_->assessProcess(lsl, usl);
        
        // 7. 生成直方图数据
        std::vector<double> histogram = statistics_->generateHistogram();
        
        // 确保数组类型一致性
        json histogramArray = json::array();
        for (const auto& value : histogram) {
            histogramArray.push_back(value);
        }
        
        json meansArray = json::array();
        for (const auto& mean : chartData.means) {
            meansArray.push_back(mean);
        }
        
        json rangesArray = json::array();
        for (const auto& range : chartData.ranges) {
            rangesArray.push_back(range);
        }
        
        // 确保过程评估字段是字符串类型
        std::string stabStatus = assessment.stabilityStatus;
        std::string capLevel = assessment.capabilityLevel;
        std::string recommendations = assessment.recommendations;
        
        // 确保正态性测试字段是字符串类型
        std::string testMethod = normalityTest.testMethod;
        std::string conclusion = normalityTest.conclusion;
        
        // 确保均值测试字段是字符串类型
        std::string meanTestConclusion = meanTest.conclusion;
        
        // 构建完整的分析结果
        json result = {
            {"descriptiveStats", {
                {"mean", stats.mean},
                {"variance", stats.variance},
                {"standardDeviation", stats.standardDeviation},
                {"range", stats.range},
                {"minimum", stats.minimum},
                {"maximum", stats.maximum},
                {"median", stats.median},
                {"skewness", stats.skewness},
                {"kurtosis", stats.kurtosis},
                {"sampleSize", stats.sampleSize}
            }},
            {"normalityTest", {
                {"isNormal", normalityTest.isNormal},
                {"pValue", normalityTest.pValue},
                {"statistic", normalityTest.statistic},
                {"testMethod", testMethod},
                {"conclusion", conclusion}
            }},
            {"meanTest", {
                {"sampleMean", meanTest.sampleMean},
                {"expectedMean", meanTest.expectedMean},
                {"tStatistic", meanTest.tStatistic},
                {"pValue", meanTest.pValue},
                {"alpha", meanTest.alpha},
                {"testResult", meanTest.testResult},
                {"conclusion", meanTestConclusion}
            }},
            {"capabilityIndices", {
                {"cp", indices.cp},
                {"cpk", indices.cpk},
                {"cpl", indices.cpl},
                {"cpu", indices.cpu},
                {"pp", indices.pp},
                {"ppk", indices.ppk},
                {"k", indices.k},
                {"lsl", indices.lsl},
                {"usl", indices.usl},
                {"cpm", indices.cpm},
                {"within", {
                    {"sigma", indices.within.sigma},
                    {"lowerZ", indices.within.lowerZ},
                    {"upperZ", indices.within.upperZ}
                }},
                {"overall", {
                    {"sigma", indices.overall.sigma},
                    {"lowerZ", indices.overall.lowerZ},
                    {"upperZ", indices.overall.upperZ}
                }},
                {"ppm", {
                    {"expected", indices.ppm.expected},
                    {"observed", indices.ppm.observed}
                }}
            }},
            {"controlChart", {
                {"means", meansArray},
                {"ranges", rangesArray},
                {"uclMean", chartData.uclMean},
                {"lclMean", chartData.lclMean},
                {"clMean", chartData.clMean},
                {"uclRange", chartData.uclRange},
                {"lclRange", chartData.lclRange},
                {"clRange", chartData.clRange},
                {"isControlled", chartData.isControlled},
                {"outOfControlPoints", json::array()},
                {"xbarChart", {
                    {"centerLine", chartData.clMean},
                    {"upperControlLimit", chartData.uclMean},
                    {"lowerControlLimit", chartData.lclMean},
                    {"values", meansArray},
                    {"outOfControlPoints", json::array()}
                }},
                {"rChart", {
                    {"centerLine", chartData.clRange},
                    {"upperControlLimit", chartData.uclRange},
                    {"lowerControlLimit", chartData.lclRange},
                    {"values", rangesArray},
                    {"outOfControlPoints", json::array()}
                }}
            }},
            {"processAssessment", {
                {"stabilityStatus", stabStatus},
                {"capabilityLevel", capLevel},
                {"recommendations", recommendations}
            }},
            {"histogram", histogramArray}
        };
        
        // 返回标准化的响应格式
        return json({{"success", true}, {"analysis", result}}).dump();
    } catch (const json::exception& e) {
        // 专门捕获JSON异常并提供详细信息
        return json({
            {"success", false}, 
            {"error", std::string("JSON解析错误: ") + e.what()},
            {"errorType", "json_error"},
            {"errorId", e.id}
        }).dump();
    } catch (const std::exception& e) {
        // 捕获所有其他异常
        return json({
            {"success", false}, 
            {"error", std::string("处理请求时发生错误: ") + e.what()}
        }).dump();
    }
}

} // namespace QualityManagement
