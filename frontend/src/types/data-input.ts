// 样本数据生成与规格限设置类型定义

// 样本数据生成参数
export interface SampleGenerationParams {
    groups: number;          // 数据组数，默认为25
    samplesPerGroup: number; // 每组样本数，默认为5
    mean: number;            // 目标均值，默认为100
    stddev: number;          // 目标标准差
}

// 规格限设置
export interface SpecificationLimits {
    lsl: number;             // 下规格限(LSL)
    usl: number;             // 上规格限(USL)
    expectedMean: number;    // 期望总体均值
    alpha?: number;          // 显著性水平，默认为0.05
}

// 组合所有输入参数
export interface ProcessAnalysisParams {
    sampleParams: SampleGenerationParams;
    specLimits: SpecificationLimits;
}
