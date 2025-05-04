// 类型定义文件

// 描述性统计指标
export interface DescriptiveStats {
    count: number;           // 样本数量
    mean: number;            // 均值
    variance: number;        // 方差
    standardDeviation: number; // 标准差
    range: number;           // 极差
    minimum: number;         // 最小值 (也接受 min 作为别名)
    maximum: number;         // 最大值 (也接受 max 作为别名)
    median: number;          // 中位数
    q1: number;              // 第一四分位数
    q3: number;              // 第三四分位数

    // 添加别名属性以兼容不同的命名风格
    min?: number;            // minimum 的别名
    max?: number;            // maximum 的别名
    stdDev?: number;         // standardDeviation 的别名
}

// 组统计数据
export interface GroupStats {
    count: number; // Added count property
    mean: number;
    median: number;
    min: number;
    max: number;
    range: number;
    variance: number;
    stdDev: number;
    q1: number;
    q3: number;
    standardDeviation: number;
    minimum: number;
    maximum: number;
}

// 正态性检验结果
export interface NormalityTest {
    isNormal: boolean;       // 是否符合正态分布
    pValue: number;          // p值
    testMethod: string;      // 检验方法
    conclusion: string;      // 结论
    statistic?: number;      // 检验统计量
}

// 均值检验结果
export interface MeanTest {
    sampleMean: number;
    expectedMean: number;
    alpha: number; // Added alpha property
    testResult: boolean;
    conclusion: string;
}

// 过程能力指数
export interface CapabilityIndices {
    cp: number;              // 过程能力指数
    cpk: number;             // 过程能力指数(考虑偏心)
    cpl: number;             // 下限过程能力指数
    cpu: number;             // 上限过程能力指数
    pp: number;              // 过程性能指数
    ppk: number;             // 过程性能指数(考虑偏心)
    k: number;               // 偏移系数
    lsl: number;             // 下规格限
    usl: number;             // 上规格限
    cpm?: number;            // Taguchi过程能力指数
    within?: {               // 过程内部方差指标
        sigma: number;
        lowerZ: number;
        upperZ: number;
    };
    overall?: {              // 过程总体方差指标
        sigma: number;
        lowerZ: number;
        upperZ: number;
    };
    ppm?: {                  // 百万分之缺陷率
        expected: number;
        observed: number;
    };
}

// 控制图数据
export interface ControlChartData {
    means?: number[];         // 均值数据点
    ranges?: number[];        // 极差数据点
    uclMean?: number;         // 均值上控制限
    lclMean?: number;         // 均值下控制限
    clMean?: number;          // 均值中心线
    uclRange?: number;        // 极差上控制限
    lclRange?: number;        // 极差下控制限
    clRange?: number;         // 极差中心线
    isControlled: boolean;    // 过程是否受控

    // 添加兼容API文档的字段
    xbarChart?: {
        centerLine: number;
        upperControlLimit: number;
        lowerControlLimit: number;
        values: number[];
        outOfControlPoints: any[];
    };
    rChart?: {
        centerLine: number;
        upperControlLimit: number;
        lowerControlLimit: number;
        values: number[];
        outOfControlPoints: any[];
    };
}

// 过程评估结果
export interface ProcessAssessment {
    stabilityStatus: string; // 稳定性状态
    capabilityLevel: string; // 能力水平
    recommendations: string; // 建议
    performanceIndex?: number; // 性能指数
}

// 完整分析结果
export interface AnalysisResult {
    descriptiveStats: DescriptiveStats;
    groupStats: GroupStats;
    normalityTest: NormalityTest;
    meanTest: MeanTest;
    capabilityIndices: CapabilityIndices;
    controlChart: ControlChartData;
    processAssessment: ProcessAssessment;
    histogram: number[];     // 直方图数据
}

// API响应格式
export interface ApiResponse<T> {
    success: boolean;
    error?: string;
    data?: T;
    analysis?: AnalysisResult;
    stats?: {
        overall: DescriptiveStats;
        groups: GroupStats;
        histogram: number[];
    };
    message?: string;
    count?: number;
}

// 表格中展示的样本数据
export interface SampleData {
    key: string;
    group: number;
    values: number[];
    mean: number;
    range: number;
}
