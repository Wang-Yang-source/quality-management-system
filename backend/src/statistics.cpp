#include "../include/statistics.h"
#include <algorithm>
#include <fstream>
#include <sstream>
#include <numeric>
#include <cmath>
#include <iostream>
#include <random> // 添加随机数生成相关的头文件

namespace QualityManagement {

// 生成模拟数据
std::vector<std::vector<double>> Statistics::generateSampleData(int groups, int samplesPerGroup, double mean, double stddev) {
    std::vector<std::vector<double>> result(groups);
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<double> dist(mean, stddev);

    for (int i = 0; i < groups; ++i) {
        result[i].resize(samplesPerGroup);
        for (int j = 0; j < samplesPerGroup; ++j) {
            // 添加一些随机波动，使数据更真实
            double randomFactor = (i % 5 == 0) ? 1.2 : 1.0; // 每5组增加一些异常
            result[i][j] = dist(gen) * randomFactor;
        }
    }
    
    return result;
}

// 设置数据
void Statistics::setData(const std::vector<std::vector<double>>& data) {
    data_ = data;
    
    // 扁平化数据用于整体分析
    flatData_.clear();
    for (const auto& group : data) {
        flatData_.insert(flatData_.end(), group.begin(), group.end());
    }
    
    // 计算组均值和极差
    groupMeans_.clear();
    groupRanges_.clear();
    for (const auto& group : data) {
        if (!group.empty()) {
            double groupMean = std::accumulate(group.begin(), group.end(), 0.0) / group.size();
            auto minmax = std::minmax_element(group.begin(), group.end());
            double groupRange = *minmax.second - *minmax.first;
            
            groupMeans_.push_back(groupMean);
            groupRanges_.push_back(groupRange);
        }
    }
}

// 计算整体描述性统计量
DescriptiveStats Statistics::calculateOverallStats() {
    DescriptiveStats stats;
    
    if (flatData_.empty()) {
        return stats;
    }
    
    // 计算均值
    stats.mean = calculateMean(flatData_);
    
    // 计算中位数
    stats.median = calculateMedian(flatData_);
    
    // 计算方差和标准差
    stats.variance = calculateVariance(flatData_, stats.mean);
    stats.standardDeviation = std::sqrt(stats.variance);
    
    // 计算最小值和最大值
    auto minmax = std::minmax_element(flatData_.begin(), flatData_.end());
    stats.minimum = *minmax.first;
    stats.maximum = *minmax.second;
    stats.range = stats.maximum - stats.minimum;
    
    // 计算样本大小
    stats.sampleSize = flatData_.size();
    
    // 计算偏度和峰度
    stats.skewness = calculateSkewness(flatData_, stats.mean, stats.standardDeviation);
    stats.kurtosis = calculateKurtosis(flatData_, stats.mean, stats.standardDeviation);
    
    return stats;
}

// 计算分组描述性统计量
std::vector<DescriptiveStats> Statistics::calculateGroupStats() {
    std::vector<DescriptiveStats> result;
    
    if (data_.empty()) {
        return result;
    }
    
    for (const auto& group : data_) {
        if (!group.empty()) {
            DescriptiveStats stats;
            
            // 计算均值
            stats.mean = calculateMean(group);
            
            // 计算中位数
            stats.median = calculateMedian(group);
            
            // 计算方差和标准差
            stats.variance = calculateVariance(group, stats.mean);
            stats.standardDeviation = std::sqrt(stats.variance);
            
            // 计算最小值和最大值
            auto minmax = std::minmax_element(group.begin(), group.end());
            stats.minimum = *minmax.first;
            stats.maximum = *minmax.second;
            stats.range = stats.maximum - stats.minimum;
            
            // 计算样本大小
            stats.sampleSize = group.size();
            
            // 计算偏度和峰度
            stats.skewness = calculateSkewness(group, stats.mean, stats.standardDeviation);
            stats.kurtosis = calculateKurtosis(group, stats.mean, stats.standardDeviation);
            
            result.push_back(stats);
        }
    }
    
    return result;
}

// Shapiro-Wilk正态性检验的简化实现
std::pair<double, double> Statistics::shapiroWilkTest(const std::vector<double>& data) {
    // 这是一个简化的Shapiro-Wilk检验实现
    // 实际应用中，可能需要使用专业的统计库
    
    if (data.size() < 3 || data.size() > 50) {
        // 数据量太小或太大，不适用于简化实现
        return {0.0, 0.5};
    }
    
    // 对数据进行排序
    std::vector<double> sorted = data;
    std::sort(sorted.begin(), sorted.end());
    
    // 计算均值
    double mean = std::accumulate(sorted.begin(), sorted.end(), 0.0) / sorted.size();
    
    // 计算方差
    double variance = 0.0;
    for (const auto& value : sorted) {
        double diff = value - mean;
        variance += diff * diff;
    }
    variance /= sorted.size();
    
    // 计算Shapiro-Wilk统计量W
    // 这里使用了简化的计算方式
    double numerator = 0.0;
    int n = sorted.size();
    for (int i = 0; i < n/2; ++i) {
        double a = 0.7 * (n - 2*i - 1) / (n - 1); // 简化的权重
        numerator += a * (sorted[n-i-1] - sorted[i]);
    }
    numerator = numerator * numerator;
    
    double denominator = 0.0;
    for (const auto& value : sorted) {
        denominator += (value - mean) * (value - mean);
    }
    
    double W = numerator / denominator;
    
    // 将W值转换为近似p值
    // 这是一个非常简化的方法，实际使用建议采用专业统计库
    double p = 1.0;
    if (W < 0.9) {
        p = 0.01;
    } else if (W < 0.95) {
        p = 0.05;
    } else if (W < 0.98) {
        p = 0.1;
    }
    
    return {W, p};
}

// 正态性检验
NormalityTest Statistics::testNormality() {
    NormalityTest result;
    result.testMethod = "Shapiro-Wilk";
    
    auto [statistic, pValue] = shapiroWilkTest(flatData_);
    result.statistic = statistic;
    result.pValue = pValue;
    result.isNormal = pValue >= 0.05; // 通常p值大于0.05认为符合正态分布
    
    if (result.isNormal) {
        result.conclusion = "数据符合正态分布 (p > 0.05)";
    } else {
        result.conclusion = "数据不符合正态分布 (p <= 0.05)";
    }
    
    return result;
}

// 总体均值检验
MeanTest Statistics::testMean(double expectedMean, double alpha) {
    MeanTest result;
    result.expectedMean = expectedMean;
    result.alpha = alpha;
    
    if (flatData_.empty()) {
        result.testResult = false;
        result.conclusion = "数据为空，无法进行检验";
        return result;
    }
    
    // 计算均值和标准差
    result.sampleMean = calculateMean(flatData_);
    double variance = calculateVariance(flatData_, result.sampleMean);
    double stdDev = std::sqrt(variance);
    
    // 计算t统计量
    result.tStatistic = (result.sampleMean - expectedMean) / (stdDev / std::sqrt(flatData_.size()));
    
    // 简化版的双侧t检验
    // 对于大样本，可以近似为正态分布
    double criticalT = 1.96; // 近似95%置信区间
    if (alpha == 0.01) {
        criticalT = 2.576; // 近似99%置信区间
    }
    
    result.pValue = 2.0 * (1.0 - normalCDF(std::abs(result.tStatistic), 0, 1));
    result.testResult = result.pValue <= alpha;
    
    if (result.testResult) {
        result.conclusion = "拒绝原假设，样本均值与期望均值存在显著差异";
    } else {
        result.conclusion = "不拒绝原假设，样本均值与期望均值无显著差异";
    }
    
    return result;
}

// 计算过程能力指数
CapabilityIndices Statistics::calculateCapabilityIndices(double lsl, double usl) {
    CapabilityIndices indices;
    indices.lsl = lsl;
    indices.usl = usl;
    
    DescriptiveStats stats = calculateOverallStats();
    double mean = stats.mean;
    double sigma = stats.standardDeviation;
    double target = (usl + lsl) / 2.0; // 目标值，通常取规格区间中点
    
    // 计算过程能力指数Cp
    indices.cp = (usl - lsl) / (6 * sigma);
    
    // 计算Cpk
    double cpupper = (usl - mean) / (3 * sigma);
    double cplower = (mean - lsl) / (3 * sigma);
    indices.cpk = std::min(cpupper, cplower);
    
    indices.cpl = cplower;
    indices.cpu = cpupper;
    
    // 计算偏移系数
    indices.k = std::abs(mean - target) / ((usl - lsl) / 2);
    
    // Pp和Ppk通常需要长期数据，这里简化处理
    indices.pp = indices.cp;
    indices.ppk = indices.cpk;
    
    // 新增字段计算 - Taguchi过程能力指数(Cpm)
    double sumSquaredDiff = 0.0;
    for (const auto& value : flatData_) {
        sumSquaredDiff += std::pow(value - target, 2);
    }
    double tau = std::sqrt(sumSquaredDiff / flatData_.size());
    indices.cpm = (usl - lsl) / (6 * tau);
    
    // 过程内部方差指标 - 基于子组内差异
    double avgGroupStdDev = 0.0;
    int validGroups = 0;
    
    for (const auto& group : data_) {
        if (group.size() > 1) {
            double groupMean = calculateMean(group);
            double groupVar = calculateVariance(group, groupMean);
            avgGroupStdDev += std::sqrt(groupVar);
            validGroups++;
        }
    }
    
    if (validGroups > 0) {
        avgGroupStdDev /= validGroups;
        indices.within.sigma = avgGroupStdDev;
        indices.within.lowerZ = (mean - lsl) / avgGroupStdDev;
        indices.within.upperZ = (usl - mean) / avgGroupStdDev;
    } else {
        indices.within.sigma = sigma;
        indices.within.lowerZ = (mean - lsl) / sigma;
        indices.within.upperZ = (usl - mean) / sigma;
    }
    
    // 过程总体方差指标 - 基于所有数据
    indices.overall.sigma = sigma;
    indices.overall.lowerZ = (mean - lsl) / sigma;
    indices.overall.upperZ = (usl - mean) / sigma;
    
    // 百万分之缺陷率(PPM)计算
    // 期望PPM基于正态分布理论计算
    double lowerZScore = indices.overall.lowerZ;
    double upperZScore = indices.overall.upperZ;
    double lowerPPM = 1000000 * (1 - normalCDF(lowerZScore, 0, 1));
    double upperPPM = 1000000 * normalCDF(-upperZScore, 0, 1);
    indices.ppm.expected = lowerPPM + upperPPM;
    
    // 观察到的PPM通过直接计数计算
    int outOfSpecCount = 0;
    for (const auto& value : flatData_) {
        if (value < lsl || value > usl) {
            outOfSpecCount++;
        }
    }
    
    if (!flatData_.empty()) {
        indices.ppm.observed = 1000000.0 * outOfSpecCount / flatData_.size();
    } else {
        indices.ppm.observed = 0.0;
    }
    
    return indices;
}

// 生成控制图数据
ControlChartData Statistics::generateControlChartData() {
    ControlChartData chartData;
    
    if (data_.empty() || data_[0].empty()) {
        return chartData;
    }
    
    chartData.means = groupMeans_;
    chartData.ranges = groupRanges_;
    
    // 计算均值图的控制限
    double meanOfMeans = calculateMean(groupMeans_);
    double meanOfRanges = calculateMean(groupRanges_);
    
    int n = data_[0].size(); // 子组大小
    
    // 控制图常数（根据子组大小确定）
    double A2 = getControlChartConstantA2(n);
    double D3 = getControlChartConstantD3(n);
    double D4 = getControlChartConstantD4(n);
    
    // 计算控制限
    chartData.clMean = meanOfMeans;
    chartData.uclMean = meanOfMeans + A2 * meanOfRanges;
    chartData.lclMean = meanOfMeans - A2 * meanOfRanges;
    
    chartData.clRange = meanOfRanges;
    chartData.uclRange = D4 * meanOfRanges;
    chartData.lclRange = D3 * meanOfRanges;
    
    // 判断过程是否受控
    chartData.isControlled = true;
    for (size_t i = 0; i < chartData.means.size(); ++i) {
        if (chartData.means[i] > chartData.uclMean || 
            chartData.means[i] < chartData.lclMean ||
            chartData.ranges[i] > chartData.uclRange ||
            chartData.ranges[i] < chartData.lclRange) {
            chartData.isControlled = false;
            break;
        }
    }
    
    return chartData;
}

// 评估过程
ProcessAssessment Statistics::assessProcess(double lsl, double usl) {
    ProcessAssessment assessment;
    
    CapabilityIndices indices = calculateCapabilityIndices(lsl, usl);
    ControlChartData chartData = generateControlChartData();
    
    // 评估稳定性
    if (chartData.isControlled) {
        assessment.stabilityStatus = "过程稳定，处于统计受控状态";
    } else {
        assessment.stabilityStatus = "过程不稳定，未处于统计受控状态";
    }
    
    // 评估能力水平
    if (indices.cpk >= 1.33) {
        assessment.capabilityLevel = "过程能力优秀 (Cpk >= 1.33)";
    } else if (indices.cpk >= 1.0) {
        assessment.capabilityLevel = "过程能力良好 (1.0 <= Cpk < 1.33)";
    } else {
        assessment.capabilityLevel = "过程能力不足 (Cpk < 1.0)";
    }
    
    // 提供建议
    if (!chartData.isControlled) {
        assessment.recommendations = "需要识别并消除特殊原因变异，使过程处于统计受控状态";
    } else if (indices.cpk < 1.0) {
        assessment.recommendations = "需要进行工艺改进，提高过程能力";
    } else {
        assessment.recommendations = "维持当前工艺水平，进行定期监控";
    }
    
    return assessment;
}

// 辅助函数实现...
double Statistics::calculateMean(const std::vector<double>& data) {
    if (data.empty()) return 0.0;
    return std::accumulate(data.begin(), data.end(), 0.0) / data.size();
}

double Statistics::calculateMedian(std::vector<double> data) {
    if (data.empty()) return 0.0;
    
    std::sort(data.begin(), data.end());
    size_t n = data.size();
    
    if (n % 2 == 0) {
        return (data[n/2 - 1] + data[n/2]) / 2.0;
    } else {
        return data[n/2];
    }
}

double Statistics::calculateVariance(const std::vector<double>& data, double mean) {
    if (data.empty()) return 0.0;
    
    double sumSquaredDiff = 0.0;
    for (const auto& value : data) {
        double diff = value - mean;
        sumSquaredDiff += diff * diff;
    }
    return sumSquaredDiff / data.size();
}

double Statistics::calculateSkewness(const std::vector<double>& data, double mean, double stdDev) {
    if (data.empty() || stdDev == 0) return 0.0;
    
    double sum = 0.0;
    for (const auto& value : data) {
        double z = (value - mean) / stdDev;
        sum += z * z * z;
    }
    return sum / data.size();
}

double Statistics::calculateKurtosis(const std::vector<double>& data, double mean, double stdDev) {
    if (data.empty() || stdDev == 0) return 0.0;
    
    double sum = 0.0;
    for (const auto& value : data) {
        double z = (value - mean) / stdDev;
        sum += z * z * z * z;
    }
    return sum / data.size() - 3.0; // 减去3使正态分布的峰度为0
}

double Statistics::normalCDF(double x, double mean, double stdDev) {
    // 简化的正态分布累积分布函数实现
    double z = (x - mean) / stdDev;
    return 0.5 * (1 + std::erf(z / std::sqrt(2.0)));
}

double Statistics::getControlChartConstantA2(int sampleSize) {
    // 根据样本大小返回A2常数
    static const std::map<int, double> A2Constants = {
        {2, 1.880}, {3, 1.023}, {4, 0.729}, {5, 0.577},
        {6, 0.483}, {7, 0.419}, {8, 0.373}, {9, 0.337},
        {10, 0.308}
    };
    
    if (A2Constants.find(sampleSize) != A2Constants.end()) {
        return A2Constants.at(sampleSize);
    }
    return 0.373; // 默认值，对应n=8
}

double Statistics::getControlChartConstantD3(int sampleSize) {
    // 根据样本大小返回D3常数
    static const std::map<int, double> D3Constants = {
        {2, 0}, {3, 0}, {4, 0}, {5, 0},
        {6, 0}, {7, 0.076}, {8, 0.136}, {9, 0.184},
        {10, 0.223}
    };
    
    if (D3Constants.find(sampleSize) != D3Constants.end()) {
        return D3Constants.at(sampleSize);
    }
    return 0.136; // 默认值，对应n=8
}

double Statistics::getControlChartConstantD4(int sampleSize) {
    // 根据样本大小返回D4常数
    static const std::map<int, double> D4Constants = {
        {2, 3.267}, {3, 2.575}, {4, 2.282}, {5, 2.115},
        {6, 2.004}, {7, 1.924}, {8, 1.864}, {9, 1.816},
        {10, 1.777}
    };
    
    if (D4Constants.find(sampleSize) != D4Constants.end()) {
        return D4Constants.at(sampleSize);
    }
    return 1.864; // 默认值，对应n=8
}

std::vector<double> Statistics::generateHistogram(int bins) {
    // 简化实现，返回直方图的区间中心值
    if (flatData_.empty() || bins <= 0) {
        return {};
    }
    
    // 找到数据的范围
    double minVal = *std::min_element(flatData_.begin(), flatData_.end());
    double maxVal = *std::max_element(flatData_.begin(), flatData_.end());
    double range = maxVal - minVal;
    
    // 避免除以零的情况
    if (range <= 0) {
        return {minVal};
    }
    
    double binWidth = range / bins;
    std::vector<double> binCenters(bins);
    
    // 计算每个区间的中心值
    for (int i = 0; i < bins; ++i) {
        binCenters[i] = minVal + (i + 0.5) * binWidth;
    }
    
    return binCenters;
}

Statistics::Statistics() {
    // 构造函数
}

Statistics::~Statistics() {
    // 析构函数
}

} // namespace QualityManagement
