import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
const icon1 = '/images/screen/icon-1.png';
const icon2 = '/images/screen/icon-2.png';
const talentItem = '/images/screen/talent-item.png';

function Total({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const innovationData = {
        items: [
            { name: '金融产品', value: 257 },
            { name: '入驻机构', value: 34 },
            { name: '申请次数', value: 678435 },
            { name: '注册用户', value: 182712},
        ]
    };

    useEffect(() => {
        if (!chartRef.current) return;
        
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }
        
        chartInstance.current = echarts.init(chartRef.current);
        
        const categories = innovationData.items.map(item => item.name);
        const values = innovationData.items.map(item => item.value);
        
        const option = {
            grid: {
                left: '20%',
                right: '15%',
                bottom: '5%',
                top: '5%',
                containLabel: false
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'value',
                splitLine: { show: false },
                axisLine: { show: false },
                axisLabel: { show: false },
                axisTick: { show: false },
                min: 0,
            },
            yAxis: {
                type: 'category',
                data: categories,
                axisLabel: { 
                    fontSize: 14, 
                    color: '#ffffff',
                    fontWeight: 400,
                    margin: 12
                },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            series: [
                {
                    name: '创新指标',
                    type: 'bar',
                    data: values,
                    barWidth: 8,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 0,
                            colorStops: [
                                { offset: 0, color: '#1E40AF' },
                                { offset: 1, color: '#87CEEB' }
                            ]
                        },
                        borderRadius: [4, 8, 8, 4], 
                        shadowColor: 'rgba(59, 130, 246, 0.6)',
                        shadowBlur: 10,
                        shadowOffsetX: 4,
                        shadowOffsetY: 0,
                    },
                    label: {
                        show: true,
                        position: 'right',
                        distance: 8, 
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#87CEEB',
                        formatter: (params) => {
                            return `${params.value}`;
                        },
                        offset: [0, 0] 
                    },
                    showBackground: false
                }
            ]
        };
        
        chartInstance.current.setOption(option);
        
        const resizeObserver = new ResizeObserver(() => {
            if (chartInstance.current) {
                chartInstance.current.resize();
            }
        });
        
        resizeObserver.observe(chartRef.current);
        
        return () => {
            resizeObserver.disconnect();
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, []);

    return (
        <Grid container className={className}>
            <Grid item className='content-container'>
                <Grid container alignItems={'center'} style={{ height: '100%' }}>
                    <Grid item size={6} className='content-left'>
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className='sum'>
                                <Grid container alignItems={'center'} justifyContent={'center'}>
                                    <Grid item>
                                        <img src={icon1} alt="icon1" className='sum-icon' />
                                    </Grid>
                                    <Grid item>
                                        <div>
                                            <div className='sum-value'>3154.44亿</div>
                                            <div className='sum-label'>授信金额</div>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                            <div className='image-container'>
                                <img src={talentItem} alt="talent" className='content-image' />
                            </div>
                        </div>
                    </Grid>
                    <Grid item size={6} className='content-right'>
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className='sum'>
                                <Grid container alignItems={'center'} justifyContent={'center'}>
                                    <Grid item>
                                        <img src={icon2} alt="icon2" className='sum-icon' />
                                    </Grid>
                                    <Grid item>
                                        <div>
                                            <div className='sum-value'>1732.18亿</div>
                                            <div className='sum-label'>放款金额</div>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                            <div className='image-container'>
                                <img src={talentItem} alt="talent" className='content-image' />
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item className='chart'>
                <div ref={chartRef} />
            </Grid>
        </Grid>
    );
}

const styles = {
    height: 'calc(100% - 40px)', 
    width: '100%',
    display: 'flex', 
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',

    '&': {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 40px)',
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
    },
    '& .content-container': {
        flex: 1,  // 改为 1，占据一半高度
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        '& > .MuiGrid-root': {
            height: '100%',
        }
    },
    '& .content-left, & .content-right': {
        height: '100%',
        padding: '6px',
        minHeight: 0,
        '& > div': {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
        }
    },
    '& .sum': {
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        minHeight: 0,
        padding: 0,
        '& .MuiGrid-container': {
            width: 'auto',
        }
    },
    '& .sum-icon': {
        height: '48px',
        width: 'auto',
        marginRight: '12px',
        flexShrink: 0,
    },
    '& .sum-value': {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#ffffff',
        lineHeight: 1.2,
        marginBottom: '4px',
    },
    '& .sum-label': {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 1.2,
    },
    '& .image-container': {
        flex: '1 1 0%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
        minHeight: 0,
        padding: 0,
    },
    '& .content-image': {
        height: '100%',
        width: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
    },
    '& .chart': {
        flex: 1,  // 改为 1，占据一半高度
        minHeight: 0,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        '& > div': {
            width: '100%',
            height: '100%',
            minHeight: 0,
        }
    }
};

export default styled(Total)(styles);