import React, { useState, useEffect } from 'react';
import {
    Layout,
    Typography,
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Space,
    Tabs,
    Table,
    notification,
    Divider,
    Spin,
    Result,
    Row,
    Col,
    List,
    message,
    Tag
} from 'antd';
import {
    ReloadOutlined,
    BarChartOutlined,
    LineChartOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    FileExcelOutlined,
    SettingOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
// 使用相对路径确保导入
import { pageVariants, listContainerVariants, listVariants, cardVariants } from '../utils/animation.ts';

// 导入图表组件 - 添加.tsx扩展名确保文件能被正确找到
import Histogram from '../components/charts/Histogram.tsx';
import ControlChart from '../components/charts/ControlChart.tsx';
import CapabilityAnalysis from '../components/charts/CapabilityAnalysis.tsx';

// 导入API服务
import * as api from '../services/api.ts';

// 导入类型定义
import {
    AnalysisResult,
    SampleData,
    DescriptiveStats,
    NormalityTest,
    CapabilityIndices,
    ControlChartData,
    ProcessAssessment
} from '../types';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
    // 状态定义
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<SampleData[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [dataGenerated, setDataGenerated] = useState<boolean>(false);
    const [activeKey, setActiveKey] = useState<string>('data');

    // 表格列定义
    const columns = [
        {
            title: '组号',
            dataIndex: 'group',
            key: 'group',
            width: 80,
        },
        {
            title: '样本数据',
            dataIndex: 'values',
            key: 'values',
            render: (values: number[]) => (
                <span>{values.map(val => val.toFixed(2)).join(', ')}</span>
            ),
        },
        {
            title: '均值',
            dataIndex: 'mean',
            key: 'mean',
            width: 100,
            render: (val: number) => val.toFixed(3),
        },
        {
            title: '极差',
            dataIndex: 'range',
            key: 'range',
            width: 100,
            render: (val: number) => val.toFixed(3),
        },
    ];

    // 生成样本数据
    const generateData = async (values: any) => {
        try {
            setLoading(true);
            const { groups, samplesPerGroup, mean, stddev } = values;

            const response = await api.generateSampleData(groups, samplesPerGroup, mean, stddev);

            if (response.success && response.data) {
                // 格式化数据源用于表格展示
                const formattedData: SampleData[] = response.data.map((group, idx) => {
                    const groupMean = group.reduce((sum, val) => sum + val, 0) / group.length;
                    const groupRange = Math.max(...group) - Math.min(...group);
                    return {
                        key: `group-${idx}`,
                        group: idx + 1,
                        values: group,
                        mean: groupMean,
                        range: groupRange,
                    };
                });

                setDataSource(formattedData);
                setDataGenerated(true);

                // 获取完整的分析结果
                await performFullAnalysis(values.lsl, values.usl, values.expectedMean);

                // 切换到数据标签页
                setActiveKey('data');

                notification.success({
                    message: '数据生成成功',
                    description: `已生成 ${groups} 组数据，每组 ${samplesPerGroup} 个样本`,
                    placement: 'topRight',
                });
            } else {
                message.error(response.error || '数据生成失败');
            }
        } catch (error) {
            console.error('数据生成错误:', error);
            message.error('生成样本数据时发生错误');
        } finally {
            setLoading(false);
        }
    };

    // 执行完整分析
    const performFullAnalysis = async (lsl: number, usl: number, expectedMean: number) => {
        try {
            setLoading(true);
            const response = await api.getAllAnalysis(lsl, usl, expectedMean);

            if (response.success && response.analysis) {
                setAnalysisResult(response.analysis);
            } else {
                message.error(response.error || '获取分析结果失败');
            }
        } catch (error) {
            console.error('分析错误:', error);
            message.error('执行数据分析时发生错误');
        } finally {
            setLoading(false);
        }
    };

    // 格式化渲染总结论
    const renderConclusion = () => {
        if (!analysisResult) return null;

        const { processAssessment, normalityTest, capabilityIndices } = analysisResult;
        const isNormal = normalityTest.isNormal;
        const isControlled = analysisResult.controlChart.isControlled;
        const isCpkGood = capabilityIndices.cpk >= 1.0;

        // 总体状态评定
        const overallStatus = isControlled && isCpkGood ? 'success' : 'warning';

        return (
            <Card className="conclusion-card">
                <Result
                    status={overallStatus as "success" | "warning"}
                    title="过程质量评估结论"
                    subTitle={`分析日期: ${new Date().toLocaleDateString()}`}
                />

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card
                                title="过程稳定性"
                                size="small"
                                className="status-card"
                                bordered={false}
                            >
                                <Space direction="vertical">
                                    <Space>
                                        {isControlled ? (
                                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                        ) : (
                                            <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
                                        )}
                                        <Text strong>{processAssessment.stabilityStatus}</Text>
                                    </Space>
                                    <Text type="secondary">
                                        {isControlled
                                            ? '过程变异仅存在共同原因变异，过程表现可预测'
                                            : '存在特殊原因变异，需要识别并消除不稳定因素'}
                                    </Text>
                                </Space>
                            </Card>
                        </motion.div>
                    </Col>

                    <Col xs={24} md={8}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card
                                title="过程能力"
                                size="small"
                                className="status-card"
                                bordered={false}
                            >
                                <Space direction="vertical">
                                    <Space>
                                        {isCpkGood ? (
                                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                        ) : (
                                            <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
                                        )}
                                        <Text strong>{processAssessment.capabilityLevel}</Text>
                                    </Space>
                                    <Text type="secondary">
                                        Cpk = {capabilityIndices.cpk.toFixed(2)},
                                        {isCpkGood
                                            ? ' 过程能够满足规格要求'
                                            : ' 过程不能稳定满足规格要求'}
                                    </Text>
                                </Space>
                            </Card>
                        </motion.div>
                    </Col>

                    <Col xs={24} md={8}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card
                                title="数据分布"
                                size="small"
                                className="status-card"
                                bordered={false}
                            >
                                <Space direction="vertical">
                                    <Space>
                                        {isNormal ? (
                                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                        ) : (
                                            <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
                                        )}
                                        <Text strong>{normalityTest.conclusion}</Text>
                                    </Space>
                                    <Text type="secondary">
                                        p值 = {normalityTest.pValue.toFixed(3)},
                                        {isNormal
                                            ? ' 数据符合正态分布，分析结果可靠'
                                            : ' 数据不符合正态分布，结果解释需谨慎'}
                                    </Text>
                                </Space>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>

                <Divider />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Title level={4}>改进建议</Title>
                    <List
                        bordered
                        dataSource={[
                            processAssessment.recommendations,
                            !isControlled && '识别并消除导致过程不稳定的特殊原因变异',
                            !isCpkGood && (capabilityIndices.cp >= 1.0
                                ? '过程偏离中心，需要调整过程平均值使其更接近规格中心点'
                                : '过程变异过大，需要减小过程变异以提高能力指数'),
                            !isNormal && '检查数据收集过程，确保样本代表性'
                        ].filter(Boolean)}
                        renderItem={(item) => (
                            <List.Item>
                                <Text>{item}</Text>
                            </List.Item>
                        )}
                    />
                </motion.div>
            </Card>
        );
    };

    return (
        <Layout className="layout">
            <Header className="header" style={{ padding: '0 16px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                <Space>
                    <DashboardOutlined style={{ fontSize: '24px' }} />
                    <Title level={3} style={{ margin: '16px 0' }}>产品质量管理系统</Title>
                </Space>
            </Header>

            <Content style={{ padding: '0 50px', marginTop: 20 }}>
                <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={8}>
                            <Card title="数据设置" bordered={true}>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    initialValues={{
                                        groups: 25,
                                        samplesPerGroup: 5,
                                        mean: 100,
                                        stddev: 5,
                                        lsl: 85,
                                        usl: 115,
                                        expectedMean: 100
                                    }}
                                    onFinish={generateData}
                                >
                                    <Divider orientation="left">样本数据设置</Divider>

                                    <Form.Item name="groups" label="数据组数" rules={[{ required: true }]}>
                                        <InputNumber min={5} max={100} style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item name="samplesPerGroup" label="每组样本数" rules={[{ required: true }]}>
                                        <InputNumber min={2} max={20} style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item name="mean" label="目标均值" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item name="stddev" label="目标标准差" rules={[{ required: true }]}>
                                        <InputNumber min={0.1} style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Divider orientation="left">规格限设置</Divider>

                                    <Form.Item name="lsl" label="下规格限 (LSL)" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item name="usl" label="上规格限 (USL)" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item name="expectedMean" label="期望总体均值" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            icon={<ReloadOutlined />}
                                            block
                                        >
                                            生成样本数据
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>

                        <Col xs={24} lg={16}>
                            <Tabs
                                activeKey={activeKey}
                                onChange={setActiveKey}
                                type="card"
                                style={{ marginBottom: 16 }}
                            >
                                <TabPane
                                    tab={<span><BarChartOutlined />数据展示</span>}
                                    key="data"
                                >
                                    <AnimatePresence>
                                        {dataGenerated ? (
                                            <Spin spinning={loading}>
                                                <motion.div
                                                    variants={cardVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit="exit"
                                                >
                                                    <Card title="样本数据" style={{ marginBottom: 16 }}>
                                                        <Table
                                                            dataSource={dataSource}
                                                            columns={columns}
                                                            size="small"
                                                            pagination={{ pageSize: 10 }}
                                                            scroll={{ y: 240 }}
                                                        />
                                                    </Card>

                                                    {analysisResult?.descriptiveStats && (
                                                        <Histogram
                                                            histogramData={analysisResult.histogram}
                                                            stats={analysisResult.descriptiveStats}
                                                            loading={loading}
                                                        />
                                                    )}
                                                </motion.div>
                                            </Spin>
                                        ) : (
                                            <Card>
                                                <Result
                                                    icon={<FileExcelOutlined />}
                                                    title="暂无数据"
                                                    subTitle="请点击左侧“生成样本数据”按钮创建数据"
                                                />
                                            </Card>
                                        )}
                                    </AnimatePresence>
                                </TabPane>

                                <TabPane
                                    tab={<span><LineChartOutlined />过程控制</span>}
                                    key="control"
                                    disabled={!dataGenerated}
                                >
                                    <Spin spinning={loading}>
                                        {analysisResult?.normalityTest && (
                                            <Card
                                                title="正态性检验结果"
                                                style={{ marginBottom: 16 }}
                                                extra={
                                                    <Tag color={analysisResult.normalityTest.isNormal ? "green" : "volcano"}>
                                                        {analysisResult.normalityTest.isNormal ? "符合正态分布" : "不符合正态分布"}
                                                    </Tag>
                                                }
                                            >
                                                <Paragraph>
                                                    <ul>
                                                        <li>检验方法: {analysisResult.normalityTest.testMethod}</li>
                                                        <li>P值: {analysisResult.normalityTest.pValue.toFixed(3)}</li>
                                                        <li>结论: {analysisResult.normalityTest.conclusion}</li>
                                                    </ul>
                                                </Paragraph>
                                            </Card>
                                        )}

                                        {analysisResult?.controlChart && (
                                            <ControlChart
                                                data={analysisResult.controlChart}
                                                loading={loading}
                                            />
                                        )}
                                    </Spin>
                                </TabPane>

                                <TabPane
                                    tab={<span><SettingOutlined />能力分析</span>}
                                    key="capability"
                                    disabled={!dataGenerated}
                                >
                                    <Spin spinning={loading}>
                                        {analysisResult?.capabilityIndices && (
                                            <CapabilityAnalysis
                                                indices={analysisResult.capabilityIndices}
                                                stats={analysisResult.descriptiveStats}
                                                loading={loading}
                                            />
                                        )}
                                    </Spin>
                                </TabPane>

                                <TabPane
                                    tab={<span><CheckCircleOutlined />结论</span>}
                                    key="conclusion"
                                    disabled={!dataGenerated}
                                >
                                    <Spin spinning={loading}>
                                        {analysisResult && renderConclusion()}
                                    </Spin>
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </motion.div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                产品质量管理系统 ©2025 - 质量控制与工艺能力分析
            </Footer>
        </Layout>
    );
};

export default Dashboard;
