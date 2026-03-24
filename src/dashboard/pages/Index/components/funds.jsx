/**
 * @input MUI Grid, echarts
 * @output { Funds } 大屏首页资金模块子组件
 * @position 大屏首页子组件，展示融资工具/投资机构/对接数 + ECharts 折线图
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function Funds({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 表格数据
    const tableData = {
        headers: ['融资工具数', '投资机构数', '累计对接数', '本周更新数'],
        values: [67, 133, 55, 34],
        subValues: [0, 0, 0, 0]
    }

        useEffect(() => {
    
            if(chartRef.current){
                const chart = echarts.init(chartRef.current);
    
                const containerWidth = chart.getWidth();
    
                const option = {
                    grid: {
                        left: '8%',
                        right: '5%',
                        bottom: '8%',
                        top: '12%',
                        containLabel: true
                    },
                    tooltip: {
                        trigger: 'item',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        show: false
                    },
                    xAxis: {
                        type: 'category',
                        data: tableData.headers,
                        axisLabel: { 
                            fontSize: 12, 
                            color: '#ffffff',
                            rotate: 0,
                            interval: 0,
                            fontWeight: 500
                        },
                        axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.3)' } }, // 半透明白色
                        axisTick: { show: false },
                        splitLine: { show: false }
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { show: false },
                        axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.3)' } }, // 半透明白色
                        axisLabel: { 
                            fontSize: 11, 
                            color: 'rgba(255,255,255,0.7)' 
                        },
                        min: 0,
                        max: 120,
                        interval: 30
                    },
                    series: [
                        {
                            name: '融资工具数',
                            type: 'bar',
                            data: [tableData.values[0], tableData.subValues[0], 0, 0],
                            itemStyle: { 
                                color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [
                                        { offset: 0, color: '#6ab7ff' },  // 浅蓝
                                        { offset: 1, color: '#1890ff' }   // 深蓝
                                    ]
                                },
                                borderRadius: [4, 4, 0, 0]
                            },
                            barWidth: 24,
                            stack: 'total',
                            showBackground: false,
                            label: {
                                show: true,
                                position: 'top',
                                fontWeight: 600,
                                fontSize: 12,
                                color: '#ffffff', // 白色文字
                                formatter: (params) => {
                                    return params.value > 0 ? params.value : '';
                                }
                            }
                        },
                        {
                            name: '投资机构数',
                            type: 'bar',
                            data: [0, tableData.values[1], tableData.subValues[1], 0],
                            itemStyle: { 
                                color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [
                                        { offset: 0, color: '#7fc9ff' },  // 浅蓝
                                        { offset: 1, color: '#2b9cff' }   // 中蓝
                                    ]
                                },
                                borderRadius: [4, 4, 0, 0]
                            },
                            barWidth: 24,
                            stack: 'total',
                            label: {
                                show: true,
                                position: 'top',
                                fontWeight: 600,
                                fontSize: 12,
                                color: '#ffffff', // 白色文字
                                formatter: (params) => {
                                    return params.value > 0 ? params.value : '';
                                }
                            }
                        },
                        {
                            name: '累计对接数',
                            type: 'bar',
                            data: [0, 0, tableData.values[2], tableData.subValues[2]],
                            itemStyle: { 
                                color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [
                                        { offset: 0, color: '#5da5ff' },  // 浅蓝
                                        { offset: 1, color: '#096dd9' }   // 深蓝
                                    ]
                                },
                                borderRadius: [4, 4, 0, 0]
                            },
                            barWidth: 24,
                            stack: 'total',
                            label: {
                                show: true,
                                position: 'top',
                                fontWeight: 600,
                                fontSize: 12,
                                color: '#ffffff', // 白色文字
                                formatter: (params) => {
                                    return params.value > 0 ? params.value : '';
                                }
                            }
                        },
                        {
                            name: '本周更新数',
                            type: 'bar',
                            data: [0, 0, 0, tableData.values[3]],
                            itemStyle: { 
                                color: {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [
                                        { offset: 0, color: '#8ec9ff' },  // 浅蓝
                                        { offset: 1, color: '#3d9eff' }   // 中蓝
                                    ]
                                },
                                borderRadius: [4, 4, 0, 0]
                            },
                            barWidth: 24,
                            stack: 'total',
                            label: {
                                show: true,
                                position: 'top',
                                fontWeight: 600,
                                fontSize: 12,
                                color: '#ffffff', // 白色文字
                                formatter: (params) => {
                                    return params.value > 0 ? params.value : '';
                                }
                            }
                        }
                    ]
                };
    
                chart.setOption(option);
    
                const handleResize = () => {
                    const containerWidth = chart.getWidth();
                    // 根据容器宽度调整字体大小和柱宽
                    const legendFontSize = containerWidth < 600 ? 10 : 12;
                    const xAxisFontSize = containerWidth < 600 ? 10 : 13;
                    const yAxisFontSize = containerWidth < 600 ? 9 : 11;
                    const barWidth = containerWidth < 600 ? 12 : 20;
    
                    chart.setOption({
                        legend: {
                            ...option.legend,
                            textStyle: {
                                fontSize: legendFontSize
                            }
                        },
                        xAxis: {
                            ...option.xAxis,
                            axisLabel: {
                                ...option.xAxis.axisLabel,
                                fontSize: xAxisFontSize
                            }
                        },
                        yAxis: {
                            ...option.yAxis,
                            axisLabel: {
                                ...option.yAxis.axisLabel,
                                fontSize: yAxisFontSize
                            }
                        },
                        series: option.series.map(series => ({
                            ...series,
                            barWidth: barWidth
                        }))
                    });
    
                    chart.resize();
                };
    
                window.addEventListener('resize', handleResize);
    
                return () => {
                    window.removeEventListener('resize', handleResize);
                    chart.dispose();
                };
    
            }
    
        })

    return (
        <Grid container className={className} >
            <Grid item className='chart' sx={{ 
                
            }}>
                <div 
                    ref={chartRef} 
                    style={{ 
                        width: '100%', 
                        height: '100%',
                        minHeight: 0,  // 允许div缩小
                        position: 'absolute',  // 绝对定位确保填充容器
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }} 
                />
            </Grid>
        </Grid>
    );
}

const styles = {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 40px)',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',  
        position: 'relative',

    '& .chart': {
        height: '100%',
        flex: '1 1 0',  
        minHeight: 0,   
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        '& > div': {
            width: '100%',
            height: '100% !important',
            minHeight: '0 !important',  
        }
    }
};

export default styled(Funds)(styles);