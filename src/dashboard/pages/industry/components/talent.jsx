/**
 * @input MUI Grid
 * @output { ChainTalent } 产业链人才列表组件
 * @position 大屏产业页子组件，展示人才名 + 职称 + 领域列表
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

function ChainTalent({className}) {
    // 人才数据
    const talentData = {
        headers: ['人才名', '职称', '领域'],
        items: [
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
            { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' }
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
                            <div className='cell title-cell'>{item.title}</div>
                            <div className='cell field-cell'>{item.field}</div>
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
    
    '@media screen and (max-width: 1920px)': {
        fontSize: '16px',
    },
    '@media screen and (max-width: 1680px)': {
        fontSize: '14px',
    },
    '@media screen and (max-width: 1440px)': {
        fontSize: '12px',
    },
    
    // 表格容器
    '& .table-container': {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '4px',
    },
    
    // 表头
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
                width: '15%',
                minWidth: '80px',
            },
            '&:nth-child(2)': {
                width: '20%',
                minWidth: '100px',
            },
            '&:last-child': {
                flex: 1,
            },
        },
    },
    
    // 表格体 - 可滚动
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
    
    // 表格行
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
            width: '15%',
            minWidth: '80px',
            fontWeight: 500,
            color: '#FFD700',
        },
        
        '& .title-cell': {
            width: '20%',
            minWidth: '100px',
        },
        
        '& .field-cell': {
            flex: 1,
            color: 'rgba(255,255,255,0.8)',
        },
    },

};

export default styled(ChainTalent)(styles);