/**
 * @input MUI Grid, echarts
 * @output { GapCount } 人才缺口 ECharts 柱状图组件
 * @position 大屏人才页子组件，按产业链展示人才缺口数量
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function GapCount({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 人才缺口数据 - 14个产业链
    const gapData = {
        categories: ['湿电子化学品', '新能源电池', '化学制药', '合成生物', '船舶制造', '人工智能'],
        values: [1800, 1600, 1400, 1200, 1100, 900]
    };

    useEffect(() => {
        if (!chartRef.current) return;
        
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }
        
        chartInstance.current = echarts.init(chartRef.current);
        
        const option = {
            grid: {
                left: '8%',
                right: '5%',
                bottom: '12%',
                top: '15%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    return `${params[0].name}<br/>人才缺口: ${params[0].value}人`;
                }
            },
            legend: {
                show: false
            },
            xAxis: {
                type: 'category',
                data: gapData.categories,
                axisLabel: { 
                    fontSize: 11, 
                    color: '#FFFFFF',
                    fontWeight: 400,
                    rotate: 0,
                    interval: 0
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
                    fontSize: 12,
                    fontWeight: 400
                },
                splitLine: { 
                    show: true, 
                    lineStyle: { 
                        color: 'rgba(255,255,255,0.15)', 
                        type: 'solid',
                        width: 1
                    } 
                },
                axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                axisLabel: { 
                    fontSize: 11, 
                    color: 'rgba(255,255,255,0.7)'
                },
                axisTick: { show: false },
                min: 0,
                max: 2000,
                interval: 500,
                splitNumber: 4
            },
            series: [
                {
                    name: '人才缺口',
                    type: 'bar',
                    data: gapData.values,
                    barWidth: 18,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: '#3B82F6' },    // 浅蓝色
                                { offset: 1, color: '#1E3A8A' }     // 深蓝色
                            ]
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    label: {
                        show: false
                    },
                    showBackground: false
                },
                {
                    name: '趋势线',
                    type: 'line',
                    data: gapData.values,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: {
                        color: '#87CEEB',
                        width: 3,
                        type: 'solid',
                        shadowColor: 'rgba(135, 206, 235, 0.5)',
                        shadowBlur: 10,
                        shadowOffsetY: 2
                    },
                    itemStyle: {
                        color: '#87CEEB',
                        borderColor: '#FFFFFF',
                        borderWidth: 2
                    },
                    smooth: false,
                    connectNulls: true,
                    showSymbol: true,
                    zlevel: 2,
                    label: {
                        show: false
                    }
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
            {/* 图表区域 */}
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
    
    // 图表容器
    '& .chart-container': {
        flex: 1,
        minHeight: 0,
        width: '100%',
        position: 'relative',
    },
};

export default styled(GapCount)(styles);