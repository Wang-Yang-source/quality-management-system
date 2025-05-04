import axios from 'axios';
import {
    ApiResponse,
    AnalysisResult,
    DescriptiveStats,
    NormalityTest,
    CapabilityIndices,
    ControlChartData,
    ProcessAssessment
} from '../types';

// 配置API基础URL
const API_BASE_URL = 'http://localhost:3001';

// 是否使用模拟数据（当后端服务不可用时）
const USE_MOCK_DATA = false;

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 生成模拟数据
export const generateSampleData = async (
    groups: number = 25,
    samplesPerGroup: number = 5,
    mean: number = 100,
    stddev: number = 10
): Promise<ApiResponse<number[][]>> => {
    if (USE_MOCK_DATA) {
        // 生成模拟样本数据
        const mockData: number[][] = [];
        for (let g = 0; g < groups; g++) {
            const groupData: number[] = [];
            for (let s = 0; s < samplesPerGroup; s++) {
                // 简单的正态分布随机数生成
                let u = 0, v = 0;
                while (u === 0) u = Math.random();
                while (v === 0) v = Math.random();
                const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                const value = mean + z * stddev;
                groupData.push(Number(value.toFixed(2)));
            }
            mockData.push(groupData);
        }
        return {
            success: true,
            data: mockData
        };
    }

    try {
        const response = await apiClient.post('/generate-data', {
            groups,
            samplesPerGroup,
            mean,
            stddev
        });
        return response.data;
    } catch (error) {
        console.error('生成数据失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// 导入数据
export const importData = async (data: number[][]): Promise<ApiResponse<void>> => {
    if (USE_MOCK_DATA) {
        return { success: true };
    }

    try {
        const response = await apiClient.post('/import-data', { data });
        return response.data;
    } catch (error) {
        console.error('导入数据失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// 获取描述性统计分析
export const getDescriptiveStats = async (): Promise<ApiResponse<{
    overall: DescriptiveStats;
    groups: DescriptiveStats;
    histogram: number[];
}>> => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                overall: {
                    count: 125,
                    mean: 100.12,
                    median: 100.31,
                    min: 84.52,
                    max: 115.73,
                    range: 31.21,
                    variance: 25.3,
                    stdDev: 5.03,
                    q1: 96.84,
                    q3: 103.29,
                    standardDeviation: 5.03,
                    minimum: 84.52,
                    maximum: 115.73
                },
                groups: {
                    count: 25,
                    mean: 100.12,
                    median: 100.08,
                    min: 96.71,
                    max: 103.42,
                    range: 6.71,
                    variance: 2.24,
                    stdDev: 1.5,
                    q1: 99.05,
                    q3: 101.19,
                    standardDeviation: 1.5,
                    minimum: 96.71,
                    maximum: 103.42
                },
                histogram: [2, 5, 12, 18, 25, 22, 19, 12, 7, 3]
            }
        };
    }

    try {
        const response = await apiClient.post('/descriptive-stats', {});
        return response.data;
    } catch (error) {
        console.error('获取描述性统计分析失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// 进行正态性检验
export const testNormality = async (): Promise<ApiResponse<NormalityTest>> => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                testMethod: 'Anderson-Darling检验',
                statistic: 0.321,
                pValue: 0.532,
                isNormal: true,
                conclusion: '数据符合正态分布(p > 0.05)'
            }
        };
    }

    try {
        const response = await apiClient.post('/normality-test', {});
        return response.data;
    } catch (error) {
        console.error('正态性检验失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// 进行均值检验
export const testMean = async (
    expectedMean: number = 100,
    alpha: number = 0.05
): Promise<ApiResponse<{
    sampleMean: number;
    expectedMean: number;
    alpha: number;
    testResult: boolean;
    conclusion: string;
}>> => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                sampleMean: 100.12,
                expectedMean,
                alpha,
                testResult: true,
                conclusion: '样本均值与目标均值无显著差异(p > 0.05)'
            }
        };
    }

    try {
        const response = await apiClient.post('/mean-test', {
            expectedMean,
            alpha
        });
        return response.data;
    } catch (error) {
        console.error('均值检验失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// 计算过程能力指数
export const calculateCapabilityIndices = async (
    lsl: number = 70,
    usl: number = 130
): Promise<ApiResponse<CapabilityIndices>> => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                lsl,
                usl,
                cp: 1.32,
                cpk: 1.29,
                cpm: 1.31,
                pp: 1.28,
                ppk: 1.25,
                within: {
                    sigma: 5.03,
                    lowerZ: 3.10,
                    upperZ: 3.12
                },
                overall: {
                    sigma: 5.18,
                    lowerZ: 3.01,
                    upperZ: 3.04
                },
                ppm: {
                    expected: 850,
                    observed: 0
                },
                cpl: 1.25,
                cpu: 1.35,
                k: 0.98
            }
        };
    }

    try {
        const response = await apiClient.post('/capability-indices', {
            lsl,
            usl
        });
        return response.data;
    } catch (error) {
        console.error('计算过程能力指数失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// 生成控制图数据
export const generateControlChartData = async (): Promise<ApiResponse<ControlChartData>> => {
    if (USE_MOCK_DATA) {
        const groups = 25;
        const mockData: ControlChartData = {
            isControlled: true,
            xbarChart: {
                centerLine: 100.12,
                upperControlLimit: 103.42,
                lowerControlLimit: 96.82,
                values: Array(groups).fill(0).map((_, i) => 98 + Math.random() * 4),
                outOfControlPoints: []
            },
            rChart: {
                centerLine: 6.73,
                upperControlLimit: 14.22,
                lowerControlLimit: 0,
                values: Array(groups).fill(0).map(() => 3 + Math.random() * 7),
                outOfControlPoints: []
            }
        };

        return {
            success: true,
            data: mockData
        };
    }

    try {
        const response = await apiClient.post('/control-chart', {});

        // 后端返回数据格式转换为前端组件需要的格式
        if (response.data.success && response.data.data) {
            const backendData = response.data.data;

            // 检查后端数据格式并进行必要的转换
            const formattedData: ControlChartData = {
                isControlled: backendData.isControlled || false,
                means: backendData.means || [],
                ranges: backendData.ranges || [],
                clMean: typeof backendData.clMean === 'number' ? backendData.clMean : 0,
                uclMean: typeof backendData.uclMean === 'number' ? backendData.uclMean : 0,
                lclMean: typeof backendData.lclMean === 'number' ? backendData.lclMean : 0,
                clRange: typeof backendData.clRange === 'number' ? backendData.clRange : 0,
                uclRange: typeof backendData.uclRange === 'number' ? backendData.uclRange : 0,
                lclRange: typeof backendData.lclRange === 'number' ? backendData.lclRange : 0
            };

            return {
                success: true,
                data: formattedData
            };
        }

        return response.data;
    } catch (error) {
        console.error('生成控制图数据失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// 获取过程评估
export const getProcessAssessment = async (
    lsl: number = 70,
    usl: number = 130
): Promise<ApiResponse<ProcessAssessment & {
    isControlled: boolean;
    cp: number;
    cpk: number;
}>> => {
    if (USE_MOCK_DATA) {
        return {
            success: true,
            data: {
                isControlled: true,
                cp: 1.32,
                cpk: 1.29,
                stabilityStatus: '过程稳定',
                capabilityLevel: '过程能力充分',
                performanceIndex: 95,
                recommendations: '持续监控过程，保持稳定运行'
            }
        };
    }

    try {
        const response = await apiClient.post('/process-assessment', {
            lsl,
            usl
        });
        return response.data;
    } catch (error) {
        console.error('获取过程评估失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// 获取全部分析结果
export const getAllAnalysis = async (
    lsl: number = 70,
    usl: number = 130,
    expectedMean: number = 100
): Promise<ApiResponse<{
    analysis: AnalysisResult
}>> => {
    if (USE_MOCK_DATA) {
        // 创建模拟的分析结果
        const mockAnalysis: AnalysisResult = {
            descriptiveStats: {
                count: 125,
                mean: 100.12,
                median: 100.31,
                min: 84.52,
                max: 115.73,
                range: 31.21,
                variance: 25.3,
                stdDev: 5.03,
                q1: 96.84,
                q3: 103.29,
                standardDeviation: 5.03,
                minimum: 84.52,
                maximum: 115.73
            },
            groupStats: {
                count: 25,
                mean: 100.12,
                median: 100.08,
                min: 96.71,
                max: 103.42,
                range: 6.71,
                variance: 2.24,
                stdDev: 1.5,
                standardDeviation: 1.5,
                q1: 99.05,
                q3: 101.19,
                minimum: 96.71,
                maximum: 103.42
            },
            histogram: [2, 5, 12, 18, 25, 22, 19, 12, 7, 3],
            normalityTest: {
                testMethod: 'Anderson-Darling检验',
                statistic: 0.321,
                pValue: 0.532,
                isNormal: true,
                conclusion: '数据符合正态分布(p > 0.05)'
            },
            meanTest: {
                sampleMean: 100.12,
                expectedMean: 100,
                alpha: 0.05,
                testResult: true,
                conclusion: '样本均值与目标均值无显著差异(p > 0.05)'
            },
            controlChart: {
                isControlled: true,
                xbarChart: {
                    centerLine: 100.12,
                    upperControlLimit: 103.42,
                    lowerControlLimit: 96.82,
                    values: Array(25).fill(0).map((_, i) => 98 + Math.random() * 4),
                    outOfControlPoints: []
                },
                rChart: {
                    centerLine: 6.73,
                    upperControlLimit: 14.22,
                    lowerControlLimit: 0,
                    values: Array(25).fill(0).map(() => 3 + Math.random() * 7),
                    outOfControlPoints: []
                }
            },
            capabilityIndices: {
                lsl,
                usl,
                cp: 1.32,
                cpk: 1.29,
                cpm: 1.31,
                pp: 1.28,
                ppk: 1.25,
                cpl: 1.25,
                cpu: 1.35,
                k: 0.98,
                within: {
                    sigma: 5.03,
                    lowerZ: 3.10,
                    upperZ: 3.12
                },
                overall: {
                    sigma: 5.18,
                    lowerZ: 3.01,
                    upperZ: 3.04
                },
                ppm: {
                    expected: 850,
                    observed: 0
                }
            },
            processAssessment: {
                stabilityStatus: '过程稳定',
                capabilityLevel: '过程能力充分',
                performanceIndex: 95,
                recommendations: '持续监控过程，保持稳定运行'
            }
        };

        // 返回与API文档一致的结构，包含analysis字段
        return {
            success: true,
            analysis: mockAnalysis
        };
    }

    try {
        const response = await apiClient.post('/all-analysis', {
            lsl,
            usl,
            expectedMean
        });

        // 确保控制图数据格式正确
        if (response.data.success && response.data.analysis && response.data.analysis.controlChart) {
            const controlChartData = response.data.analysis.controlChart;
            const backendFormat = controlChartData.means !== undefined;

            if (backendFormat) {
                // 后端格式已经是我们需要的格式，但仍需确保数值类型正确
                response.data.analysis.controlChart = {
                    isControlled: Boolean(controlChartData.isControlled),
                    means: Array.isArray(controlChartData.means) ? controlChartData.means : [],
                    ranges: Array.isArray(controlChartData.ranges) ? controlChartData.ranges : [],
                    clMean: typeof controlChartData.clMean === 'number' ? controlChartData.clMean : 0,
                    uclMean: typeof controlChartData.uclMean === 'number' ? controlChartData.uclMean : 0,
                    lclMean: typeof controlChartData.lclMean === 'number' ? controlChartData.lclMean : 0,
                    clRange: typeof controlChartData.clRange === 'number' ? controlChartData.clRange : 0,
                    uclRange: typeof controlChartData.uclRange === 'number' ? controlChartData.uclRange : 0,
                    lclRange: typeof controlChartData.lclRange === 'number' ? controlChartData.lclRange : 0
                };
            } else if (controlChartData.xbarChart && controlChartData.rChart) {
                // 转换数据格式
                const xbarChart = controlChartData.xbarChart;
                const rChart = controlChartData.rChart;

                response.data.analysis.controlChart = {
                    means: Array.isArray(xbarChart.values) ? xbarChart.values : [],
                    ranges: Array.isArray(rChart.values) ? rChart.values : [],
                    clMean: typeof xbarChart.centerLine === 'number' ? xbarChart.centerLine : 0,
                    uclMean: typeof xbarChart.upperControlLimit === 'number' ? xbarChart.upperControlLimit : 0,
                    lclMean: typeof xbarChart.lowerControlLimit === 'number' ? xbarChart.lowerControlLimit : 0,
                    clRange: typeof rChart.centerLine === 'number' ? rChart.centerLine : 0,
                    uclRange: typeof rChart.upperControlLimit === 'number' ? rChart.upperControlLimit : 0,
                    lclRange: typeof rChart.lowerControlLimit === 'number' ? rChart.lowerControlLimit : 0,
                    isControlled: Boolean(controlChartData.isControlled)
                };
            }
        }

        // 直接返回API响应，它已经包含了analysis字段
        return response.data;
    } catch (error) {
        console.error('获取全部分析结果失败:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        };
    }
};
