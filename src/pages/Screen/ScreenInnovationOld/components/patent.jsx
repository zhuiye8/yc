import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
const img = '/images/screen/sum-left.png'

function Patent({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const sumTitle = '知识产权总数'
    const sumValue = '1620077'

    const innovationData = {
        items: [
            { name: '科技文献', value: 430002 },
            { name: '科技成果', value: 63553 },
            { name: '技术标准', value: 19756 },
            { name: '产业园区', value: 8073 },
            { name: '双创载体', value: 302 },
            { name: '产业政策', value: 430 },
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
                // max: 40
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
                    // 数字标签
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
            <Grid item size={12}>
                <Grid container >
                    <Grid item size={4} className='img'>
                        <img src={img} alt=""/>
                    </Grid>
                    <Grid item size={8}>
                        <div className='sum'>
                            <div className='sum-title'>{sumTitle}</div>
                            <div className='sum-value'>{sumValue}</div>
                        </div>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item size={12} className='chart'>
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
        height: 'calc(100% -40px)',
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
    },
        '& .img': {
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& img': {
            height: 'auto',
            maxHeight: '100px',
            width: '100%',
            maxWidth: '140px',
            objectFit: 'contain',
        },
    },
    
    '& .sum': {
        padding: '0.375rem', // 6px转为rem

    },
    '& .sum-title': {
        color: '#fff',
        lineHeight: 1.2,
        padding: '0.25rem',
        fontWeight: 'bold',
        fontSize: '1.2em',

    },
    '& .sum-value': {
        fontSize: 'clamp(1.2rem, 4vw, 2.2rem)',
        fontWeight: 700,
        lineHeight: 1.2,
        background: 'linear-gradient(135deg, #f8d06bff 0%, #FF8A00 100%)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textShadow: '0 2px 4px rgba(255, 138, 0, 0.2)',
        padding: '0.25rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',

    },
    '& .chart': {
        flex: '1 1 0',
        minHeight: 0,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        '& > div': {
            width: '100%',
            height: '100% !important',
            minHeight: '0 !important',
            width: '100%', 
            height: '100%',
            minHeight: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }
    }
};

export default styled(Patent)(styles);