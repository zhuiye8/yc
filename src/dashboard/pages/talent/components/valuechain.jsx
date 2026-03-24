/**
 * @input MUI Grid, echarts
 * @output { ValueChain } 产业链人才分布 ECharts 环形图组件
 * @position 大屏人才页子组件，按产业链展示人才分布比例
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function ValueChain({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 产业链数据 - 8个产业链，每个5713人
    const industryData = [
        { name: '湿电子化学品', value: 5713, color: '#3B82F6' },
        { name: '新能源电池', value: 5713, color: '#FF8A00' },
        { name: '化学制药', value: 5713, color: '#10B981' },
        { name: '合成生物', value: 5713, color: '#F59E0B' },
        { name: '船舶制造', value: 5713, color: '#EF4444' },
        { name: '人工智能', value: 5713, color: '#8B5CF6' },
        // { name: '产业链7', value: 5713, color: '#EC4899' },
        // { name: '产业链8', value: 5713, color: '#06B6D4' }
    ];

    useEffect(() => {
        if (!chartRef.current) return;
        
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }
        
        chartInstance.current = echarts.init(chartRef.current);
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    return `${params.name}: ${params.value}人`;
                }
            },
            legend: {
                show: false
            },
            series: [
                {
                    name: '产业链分布',
                    type: 'pie',
                    radius: ['40%', '75%'], // 环形饼图
                    center: ['50%', '50%'],
                    padAngle: 5,
                    avoidLabelOverlap: true,
                    // 设置扇形之间的间隙
                    itemStyle: {
                        borderRadius: 0,
                        borderColor: 'rgba(255, 255, 255, 0.2)', // 浅色边框
                        borderWidth: 2 // 边框宽度
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: function(params) {
                            // 每个扇形显示：产业链 + 人数
                            return `${params.name}\n${params.value}人`;
                        },
                        color: '#FFFFFF',
                        fontSize: 11,
                        lineHeight: 16,
                        fontWeight: 400,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    },
                    labelLine: {
                        show: true,
                        length: 10,
                        length2: 10,
                        smooth: true,
                        lineStyle: {
                            color: 'rgba(255,255,255,0.4)',
                            width: 1
                        }
                    },
                    emphasis: {
                        scale: false,
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0,0,0,0.5)'
                        }
                    },
                    data: industryData.map(item => ({
                        value: item.value,
                        name: item.name,
                        itemStyle: { color: item.color }
                    }))
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
    padding: '12px',
    
    '& .chart-container': {
        width: '100%',
        height: '100%',
        position: 'relative'
    },
    
    // 响应式
    '@media screen and (max-width: 768px)': {
        padding: '8px'
    }
};

export default styled(ValueChain)(styles);