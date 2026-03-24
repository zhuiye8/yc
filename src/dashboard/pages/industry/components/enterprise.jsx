/**
 * @input MUI Grid
 * @output { EnterPrise } 重点企业列表组件
 * @position 大屏产业页子组件，展示企业名 + 所属行业列表
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';

function EnterPrise({className}) {
// 人才数据
    const talentData = {
        headers: ['企业命', '所属行业'],
        items: [
            { name: '兴发集团股份有限公司', industry: '化学原料' },
            { name: '安琪酵母股份有限公司', industry: '食品制造' },
            { name: '宜化集团有限责任公司', industry: '化学原料' },
            { name: '人福医药集团股份公司', industry: '医药制造' },
            { name: '三峡新材股份有限公司', industry: '非金属矿物' },
            { name: '华中科技大学', industry: '科学研究' },
            { name: '三峡集团', industry: '电力生产' },
            { name: '中船重工710研究所', industry: '科学研究' },
            { name: '湖北三峡实验室', industry: '科学研究' },
            ]
    };

    return (
        <Grid container className={className}>
            <Grid item className='table-container'>
                <div className='table-header'>
                    {talentData.headers.map((header, index) => (
                        <div key={index} className='header-cell'>{header}</div>
                    ))}
                </div>

                <div className='table-body'>
                    {talentData.items.map((item, index) => (
                        <div key={index} className='table-row'>
                            <div className='cell name-cell'>{item.name}</div>
                            <div className='cell title-cell'>{item.industry}</div>
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
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    
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
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '4px',
        flexShrink: 0,
        
        '& .header-cell': {
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#B0C4DE',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            
            '&:first-child': {
                width: '70%',
                minWidth: '300px',
            },
            '&:nth-child(2)': {
                width: '30%',
                minWidth: '80px',
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
            backgroundColor: 'rgba(255,255,255,0.02)',
        },
        
        '& .cell': {
            fontSize: '0.95rem',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        
        '& .name-cell': {
            width: '70%',
            minWidth: '300px',
            fontWeight: 500,
            color: '#FFD700',
        },
        
        '& .title-cell': {
            width: '30%',
            minWidth: '80px',
        },
        
    },

};

export default styled(EnterPrise)(styles);