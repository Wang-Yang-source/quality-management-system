import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
// 修改导入路径，添加.ts扩展名
import { chartVariants } from '../../utils/animation.ts';
import { ControlChartData } from '../../types';
import { Card, Typography, Skeleton, Badge, Space, Divider } from 'antd';
import * as echarts from 'echarts';

const { Title, Text, Paragraph } = Typography;

interface ControlChartProps {
    data: ControlChartData;
    title?: string;
    loading?: boolean;
}

const ControlChart: React.FC<ControlChartProps> = ({
    data,
    title = '控制图',
    loading = false
}) => {
    const [xBarOption, setXBarOption] = useState({});
    const [rangeOption, setRangeOption] = useState({});
    const [chartData, setChartData] = useState<ControlChartData | null>(null);

    // 处理不同格式的控制图数据
    useEffect(() => {
        if (!data) return;

        console.log('收到的控制图数据:', JSON.stringify(data, null, 2));

        try {
            let formattedData: ControlChartData | null = null;

            // 检查数据格式
            if (data.means && Array.isArray(data.means)) {
                // 已经是简单格式，直接使用
                formattedData = {
                    means: data.means,
                    ranges: Array.isArray(data.ranges) ? data.ranges : [],
                    clMean: typeof data.clMean === 'number' ? data.clMean : 0,
                    uclMean: typeof data.uclMean === 'number' ? data.uclMean : 0,
                    lclMean: typeof data.lclMean === 'number' ? data.lclMean : 0,
                    clRange: typeof data.clRange === 'number' ? data.clRange : 0,
                    uclRange: typeof data.uclRange === 'number' ? data.uclRange : 0,
                    lclRange: typeof data.lclRange === 'number' ? data.lclRange : 0,
                    isControlled: Boolean(data.isControlled)
                };
            } else if (data.xbarChart && data.rChart) {
                // 复杂格式，转换为简单格式
                formattedData = {
                    means: Array.isArray(data.xbarChart.values) ? data.xbarChart.values : [],
                    ranges: Array.isArray(data.rChart.values) ? data.rChart.values : [],
                    clMean: typeof data.xbarChart.centerLine === 'number' ? data.xbarChart.centerLine : 0,
                    uclMean: typeof data.xbarChart.upperControlLimit === 'number' ? data.xbarChart.upperControlLimit : 0,
                    lclMean: typeof data.xbarChart.lowerControlLimit === 'number' ? data.xbarChart.lowerControlLimit : 0,
                    clRange: typeof data.rChart.centerLine === 'number' ? data.rChart.centerLine : 0,
                    uclRange: typeof data.rChart.upperControlLimit === 'number' ? data.rChart.upperControlLimit : 0,
                    lclRange: typeof data.rChart.lowerControlLimit === 'number' ? data.rChart.lowerControlLimit : 0,
                    isControlled: Boolean(data.isControlled)
                };
            } else {
                // 尝试处理可能的其他格式
                console.warn('控制图数据格式不符合预期，尝试转换:', data);
                formattedData = {
                    means: Array.isArray(data.means) ? data.means : [],
                    ranges: Array.isArray(data.ranges) ? data.ranges : [],
                    clMean: 0,
                    uclMean: 0,
                    lclMean: 0,
                    clRange: 0,
                    uclRange: 0,
                    lclRange: 0,
                    isControlled: false
                };
            }

            // 设置处理后的数据
            setChartData(formattedData);
        } catch (error) {
            console.error('处理控制图数据时出错:', error);
        }
    }, [data]);

    // 生成X均值图配置
    useEffect(() => {
        if (!chartData || !chartData.means || chartData.means.length === 0) return;

        // 创建点颜色标识数组，标记超出控制线的点
        const pointColors = chartData.means.map((value, index) => {
            if (value > (chartData.uclMean ?? Number.POSITIVE_INFINITY) ||
                value < (chartData.lclMean ?? Number.NEGATIVE_INFINITY)) {
                return '#F56565'; // 红色标记超出控制限的点
            }
            return '#3182CE'; // 蓝色表示正常点
        });

        setXBarOption({
            title: {
                text: 'X-bar 均值控制图',
                left: 'center',
                textStyle: {
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    return `组 ${params[0].dataIndex + 1}<br/>均值: ${params[0].value.toFixed(3)}<br/>上控制限: ${chartData.uclMean?.toFixed(3) ?? 'N/A'}<br/>中心线: ${chartData.clMean?.toFixed(3) ?? 'N/A'}<br/>下控制限: ${chartData.lclMean?.toFixed(3) ?? 'N/A'}`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.means.map((_, index) => `组 ${index + 1}`),
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                name: '均值',
                scale: true
            },
            series: [
                {
                    name: '均值',
                    type: 'line',
                    data: chartData.means,
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        color: function (params: any) {
                            return pointColors[params.dataIndex];
                        }
                    },
                    lineStyle: {
                        width: 2
                    },
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        label: {
                            show: true,
                            position: 'end'
                        },
                        data: [
                            {
                                name: '上控制限',
                                yAxis: chartData.uclMean,
                                lineStyle: {
                                    color: '#E53E3E',
                                    type: 'dashed'
                                },
                                label: {
                                    formatter: 'UCL: {c}',
                                    color: '#E53E3E',
                                    fontWeight: 'bold'
                                }
                            },
                            {
                                name: '中心线',
                                yAxis: chartData.clMean,
                                lineStyle: {
                                    color: '#38A169'
                                },
                                label: {
                                    formatter: 'CL: {c}',
                                    color: '#38A169',
                                    fontWeight: 'bold'
                                }
                            },
                            {
                                name: '下控制限',
                                yAxis: chartData.lclMean,
                                lineStyle: {
                                    color: '#E53E3E',
                                    type: 'dashed'
                                },
                                label: {
                                    formatter: 'LCL: {c}',
                                    color: '#E53E3E',
                                    fontWeight: 'bold'
                                }
                            }
                        ]
                    },
                    // 添加动画效果
                    animationDelay: function (idx: number) {
                        return idx * 50;
                    }
                }
            ],
            // 全局动画配置
            animation: true,
            animationThreshold: 1000,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 500
        });
    }, [chartData]);

    // 生成极差图配置
    useEffect(() => {
        if (!chartData || !chartData.ranges || chartData.ranges.length === 0) return;

        // 创建点颜色标识数组，标记超出控制线的点
        const pointColors = chartData.ranges.map((value, index) => {
            if (value > (chartData.uclRange ?? Number.POSITIVE_INFINITY) ||
                value < (chartData.lclRange ?? Number.NEGATIVE_INFINITY)) {
                return '#F56565'; // 红色标记超出控制限的点
            }
            return '#3182CE'; // 蓝色表示正常点
        });

        setRangeOption({
            title: {
                text: 'R 极差控制图',
                left: 'center',
                textStyle: {
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    return `组 ${params[0].dataIndex + 1}<br/>极差: ${params[0].value.toFixed(3)}<br/>上控制限: ${chartData.uclRange?.toFixed(3) ?? 'N/A'}<br/>中心线: ${chartData.clRange?.toFixed(3) ?? 'N/A'}<br/>下控制限: ${chartData.lclRange?.toFixed(3) ?? 'N/A'}`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.ranges.map((_, index) => `组 ${index + 1}`),
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                name: '极差',
                scale: true
            },
            series: [
                {
                    name: '极差',
                    type: 'line',
                    data: chartData.ranges,
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        color: function (params: any) {
                            return pointColors[params.dataIndex];
                        }
                    },
                    lineStyle: {
                        width: 2
                    },
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        label: {
                            show: true,
                            position: 'end'
                        },
                        data: [
                            {
                                name: '上控制限',
                                yAxis: chartData.uclRange,
                                lineStyle: {
                                    color: '#E53E3E',
                                    type: 'dashed'
                                },
                                label: {
                                    formatter: 'UCL: {c}',
                                    color: '#E53E3E',
                                    fontWeight: 'bold'
                                }
                            },
                            {
                                name: '中心线',
                                yAxis: chartData.clRange,
                                lineStyle: {
                                    color: '#38A169'
                                },
                                label: {
                                    formatter: 'CL: {c}',
                                    color: '#38A169',
                                    fontWeight: 'bold'
                                }
                            },
                            {
                                name: '下控制限',
                                yAxis: chartData.lclRange,
                                lineStyle: {
                                    color: '#E53E3E',
                                    type: 'dashed'
                                },
                                label: {
                                    formatter: 'LCL: {c}',
                                    color: '#E53E3E',
                                    fontWeight: 'bold'
                                }
                            }
                        ]
                    },
                    // 添加动画效果
                    animationDelay: function (idx: number) {
                        // 在X-bar图之后延迟显示
                        return 1000 + idx * 50;
                    }
                }
            ],
            // 全局动画配置
            animation: true,
            animationThreshold: 1000,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 500
        });
    }, [chartData]);

    return (
        <motion.div
            variants={chartVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Card
                title={title}
                style={{ marginBottom: 16 }}
                extra={
                    <Space>
                        <Badge
                            status={chartData?.isControlled ? "success" : "error"}
                            text={chartData?.isControlled ? "过程受控" : "过程失控"}
                        />
                    </Space>
                }
            >
                {loading ? (
                    <Skeleton active paragraph={{ rows: 10 }} />
                ) : !chartData ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Text type="secondary">无法加载控制图数据</Text>
                    </div>
                ) : (
                    <>
                        <Paragraph>
                            <Text>控制图用于监控过程的稳定性，显示过程随时间的变化情况，并标识出特殊原因变异。</Text>
                        </Paragraph>

                        <ReactECharts
                            option={xBarOption}
                            style={{ height: 300 }}
                            className="control-chart"
                            opts={{ renderer: 'canvas' }}
                        />

                        <Divider style={{ margin: '12px 0' }} />

                        <ReactECharts
                            option={rangeOption}
                            style={{ height: 300 }}
                            className="control-chart"
                            opts={{ renderer: 'canvas' }}
                        />

                        <Divider style={{ margin: '12px 0' }} />

                        <div style={{ marginTop: 16 }}>
                            <Title level={5}>控制图解读</Title>
                            <Paragraph>
                                <ul>
                                    <li>
                                        <Text strong>过程状态：</Text>
                                        <Text type={chartData?.isControlled ? "success" : "danger"}>
                                            {chartData?.isControlled ? "过程处于统计受控状态" : "过程不处于统计受控状态"}
                                        </Text>
                                    </li>
                                    <li>
                                        <Text strong>均值控制图：</Text>
                                        <Text>监控组均值的变化，显示过程的中心位置是否稳定</Text>
                                    </li>
                                    <li>
                                        <Text strong>极差控制图：</Text>
                                        <Text>监控组内数据变异的大小，显示过程的离散程度是否稳定</Text>
                                    </li>
                                    {!chartData?.isControlled && (
                                        <li>
                                            <Text strong type="danger">建议行动：</Text>
                                            <Text>识别并消除特殊原因变异，红色数据点表示超出控制限的异常点</Text>
                                        </li>
                                    )}
                                </ul>
                            </Paragraph>
                        </div>
                    </>
                )}
            </Card>
        </motion.div >
    );
};

export default ControlChart;
