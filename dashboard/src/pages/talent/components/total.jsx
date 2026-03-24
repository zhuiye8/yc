import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function Total({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const innovationData = {
        items: [
            { name: '人才总数', value: 517482 },
            { name: '重点人才总数', value: 27482 },
            { name: '活跃人才总数', value: 8482 },
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
        height: 'calc(100% -40px)',
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
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

export default styled(Total)(styles);