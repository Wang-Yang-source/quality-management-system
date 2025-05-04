import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
// 修改导入路径，添加.ts扩展名
import { chartVariants } from '../../utils/animation.ts';
import { DescriptiveStats } from '../../types';
import { Card, Typography, Skeleton } from 'antd';

const { Title, Text } = Typography;

interface HistogramProps {
    histogramData: number[];
    stats?: DescriptiveStats;
    title?: string;
    height?: number;
    loading?: boolean;
}

const Histogram: React.FC<HistogramProps> = ({
    histogramData,
    stats,
    title = '数据分布直方图',
    height = 400,
    loading = false
}) => {
    const [option, setOption] = useState({});

    useEffect(() => {
        if (histogramData && histogramData.length > 0) {
            // 计算直方图的区间
            const binCount = histogramData.length;
            const binLabels: string[] = [];

            // 如果提供了统计信息，可以根据最大最小值确定区间范围
            if (stats) {
                const binWidth = (stats.maximum - stats.minimum) / binCount;
                for (let i = 0; i < binCount; i++) {
                    const start = stats.minimum + i * binWidth;
                    const end = stats.minimum + (i + 1) * binWidth;
                    binLabels.push(`${start.toFixed(2)}-${end.toFixed(2)}`);
                }
            } else {
                // 没有统计信息时使用默认标签
                for (let i = 0; i < binCount; i++) {
                    binLabels.push(`区间 ${i + 1}`);
                }
            }

            // 设置ECharts选项
            setOption({
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: function (params: any) {
                        const dataIndex = params[0].dataIndex;
                        return `${binLabels[dataIndex]}: ${params[0].value}`;
                    }
                },
                xAxis: {
                    type: 'category',
                    data: binLabels,
                    axisLabel: {
                        rotate: 45,
                        interval: 0,
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '频数'
                },
                series: [
                    {
                        name: '频数',
                        type: 'bar',
                        data: histogramData,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#83bff6' },
                                { offset: 0.5, color: '#188df0' },
                                { offset: 1, color: '#188df0' }
                            ])
                        },
                        emphasis: {
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: '#2378f7' },
                                    { offset: 0.7, color: '#2378f7' },
                                    { offset: 1, color: '#83bff6' }
                                ])
                            }
                        },
                        barWidth: '60%',
                        // 添加动画配置
                        animationDelay: function (idx: number) {
                            return idx * 100;
                        }
                    }
                ],
                // 动画设置
                animationEasing: 'elasticOut',
                animationDelayUpdate: function (idx: number) {
                    return idx * 5;
                }
            });
        }
    }, [histogramData, stats]);

    // 添加正态分布曲线
    useEffect(() => {
        if (stats && histogramData.length > 0) {
            const { mean, standardDeviation } = stats;

            // 如果有足够的信息来绘制正态分布曲线
            if (mean !== undefined && standardDeviation !== undefined) {
                // 创建正态分布数据点
                const normalPoints: [number, number][] = [];
                const binCount = histogramData.length;
                const min = stats.minimum;
                const max = stats.maximum;
                const range = max - min;
                const step = range / 100;

                // 计算正态分布概率密度函数
                const normalPDF = (x: number, mean: number, stdDev: number) => {
                    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
                    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
                };

                // 生成正态分布曲线的数据点
                for (let x = min; x <= max; x += step) {
                    normalPoints.push([x, normalPDF(x, mean, standardDeviation) * Math.max(...histogramData) * standardDeviation * 2.5]);
                }

                // 更新图表配置，添加正态分布曲线
                setOption((prevOption: any) => ({
                    ...prevOption,
                    series: [
                        ...(prevOption.series || []),
                        {
                            name: '正态分布',
                            type: 'line',
                            smooth: true,
                            symbol: 'none',
                            sampling: 'average',
                            itemStyle: {
                                color: '#FF4500'
                            },
                            data: normalPoints,
                            z: 2
                        }
                    ]
                }));
            }
        }
    }, [histogramData, stats]);

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
                ) : (
                    <>
                        {stats && (
                            <div style={{ marginBottom: 16 }}>
                                <Text style={{ marginRight: 16 }}>
                                    均值: <Text strong>{stats.mean.toFixed(2)}</Text>
                                </Text>
                                <Text style={{ marginRight: 16 }}>
                                    标准差: <Text strong>{stats.standardDeviation.toFixed(2)}</Text>
                                </Text>
                                <Text>
                                    范围: <Text strong>{stats.minimum.toFixed(2)} - {stats.maximum.toFixed(2)}</Text>
                                </Text>
                            </div>
                        )}
                        <ReactECharts
                            option={option}
                            style={{ height: `${height}px` }}
                            className="histogram-chart"
                            opts={{ renderer: 'canvas' }}
                        />
                    </>
                )}
            </Card>
        </motion.div>
    );
};

export default Histogram;
