// 动画工具函数
import { Variants } from 'framer-motion';

// 页面淡入动画
export const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

// 图表淡入动画
export const chartVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.3
        }
    }
};

// 列表项淡入动画 (用于渲染列表，错开出现时间)
export const listVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3
        }
    }
};

// 列表容器变体
export const listContainerVariants: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1, // 错开子元素的动画时间
        }
    }
};

// 闪光效果 (用于强调某部分)
export const shimmerVariants: Variants = {
    initial: {
        backgroundPosition: '0% 0%',
    },
    animate: {
        backgroundPosition: '100% 0%',
        transition: {
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 2
        }
    }
};

// 控制图数据点出现动画
export const controlChartPointVariants: Variants = {
    initial: { opacity: 0, scale: 0 },
    animate: (custom: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: custom * 0.05,
            duration: 0.3,
            type: "spring",
            stiffness: 500
        }
    })
};

// 数据表格行动画
export const tableRowVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.03,
            duration: 0.3
        }
    }),
    exit: { opacity: 0, y: -10 }
};

// 卡片浮出动画
export const cardVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4
        }
    },
    hover: {
        y: -5,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        transition: {
            duration: 0.2
        }
    }
};

// 数字变化动画的插值函数
export const interpolateNumber = (
    start: number,
    end: number,
    duration: number = 1000,
    callback: (value: number) => void
): () => void => {
    const startTime = performance.now();
    let animationFrame: number;

    // 数字动画函数
    const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // 使用ease-out缓动函数
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        // 计算当前值
        const currentValue = start + (end - start) * easedProgress;

        // 调用回调更新显示的值
        callback(currentValue);

        // 如果动画未完成，继续下一帧
        if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
        }
    };

    // 开始动画
    animationFrame = requestAnimationFrame(animate);

    // 返回取消动画的函数
    return () => {
        cancelAnimationFrame(animationFrame);
    };
};
