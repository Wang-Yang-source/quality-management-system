import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
// 修改导入路径，添加.ts扩展名
import { chartVariants } from '../../utils/animation.ts';
import { CapabilityIndices, DescriptiveStats } from '../../types';
import { Card, Typography, Skeleton, Row, Col, Statistic, Divider, Tag, Alert } from 'antd';
import * as echarts from 'echarts';

const { Title, Text, Paragraph } = Typography;

interface CapabilityAnalysisProps {
    indices: CapabilityIndices;
    stats?: DescriptiveStats;
    title?: string;
    loading?: boolean;
}

const CapabilityAnalysis: React.FC<CapabilityAnalysisProps> = ({
    indices,
    stats,
    title = '过程能力分析',
    loading = false
}) => {
    const [option, setOption] = useState({});
    const [processedIndices, setProcessedIndices] = useState<CapabilityIndices | null>(null);
    const [processedStats, setProcessedStats] = useState<DescriptiveStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 处理输入数据，确保类型安全
    useEffect(() => {
        try {
            console.log('能力分析接收的数据:', JSON.stringify({ indices, stats }, null, 2));

            if (!indices) {
                setError('未提供过程能力指数数据');
                return;
            }

            // 处理能力指数数据，确保类型安全
            const safeIndices: CapabilityIndices = {
                cp: typeof indices.cp === 'number' ? indices.cp : 0,
                cpk: typeof indices.cpk === 'number' ? indices.cpk : 0,
                pp: typeof indices.pp === 'number' ? indices.pp : 0,
                ppk: typeof indices.ppk === 'number' ? indices.ppk : 0,
                lsl: typeof indices.lsl === 'number' ? indices.lsl : 0,
                usl: typeof indices.usl === 'number' ? indices.usl : 0,
                cpl: typeof indices.cpl === 'number' ? indices.cpl : 0,
                cpu: typeof indices.cpu === 'number' ? indices.cpu : 0,
                k: typeof indices.k === 'number' ? indices.k : 0,
            };

            setProcessedIndices(safeIndices);

            // 处理统计数据，如果提供了的话
            if (stats) {
                const safeStats: DescriptiveStats = {
                    count: typeof stats.count === 'number' ? stats.count : 0,
                    mean: typeof stats.mean === 'number' ? stats.mean : 0,
                    median: typeof stats.median === 'number' ? stats.median : 0,
                    minimum: typeof stats.minimum === 'number' ? stats.minimum : (typeof stats.min === 'number' ? stats.min : 0),
                    maximum: typeof stats.maximum === 'number' ? stats.maximum : (typeof stats.max === 'number' ? stats.max : 0),
                    range: typeof stats.range === 'number' ? stats.range : 0,
                    variance: typeof stats.variance === 'number' ? stats.variance : 0,
                    standardDeviation: typeof stats.standardDeviation === 'number' ? stats.standardDeviation :
                        (typeof stats.stdDev === 'number' ? stats.stdDev : 0),
                    q1: typeof stats.q1 === 'number' ? stats.q1 : 0,
                    q3: typeof stats.q3 === 'number' ? stats.q3 : 0,
                    min: typeof stats.min === 'number' ? stats.min : (typeof stats.minimum === 'number' ? stats.minimum : 0),
                    max: typeof stats.max === 'number' ? stats.max : (typeof stats.maximum === 'number' ? stats.maximum : 0),
                    stdDev: typeof stats.stdDev === 'number' ? stats.stdDev :
                        (typeof stats.standardDeviation === 'number' ? stats.standardDeviation : 0)
                };

                setProcessedStats(safeStats);
            } else {
                setProcessedStats(null);
            }

            setError(null); // 清除错误
        } catch (err) {
            console.error('处理能力分析数据时出错:', err);
            setError('处理数据时出错');
        }
    }, [indices, stats]);

    // 基于Cpk值返回能力级别和颜色
    const getCapabilityLevel = (cpk: number) => {
        if (cpk >= 1.67) return { level: '优秀', color: '#38A169', description: '过程能力极佳，完全满足客户要求' };
        if (cpk >= 1.33) return { level: '良好', color: '#68D391', description: '过程能力很好，能满足客户要求' };
        if (cpk >= 1.00) return { level: '合格', color: '#F6E05E', description: '过程能力满足最低要求，需关注持续改进' };
        if (cpk >= 0.67) return { level: '不足', color: '#F6AD55', description: '过程能力不足，需要改进' };
        return { level: '差', color: '#F56565', description: '过程能力极差，急需改进' };
    };

    // 生成过程能力分析图表
    useEffect(() => {
        if (processedIndices && processedStats && processedStats.mean !== undefined && processedStats.standardDeviation !== undefined) {
            const { mean, standardDeviation } = processedStats;
            const { lsl, usl } = processedIndices;

            // 准备图表数据
            // 生成正态分布数据点
            const normalPoints: [number, number][] = [];
            const min = Math.min(lsl - 3 * standardDeviation, mean - 4 * standardDeviation);
            const max = Math.max(usl + 3 * standardDeviation, mean + 4 * standardDeviation);
            const range = max - min;
            const step = range / 200;

            // 计算正态分布概率密度函数
            const normalPDF = (x: number, mean: number, stdDev: number) => {
                const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
                return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
            };

            // 生成正态分布曲线的数据点
            for (let x = min; x <= max; x += step) {
                normalPoints.push([x, normalPDF(x, mean, standardDeviation)]);
            }

            // 创建规格限区域
            const markArea: any[] = [];
            if (lsl !== undefined && usl !== undefined) {
                markArea.push([
                    { xAxis: lsl, itemStyle: { color: 'rgba(255, 0, 0, 0.1)' } },
                    { xAxis: min }
                ]);
                markArea.push([
                    { xAxis: usl, itemStyle: { color: 'rgba(255, 0, 0, 0.1)' } },
                    { xAxis: max }
                ]);
            }

            setOption({
                // ... 保持之前的图表配置代码不变 ...
                title: {
                    text: '过程能力分布图',
                    left: 'center',
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    },
                    formatter: function (params: any) {
                        const x = params[0].data[0].toFixed(2);
                        const y = params[0].data[1].toFixed(6);
                        return `值: ${x}<br/>密度: ${y}`;
                    }
                },
                legend: {
                    data: ['过程分布'],
                    bottom: 0
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    top: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    name: '测量值',
                    axisLabel: {
                        formatter: '{value}'
                    },
                    axisLine: {
                        onZero: false
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '密度',
                    axisLabel: {
                        formatter: '{value}'
                    },
                    scale: true
                },
                series: [
                    {
                        name: '过程分布',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        sampling: 'average',
                        itemStyle: {
                            color: '#1890ff'
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(24, 144, 255, 0.7)' },
                                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
                            ])
                        },
                        data: normalPoints,
                        markLine: {
                            silent: true,
                            symbol: 'none',
                            lineStyle: {
                                type: 'solid'
                            },
                            label: {
                                show: true,
                                position: 'middle',
                                formatter: '{b}',
                                fontSize: 10
                            },
                            data: [
                                {
                                    name: 'LSL',
                                    xAxis: lsl,
                                    lineStyle: { color: '#F56565' },
                                    label: {
                                        formatter: `LSL: ${lsl}`,
                                        color: '#F56565'
                                    }
                                },
                                {
                                    name: '均值',
                                    xAxis: mean,
                                    lineStyle: { color: '#38A169' },
                                    label: {
                                        formatter: `均值: ${mean.toFixed(2)}`,
                                        color: '#38A169'
                                    }
                                },
                                {
                                    name: 'USL',
                                    xAxis: usl,
                                    lineStyle: { color: '#F56565' },
                                    label: {
                                        formatter: `USL: ${usl}`,
                                        color: '#F56565'
                                    }
                                },
                                {
                                    name: '-3σ',
                                    xAxis: mean - 3 * standardDeviation,
                                    lineStyle: { color: '#718096', type: 'dashed' },
                                    label: {
                                        formatter: `-3σ`,
                                        color: '#718096'
                                    }
                                },
                                {
                                    name: '+3σ',
                                    xAxis: mean + 3 * standardDeviation,
                                    lineStyle: { color: '#718096', type: 'dashed' },
                                    label: {
                                        formatter: `+3σ`,
                                        color: '#718096'
                                    }
                                }
                            ]
                        },
                        markArea: {
                            silent: true,
                            itemStyle: {
                                opacity: 0.3
                            },
                            data: markArea
                        },
                        // 设置动画效果
                        animationDuration: 2000,
                        animationEasing: 'elasticOut'
                    }
                ]
            });
        }
    }, [processedIndices, processedStats]);

    const cpkLevel = processedIndices ? getCapabilityLevel(processedIndices.cpk) : { level: '未知', color: '#718096', description: '未能获取能力指数数据' };

    return (
        <motion.div
            variants={chartVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Card title={title} style={{ marginBottom: 16 }}>
                {loading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                ) : error ? (
                    <Alert message="错误" description={error} type="error" showIcon />
                ) : !processedIndices ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Text type="secondary">无法加载过程能力分析数据</Text>
                    </div>
                ) : (
                    <>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                >
                                    <Statistic
                                        title="过程能力指数 (Cp)"
                                        value={processedIndices.cp}
                                        precision={2}
                                        suffix={
                                            <Tag color={processedIndices.cp >= 1.33 ? 'green' : processedIndices.cp >= 1.0 ? 'orange' : 'red'}>
                                                {processedIndices.cp >= 1.33 ? '良好' : processedIndices.cp >= 1.0 ? '合格' : '不足'}
                                            </Tag>
                                        }
                                    />
                                </motion.div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <Statistic
                                        title="过程能力指数 (Cpk)"
                                        value={processedIndices.cpk}
                                        precision={2}
                                        valueStyle={{ color: cpkLevel.color }}
                                        suffix={
                                            <Tag color={cpkLevel.color}>
                                                {cpkLevel.level}
                                            </Tag>
                                        }
                                    />
                                </motion.div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <Statistic
                                        title="过程性能指数 (Pp)"
                                        value={processedIndices.pp}
                                        precision={2}
                                    />
                                </motion.div>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                >
                                    <Statistic
                                        title="过程性能指数 (Ppk)"
                                        value={processedIndices.ppk}
                                        precision={2}
                                    />
                                </motion.div>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '16px 0' }} />

                        {processedStats ? (
                            <ReactECharts
                                option={option}
                                style={{ height: 400 }}
                                className="capability-chart"
                                opts={{ renderer: 'canvas' }}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0', height: 400 }}>
                                <Text type="secondary">缺少统计数据，无法生成分布图</Text>
                            </div>
                        )}

                        <Divider style={{ margin: '16px 0' }} />

                        <div>
                            <Title level={5}>过程能力评估</Title>
                            <Paragraph>
                                <ul>
                                    <li>
                                        <Text strong>能力水平：</Text>
                                        <Text style={{ color: cpkLevel.color }}>
                                            {cpkLevel.level} (Cpk = {processedIndices.cpk.toFixed(2)})
                                        </Text>
                                    </li>
                                    <li>
                                        <Text strong>评估结论：</Text>
                                        <Text>{cpkLevel.description}</Text>
                                    </li>
                                    <li>
                                        <Text strong>规格限范围：</Text>
                                        <Text>下限 (LSL) = {processedIndices.lsl}，上限 (USL) = {processedIndices.usl}</Text>
                                    </li>
                                    {processedIndices.cpk < 1.0 && (
                                        <li>
                                            <Text strong style={{ color: '#F56565' }}>改进建议：</Text>
                                            <Text>
                                                {processedIndices.cp >= 1.0
                                                    ? '过程有能力但不居中，需要调整过程平均值使其更接近规格中心'
                                                    : '过程变异过大，需要减小过程标准差以提高能力指数'}
                                            </Text>
                                        </li>
                                    )}
                                </ul>
                            </Paragraph>
                        </div>
                    </>
                )}
            </Card>
        </motion.div>
    );
};

export default CapabilityAnalysis;
