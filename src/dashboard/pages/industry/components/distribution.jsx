/**
 * @input MUI Grid, echarts
 * @output { Distribution } 企业类型分布图表组件
 * @position 大屏产业页子组件，ECharts 柱状图展示上市/专精特新/科技型中小/全量科技企业分布
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function Distribution({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 企业类型数据
    const enterpriseData = {
        title: '企业类型分布',
        subtitle: 'DISTRIBUTION',
        categories: ['上市公司', '专精特新', '科技型中小', '全量科技'],
        values: [607, 812, 1362, 1662]
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
                }
            },
            legend: {
                show: false
            },
            xAxis: {
                type: 'category',
                data: enterpriseData.categories,
                axisLabel: { 
                    fontSize: 12, 
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
                name: '数量 (总数)',
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
                    fontSize: 11, 
                    color: 'rgba(255,255,255,0.6)'
                },
                axisTick: { show: false }
            },
            series: [
                {
                    name: '企业数量',
                    type: 'bar',
                    data: enterpriseData.values,
                    barWidth: 24,
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
                        fontSize: 12,
                        color: '#87CEEB',
                        formatter: (params) => {
                            return params.value;
                        },
                        offset: [0, 4]
                    }
                },
                {
                    name: '趋势线',
                    type: 'line',
                    data: enterpriseData.values,
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

export default styled(Distribution)(styles);