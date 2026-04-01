import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState, useRef, useEffect, useMemo } from 'react';

function PolicyList({className}) {
    const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
    const [isPaused, setIsPaused] = useState(false);
    const scrollContainerRef = useRef(null);
    const animationRef = useRef(null);
    const scrollSpeedRef = useRef(0.5); // 滚动速度(px/帧)
    
    // 使用 flex 比例分配列宽（总和为1）
    const columnRatios = [0.34, 0.2, 0.12, 0.12, 0.06, 0.16];

    const originalData = {
        headers: ['标题', '发布部门', '发布日期', '截止时间', '类型', '标签'],
        items: [
            { title: '市人民政府办公室关于支持硅碳负极产业发展的实施意见', department: '宜昌市人民政府办公室', date: '2025-12-17', deadline: '2031-02-10', type: '市', label: '科技创新' },
            { title: '市人民政府办公室关于印发《宜昌市支持生物制造产业高质量倍增发展若干措施》的通知', department: '宜昌市人民政府办公室', date: '2025-11-10', deadline: '2027-12-31', type: '市', label: '科技创新' },
            { title: '市人民政府办公室关于印发《宜昌市支持数字经济发展的若干政策》的通知', department: '宜昌市人民政府办公室', date: '2025-08-06', deadline: '2027-12-31', type: '市', label: '惠企政策' },
            { title: '市人民政府办公室关于印发《宜昌市促进文化旅游产业高质量发展奖励办法（试行）》的通知', department: '宜昌市人民政府办公室', date: '2025-05-19', deadline: '2026-12-31', type: '市', label: '文化旅游' },
            { title: '市人民政府办公室关于印发《宜昌市推动电子商务高质量发展的若干措施》的通知', department: '宜昌市人民政府办公室', date: '2025-03-31', deadline: '2027-12-31', type: '市', label: '电子商务' },
            { title: '市人民政府办公室关于印发《宜昌市促进知识产权高质量发展若干措施》的通知', department: '宜昌市人民政府办公室', date: '2024-12-31', deadline: '2027-12-31', type: '市', label: '知识产权' },
            { title: '市人民政府办公室关于印发《宜昌市加快推进新型工业化的若干政策措施》的通知', department: '宜昌市人民政府办公室', date: '2024-11-22', deadline: '2026-12-31', type: '市', label: '新型工业化' },
            { title: '市人民政府关于印发《宜昌市科技创新人才引育实施办法》的通知', department: '宜昌市人民政府', date: '2024-10-08', deadline: '2027-10-07', type: '市', label: '人才引育' },
            { title: '市人民政府关于印发《宜昌高新技术产业开发区管理办法》的通知', department: '宜昌市人民政府', date: '2024-07-26', deadline: '长期', type: '市', label: '高新技术' },
            { title: '市人民政府办公室关于印发《宜昌市促进开放型经济高质量发展的若干措施》的通知', department: '宜昌市人民政府办公室', date: '2024-07-15', deadline: '2026-12-31', type: '市', label: '开放型经济' },
            { title: '市人民政府办公室关于印发《宜昌市中心城区住房公积金贷款实施细则》的通知', department: '宜昌市人民政府办公室', date: '2024-06-13', deadline: '长期', type: '市', label: '住房公积金' },
            { title: '市人民政府关于加快推进"电化长江"宜昌示范区建设的实施意见', department: '宜昌市人民政府', date: '2024-05-16', deadline: '长期', type: '市', label: '电化长江' },
            { title: '市人民政府关于印发《推进宜昌建设长江大保护典范城市规划纲要（2024—2035年）》的通知', department: '宜昌市人民政府', date: '2024-04-02', deadline: '长期', type: '市', label: '长江大保护' },
            { title: '市人民政府办公室关于推进宜昌城市数智化转型的实施方案', department: '宜昌市人民政府办公室', date: '2024-03-13', deadline: '长期', type: '市', label: '数智化转型' },
            { title: '市人民政府办公室关于印发《宜昌市支持新能源汽车产业发展措施》的通知', department: '宜昌市人民政府办公室', date: '2024-02-02', deadline: '2026-12-31', type: '市', label: '新能源汽车' },
            { title: '市人民政府办公室关于印发《2024年宜昌市推进新型工业化工作方案》的通知', department: '宜昌市人民政府办公室', date: '2024-01-19', deadline: '长期', type: '市', label: '新型工业化' },
            { title: '市人民政府关于印发《宜昌市推动大规模设备更新和消费品以旧换新实施方案》的通知', department: '宜昌市人民政府', date: '2024-06-05', deadline: '长期', type: '市', label: '设备更新' },
            { title: '湖北省人民政府办公厅关于印发《湖北省新型工业化发展大会精神贯彻落实工作方案》的通知', department: '湖北省人民政府办公厅', date: '2024-05-10', deadline: '长期', type: '省', label: '新型工业化' },
            { title: '省人民政府办公厅关于加快推进三大都市圈发展的指导意见', department: '湖北省人民政府办公厅', date: '2024-02-20', deadline: '长期', type: '省', label: '区域发展' },
            { title: '宜都市人民政府关于印发《宜都市支持制造业高质量发展若干政策》的通知', department: '宜都市人民政府', date: '2024-07-01', deadline: '2026-12-31', type: '县', label: '制造业' }
        ]
    };

    // 创建循环数据：将原始数据复制一份拼接，实现无缝循环
    const loopData = useMemo(() => {
        return [...originalData.items, ...originalData.items];
    }, []);

    // 获取单元格值
    const getCellValue = (item, columnIndex) => {
        switch(columnIndex) {
            case 0: return item.title;
            case 1: return item.department;
            case 2: return item.date;
            case 3: return item.deadline;
            case 4: return item.type;
            case 5: return item.label;
            default: return '';
        }
    };

    const handleMouseEnter = (e, content) => {
        const rect = e.target.getBoundingClientRect();
        setTooltip({
            show: true,
            content: content,
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ show: false, content: '', x: 0, y: 0 });
    };

    // 无缝循环滚动动画
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // 获取原始数据的总高度（用于重置判断）
        const getOriginalHeight = () => {
            if (!container) return 0;
            // 通过获取第一个原始数据行的高度来估算
            const rows = container.children;
            if (rows.length === 0) return 0;
            const originalItemCount = originalData.items.length;
            let originalHeight = 0;
            for (let i = 0; i < originalItemCount && i < rows.length; i++) {
                originalHeight += rows[i].offsetHeight;
            }
            return originalHeight;
        };

        let originalHeight = 0;
        
        const startScrolling = () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            const scroll = () => {
                if (!isPaused && container) {
                    // 向下滚动
                    container.scrollTop += scrollSpeedRef.current;
                    
                    // 获取原始内容高度（延迟获取以确保DOM已渲染）
                    if (originalHeight === 0 && container.children.length > 0) {
                        originalHeight = getOriginalHeight();
                    }
                    
                    // 当滚动超过原始内容高度时，重置到对应的位置实现无缝循环
                    if (originalHeight > 0 && container.scrollTop >= originalHeight) {
                        container.scrollTop = container.scrollTop - originalHeight;
                    }
                }
                animationRef.current = requestAnimationFrame(scroll);
            };
            
            animationRef.current = requestAnimationFrame(scroll);
        };

        // 延迟启动，确保DOM已渲染
        const timer = setTimeout(() => {
            startScrolling();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPaused, originalData.items.length]);

    // 鼠标悬停时暂停滚动
    const handleMouseEnterContainer = () => {
        setIsPaused(true);
    };

    const handleMouseLeaveContainer = () => {
        setIsPaused(false);
    };

    return (
        <Grid container className={className}>
            {/* Tooltip */}
            {tooltip.show && (
                <div
                    className='tooltip'
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translateX(-50%) translateY(-100%)'
                    }}
                >
                    {tooltip.content}
                </div>
            )}

            <Grid item className='table-container'>
                <div className='table-header'>
                    {originalData.headers.map((header, index) => (
                        <div 
                            key={index} 
                            className='header-cell'
                            style={{ flex: columnRatios[index] }}
                            onMouseEnter={(e) => handleMouseEnter(e, header)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span>{header}</span>
                        </div>
                    ))}
                </div>

                <div 
                    className='table-body' 
                    ref={scrollContainerRef}
                    onMouseEnter={handleMouseEnterContainer}
                    onMouseLeave={handleMouseLeaveContainer}
                >
                    {loopData.map((item, rowIndex) => (
                        <div key={rowIndex} className='table-row'>
                            {originalData.headers.map((_, colIndex) => {
                                const cellValue = getCellValue(item, colIndex);
                                return (
                                    <div 
                                        key={colIndex} 
                                        className='cell'
                                        style={{ 
                                            flex: columnRatios[colIndex],
                                            fontWeight: colIndex === 0 ? 500 : 'normal' 
                                        }}
                                        onMouseEnter={(e) => handleMouseEnter(e, cellValue)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span>{cellValue}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </Grid>
        </Grid>
    );
}

const styles = {
    height: 'calc(100% - 40px)',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',

    '& .tooltip': {
        position: 'fixed',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        color: '#FFFFFF',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 400,
        whiteSpace: 'nowrap',
        zIndex: 9999,
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        fontFamily: 'inherit',
        
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(0, 0, 0, 0.85)'
        }
    },

    '@media screen and (max-width: 1920px)': {
        fontSize: '16px',
    },
    '@media screen and (max-width: 1680px)': {
        fontSize: '14px',
    },
    '@media screen and (max-width: 1440px)': {
        fontSize: '12px',
    },

    '& .table-container': {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '4px',
        width: '100%',
        minWidth: 0,
    },

    '& .table-header': {
        display: 'flex',
        padding: '10px 0',
        flexShrink: 0,
        backgroundColor: '#0d4fa3',
        width: '100%',
        minWidth: 0,

        '& .header-cell': {
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#00ffe4',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            padding: '0 4px',
            cursor: 'default',

            '& span': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: 'center',
            },
        },
    },

    '& .table-body': {
        flex: 1,
        overflowY: 'hidden',  // 隐藏滚动条
        width: '100%',
        minWidth: 0,
        position: 'relative',
    },

    '& .table-row': {
        display: 'flex',
        padding: '4px 0',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        transition: 'background-color 0.2s ease',
        width: '100%',
        minWidth: 0,

        '&:hover': {
            backgroundColor: 'rgba(9, 51, 118)',
        },

        '& .cell': {
            fontSize: '0.95rem',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px',
            overflow: 'hidden',
            cursor: 'default',
            margin: '0 2px',
            borderRadius: '4px',

            '& span': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: 'center',
            },
        },
    },
};

export default styled(PolicyList)(styles);