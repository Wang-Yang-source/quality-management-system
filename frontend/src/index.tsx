import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import Dashboard from './pages/Dashboard.tsx'; // 添加回.tsx扩展名，确保直接匹配文件
import './styles.css';

// 创建应用根元素
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

// 渲染应用
root.render(
    <React.StrictMode>
        <ConfigProvider locale={zhCN}>
            <Dashboard />
        </ConfigProvider>
    </React.StrictMode>
);
