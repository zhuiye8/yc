import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState, useMemo  } from 'react';

function Product({className}) {
    const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

    // 统一定义列宽配置
    const columnWidths = ['30%', '20%', '15%', '17.5%', '17.5%', ];
    const columnWidthsheader = ['25%', '20%', '20%', '17.5%', '17.5%', ];

    const investmentData = {
        headers: ['产品名称','所属机构','贷款额度/万','贷款利率/%', '贷款周期/月'],
        items: [
            { name: '楚天快e贷', orgnizers: '中国农业银行三峡分行', max: '0-50', rates: '2.8-3.6', deadline: '12-36' },
            { name: '白领快贷', orgnizers: '湖北银行宜昌分行', max: '0-100', rates: '3.15-3.2', deadline: '12-60' },
            { name: '碳减排支持领域贷款', orgnizers: '广发银行', max: '0-9999', rates: '2-6', deadline: '0-180' },
            { name: '惠民贷', orgnizers: '交通银行宜昌分行', max: '0-80', rates: '3.05-4.36', deadline: '12-60' },
            { name: '生态保护修复贷款', orgnizers: '中国农业银行三峡分行', max: '0-9999', rates: '2-6', deadline: '0-180' },
            { name: '小微企业信用快贷', orgnizers: '中国建设银行三峡分行', max: '0-300', rates: '3-8', deadline: '0-12' },
            { name: '三峡云e贷', orgnizers: '三峡农商银行', max: '0-30', rates: '3-4.55', deadline: '0-36' },
            { name: '🔥创业担保贷（小微企业）', orgnizers: '三峡农商银行', max: '30-500', rates: '1.75-2', deadline: '12-36', ishot: true },
            { name: '🔥科技人才贷', orgnizers: '三峡农商银行', max: '200-1500', rates: '2.7-4', deadline: '12-60', ishot: true  },
            { name: '🔥知识产权贷', orgnizers: '三峡农商银行', max: '0-500', rates: '3.8-6', deadline: '1-24', ishot: true  },
        ]
    };

    const sortedItems = useMemo(() => {
        const hotItems = investmentData.items.filter(item => item.ishot);
        const normalItems = investmentData.items.filter(item => !item.ishot);
        return [...hotItems, ...normalItems];
    }, [investmentData.items]);

    // 获取单元格值
    const getCellValue = (item, columnIndex) => {
        switch(columnIndex) {
            case 0: return item.name;
            case 1: return item.orgnizers;
            case 2: return item.max;
            case 3: return item.rates;
            case 4: return item.deadline;
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
                            style={{ width: columnWidthsheader[index] }}
                        >
                            <span>{header}</span>
                        </div>
                    ))}
                </div>

                <div className='table-body'>
                    {sortedItems.map((item, rowIndex) => (
                        <div key={rowIndex} 
                        className={`table-row ${item.ishot ? 'hot-row' : ''}`}
                        >
                            {investmentData.headers.map((_, colIndex) => {
                                const cellValue = getCellValue(item, colIndex);
                                return (
                                    <div 
                                        key={colIndex} 
                                        className={`cell ${item.ishot ? 'hot-cell' : ''}`}
                                        style={{ width: columnWidths[colIndex], fontWeight: colIndex === 0 ? 500 : 'normal' }}
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

         '&.hot-row': {
            color: '#00c6ff',
            
            // '&:hover': {
            //     backgroundColor: 'rgba(255, 140, 0, 0.3)',
            // },
            
            // '& .cell': {
            //     backgroundColor: 'rgba(255, 140, 0, 0.15)',
            // }
        },

        '& .cell': {
            fontSize: '0.95rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(9, 51, 118, 0.5)',
            padding: '4px',
            overflow: 'hidden',
            cursor: 'default',

            '& .hot-cell': {
                color: '#00c6ff',
            },

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

export default styled(Product)(styles);