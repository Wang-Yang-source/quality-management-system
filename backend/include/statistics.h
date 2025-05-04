#ifndef STATISTICS_H
#define STATISTICS_H

#include <vector>
#include <map>
#include <string>

namespace QualityManagement {

// 描述性统计结构体
struct DescriptiveStats {
    double mean;               // 均值
    double median;             // 中位数
    double variance;           // 方差
    double standardDeviation;  // 标准差
    double minimum;            // 最小值
    double maximum;            // 最大值
    double range;              // 极差
    double skewness;           // 偏度
    double kurtosis;           // 峰度
    int sampleSize;            // 样本数量
};

// 正态性检验结果结构体
struct NormalityTest {
    bool isNormal;             // 是否符合正态分布
    double statistic;          // 检验统计量
    double pValue;             // p值
    std::string testMethod;    // 检验方法
    std::string conclusion;    // 结论
};

// 均值检验结果结构体
struct MeanTest {
    double sampleMean;         // 样本均值
    double expectedMean;       // 期望总体均值
    double tStatistic;         // t检验统计量
    double pValue;             // p值
    double alpha;              // 显著性水平
    bool testResult;           // 检验结果（是否拒绝原假设）
    std::string conclusion;    // 结论
};

// 过程能力指数结构体
struct CapabilityIndices {
    double lsl;                // 下规格限
    double usl;                // 上规格限
    double cp;                 // 过程能力指数
    double cpk;                // 过程能力指数（考虑居中性）
    double cpl;                // 下侧过程能力指数
    double cpu;                // 上侧过程能力指数
    double pp;                 // 过程性能指数
    double ppk;                // 过程性能指数（考虑居中性）
    double k;                  // 偏移系数
    double cpm;                // Taguchi过程能力指数
    
    // 过程内部方差指标
    struct {
        double sigma;          // 标准差
        double lowerZ;         // 下Z值
        double upperZ;         // 上Z值
    } within;
    
    // 过程总体方差指标
    struct {
        double sigma;          // 标准差
        double lowerZ;         // 下Z值
        double upperZ;         // 上Z值
    } overall;
    
    // 百万分之缺陷率
    struct {
        double expected;       // 预期PPM
        double observed;       // 观察到的PPM
    } ppm;
};

// 控制图数据结构体
struct ControlChartData {
    std::vector<double> means;         // 样本均值
    std::vector<double> ranges;        // 样本极差
    double clMean;                    // 均值控制图中心线
    double uclMean;                   // 均值控制图上控制限
    double lclMean;                   // 均值控制图下控制限
    double clRange;                   // 极差控制图中心线
    double uclRange;                  // 极差控制图上控制限
    double lclRange;                  // 极差控制图下控制限
    bool isControlled;                // 过程是否处于统计受控状态
};

// 过程评估结构体
struct ProcessAssessment {
    std::string stabilityStatus;      // 稳定性状态
    std::string capabilityLevel;      // 能力水平
    std::string recommendations;      // 改进建议
};

class Statistics {
public:
    Statistics();
    ~Statistics();
    
    // 设置数据
    void setData(const std::vector<std::vector<double>>& data);
    
    // 生成样本数据
    std::vector<std::vector<double>> generateSampleData(int groups, int samplesPerGroup, 
                                                       double mean, double stddev);
    
    // 计算整体描述性统计量
    DescriptiveStats calculateOverallStats();
    
    // 计算分组描述性统计量
    std::vector<DescriptiveStats> calculateGroupStats();
    
    // 生成直方图数据
    std::vector<double> generateHistogram(int bins = 10);
    
    // 执行正态性检验
    NormalityTest testNormality();
    
    // 执行均值检验
    MeanTest testMean(double expectedMean, double alpha = 0.05);
    
    // 计算过程能力指数
    CapabilityIndices calculateCapabilityIndices(double lsl, double usl);
    
    // 生成控制图数据
    ControlChartData generateControlChartData();
    
    // 评估过程
    ProcessAssessment assessProcess(double lsl, double usl);
    
private:
    std::vector<std::vector<double>> data_;  // 原始分组数据
    std::vector<double> flatData_;           // 扁平化数据（用于整体分析）
    std::vector<double> groupMeans_;         // 组均值
    std::vector<double> groupRanges_;        // 组极差
    
    // 计算均值
    double calculateMean(const std::vector<double>& data);
    
    // 计算中位数
    double calculateMedian(std::vector<double> data);
    
    // 计算方差
    double calculateVariance(const std::vector<double>& data, double mean);
    
    // 计算偏度
    double calculateSkewness(const std::vector<double>& data, double mean, double stdDev);
    
    // 计算峰度
    double calculateKurtosis(const std::vector<double>& data, double mean, double stdDev);
    
    // 计算正态分布概率
    double normalCDF(double x, double mean, double stdDev);
    
    // Shapiro-Wilk检验
    std::pair<double, double> shapiroWilkTest(const std::vector<double>& data);
    
    // 计算控制图常数
    double getControlChartConstantA2(int sampleSize);
    double getControlChartConstantD3(int sampleSize);
    double getControlChartConstantD4(int sampleSize);
};

} // namespace QualityManagement

#endif // STATISTICS_H
