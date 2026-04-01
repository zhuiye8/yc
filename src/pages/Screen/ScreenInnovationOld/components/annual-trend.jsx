import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function AnnualTrend({className}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const trendData = {
        years: ['2021', '2022', '2023', '2024', '2025', '2026'],
        series: [
            { name: '专利申请', values: [680, 780, 950, 1100, 1680, 2000], color: '#3B82F6' },
            { name: '专利授权', values: [300, 350, 400, 450, 1120, 1200], color: '#10B981' },
            { name: '标准发布', values: [100, 125, 130, 135, 680, 1350], color: '#F59E0B' },
            { name: '科研项目', values: [50, 55, 60, 65, 1350, 1500], color: '#EF4444' }
        ]
    };

    useEffect(() => {
        if (!chartRef.current) return;
        
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }
        
        chartInstance.current = echarts.init(chartRef.current);
        
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                borderWidth: 0,
                padding: 0,
                formatter: function(params) {
                    let result = `
                        <div style="
                            background-image: url('/images/screen/tooltip.png');
                            background-size: 100% 100%;
                            background-repeat: no-repeat;
                            padding: 12px 16px;
                            min-width: 180px;
                            box-shadow: none;
                        ">
                            <div style="
                                font-weight: bold; 
                                margin-bottom: 8px; 
                                background: linear-gradient(135deg, #3B82F6, #1E3A8A);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                                border-bottom: 1px solid rgba(255,255,255,0.2); 
                                padding-bottom: 4px;
                                font-size: 14px;
                            ">
                                ${params[0].axisValue}
                            </div>
                    `;
                    
                    params.forEach(item => {
                        result += `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${item.color}; margin-right: 8px;"></span>
                                <span style="flex: 1; color: rgba(255,255,255,0.8);">${item.seriesName}</span>
                                <span style="font-weight: bold; color: #FFFFFF;">${item.value}</span>
                            </div>
                        `;
                    });
                    
                    result += `</div>`;
                    return result;
                }
            },
            legend: {
                data: trendData.series.map(s => s.name),
                top: 0,
                right: 10,
                textStyle: {
                    color: '#FFFFFF',
                    fontSize: 12
                },
                itemWidth: 20,
                itemHeight: 12
            },
            grid: {
                left: '8%',
                right: '8%',
                bottom: '10%',
                top: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: trendData.years,
                axisLabel: { 
                    fontSize: 12, 
                    color: '#FFFFFF',
                    fontWeight: 400
                },
                axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.3)' } },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                name: '数量',
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
                axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.3)' } },
                axisLabel: { 
                    fontSize: 11, 
                    color: 'rgba(255,255,255,0.7)'
                },
                axisTick: { show: false }
            },
            series: trendData.series.map(series => ({
                name: series.name,
                type: 'line',
                data: series.values,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    color: series.color,
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    color: series.color,
                    borderColor: '#FFFFFF',
                    borderWidth: 2
                },
                smooth: false,
                connectNulls: true,
                showSymbol: true,
                label: {
                    show: false
                }
            }))
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
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    padding: '12px',
    
    '& .chart-container': {
        width: '100%',
        height: '100%',
        position: 'relative'
    },

};

export default styled(AnnualTrend)(styles);