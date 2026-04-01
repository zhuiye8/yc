import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

function CredictList({className}) {
    const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

    // 统一定义列宽配置
    const columnWidths = ['35%', '25%', '20%', '20%'];

    const investmentData = {
        headers: ['授信对象','所属机构','授信日期','授信金额',],
        items: [
            { name: '枝江市顾店红仓储服务有限公司', organization: '枝江农商银行', date: '2026-03-20', num: '30万元' },
            { name: '夷陵区小溪塔恒帆灯具经营部', organization: '邮储银行', date: '2026-03-19', num: '30万元' },
            // { name: '夷陵区小溪塔宜权工程机械设备租赁服务部', organization: '三峡农商银行', date: '2026-03-19', num: '20万元' },
            { name: '当阳市特种水产养殖中心', organization: '邮储银行', date: '2026-03-19', num: '30万元' },
            { name: '湖北宸聚建设有限公司', organization: '三峡农商银行', date: '2026-03-19', num: '250万元' },
            { name: '五峰丽涛宾馆', organization: '邮储银行', date: '2026-03-19', num: '30万元' },
            { name: '宜昌土家神韵农业开发有限公司', organization: '三峡农商银行', date: '2026-03-19', num: '100万元' },
            { name: '宜昌咖芒文化传媒有限公司', organization: '汉口银行', date: '2026-03-19', num: '30万元' },
            { name: '宜都市碧香茶业厂（个体工商户）', organization: '宜都农商银行', date: '2026-03-19', num: '15万元' },
            { name: '夷陵区顺心油厂', organization: '邮储银行', date: '2026-03-19', num: '30万元' },
            { name: '湖北博卡贸易有限公司', organization: '三峡农商银行', date: '2026-03-19', num: '150万元' },

        ]
    };

    // 获取单元格值
    const getCellValue = (item, columnIndex) => {
        switch(columnIndex) {
            case 0: return item.name;
            case 1: return item.organization;
            case 2: return item.date;
            case 3: return item.num;
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
                    {investmentData.headers.map((header, index) => (
                        <div 
                            key={index} 
                            className='header-cell'
                            style={{ width: columnWidths[index] }}
                        >
                            <span>{header}</span>
                        </div>
                    ))}
                </div>

                <div className='table-body'>
                    {investmentData.items.map((item, rowIndex) => (
                        <div key={rowIndex} className='table-row'>
                            {investmentData.headers.map((_, colIndex) => {
                                const cellValue = getCellValue(item, colIndex);
                                return (
                                    <div 
                                        key={colIndex} 
                                        className='cell'
                                        style={{ 
                                            width: columnWidths[colIndex], 
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

    // Tooltip 样式
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

    // 响应式基准
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
    },

    '& .table-header': {
        display: 'flex',
        padding: '10px 0',
        flexShrink: 0,
        backgroundColor: '#0d4fa3',

        '& .header-cell': {
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#00ffe4',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',

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
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.2) rgba(255,255,255,0.05)',

        '&::-webkit-scrollbar': {
            width: '4px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '2px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            '&:hover': {
                background: 'rgba(255,255,255,0.3)',
            },
        },
    },

    '& .table-row': {
        display: 'flex',
        padding: '4px 0',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        transition: 'background-color 0.2s ease',

        '&:hover': {
            backgroundColor: 'rgba(9, 51, 118)',
        },

        '& .cell': {
            fontSize: '0.95rem',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(9, 51, 118, 0.5)',
            padding: '4px',
            overflow: 'hidden',
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
};

export default styled(CredictList)(styles);