import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function NationwideDistribution({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 省份数据
    const provinceData = {
        categories: ['北京', '上海', '广东', '湖北', '江苏', '安徽', '福建', '江西', '山东', '河南', '湖南'],
        values: [10000, 9000, 8500, 7200, 6800, 5500, 4800, 4200, 3800, 3200, 2800]
    };

    useEffect(() => {
        if (!chartRef.current) return;
        
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }
        
        chartInstance.current = echarts.init(chartRef.current);
        
        const option = {
            grid: {
                left: '5%',
                right: '5%',
                bottom: '5%',
                top: '15%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    return `${params[0].name}<br/>人才数量: ${params[0].value}`;
                }
            },
            xAxis: {
                type: 'category',
                data: provinceData.categories,
                axisLabel: { 
                    fontSize: 11, 
                    color: '#FFFFFF',
                    rotate: 0,
                    interval: 0,
                    fontWeight: 400
                },
                axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                name: '（总数）',
                nameTextStyle: {
                    color: '#B0C4DE',
                    fontSize: 12
                },
                splitLine: { 
                    show: true, 
                    lineStyle: { 
                        color: 'rgba(255,255,255,0.1)', 
                        type: 'dashed' 
                    } 
                },
                axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                axisLabel: { 
                    fontSize: 10, 
                    color: 'rgba(255,255,255,0.6)'
                },
                axisTick: { show: false },
                min: 0,
                max: 12000,
                interval: 2000
            },
            series: [
                {
                    name: '人才数量',
                    type: 'bar',
                    data: provinceData.values,
                    barWidth: 18,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: '#3B82F6' },
                                { offset: 1, color: '#1E3A8A' }
                            ]
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    label: {
                        show: true,
                        position: 'top',
                        fontWeight: 600,
                        fontSize: 10,
                        color: '#FFD700',
                        formatter: function(params) {
                            return params.value;
                        },
                        offset: [0, 2]
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
            {/* 只保留图表区域 */}
            <Grid item className='chart-container'>
                <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
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
    padding: '12px 16px',
    
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
    '@media screen and (max-width: 1366px)': {
        fontSize: '11px',
    },
    '@media screen and (max-width: 1280px)': {
        fontSize: '10px',
    },
    
    // 图表容器
    '& .chart-container': {
        flex: 1,
        minHeight: 0,
        width: '100%',
        position: 'relative',
    },
};

export default styled(NationwideDistribution)(styles);