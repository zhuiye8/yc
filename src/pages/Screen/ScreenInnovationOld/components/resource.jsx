import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

function Resource({className}) {
    const [activeTab, setActiveTab] = useState('专利');
    const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

    const tabs = ['专利', '标准', '在研项目', '成果转化'];

    const columnRatiosMap = {
        '专利': [0.25, 0.2, 0.15, 0.13, 0.13, 0.14],   // 名称、申请人、时间、类型、IPC、状态
        '标准': [0.30, 0.28, 0.10, 0.14, 0.18],   // 名称、编号、单位、起草人、类型、日期
        '在研项目': [0.35, 0.15, 0.25, 0.13, 0.12],     // 项目名称、类型、承担单位、负责人、关联专利
        '成果转化': [0.3, 0.12, 0.12, 0.18, 0.14, 0.14] // 成果名称、类型、方式、受让方、主体、领域
    };

    const standardData = {
        headers: ['名称', '制定单位', '起草人', '标准类型', '发布日期'],
        rows: [
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
            { name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15' },
        ]
    };

    const patentData = {
        headers: ['名称', '申请人/单位', '申请时间', '类型', 'IPC', '状态'],
        rows: [
            { name: '发明专利A', applicant: '李某某', applyTime: '2026.8', type: '发明', ipc: 'IPC-A', status: '已授权' },
            { name: '实用新型B', applicant: '张某某', applyTime: '2026.7', type: '实用新型', ipc: 'IPC-B', status: '审查中' },
            { name: '实用新型B', applicant: '张某某', applyTime: '2026.7', type: '实用新型', ipc: 'IPC-B', status: '审查中' },
            { name: '实用新型B', applicant: '张某某', applyTime: '2026.7', type: '实用新型', ipc: 'IPC-B', status: '审查中' },
            { name: '实用新型B', applicant: '张某某', applyTime: '2026.7', type: '实用新型', ipc: 'IPC-B', status: '审查中' },
            { name: '实用新型B', applicant: '张某某', applyTime: '2026.7', type: '实用新型', ipc: 'IPC-B', status: '审查中' },
            { name: '实用新型B', applicant: '张某某', applyTime: '2026.7', type: '实用新型', ipc: 'IPC-B', status: '审查中' },
            { name: '实用新型B', applicant: '张某某', applyTime: '2026.7', type: '实用新型', ipc: 'IPC-B', status: '审查中' },
            { name: '外观专利C', applicant: '刘某某', applyTime: '2026.6', type: '外观', ipc: 'IPC-C', status: '申请中' }
        ]
    };

    const projectData = {
        headers: ['项目名称', '项目类型', '承担单位', '项目负责人', '关联专利'],
        rows: [
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
            { projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A' },
        ]
    };

    const transformData = {
        headers: ['成果名称', '成果类型', '转化方式', '受让方', '转化主体', '技术领域'],
        rows: [
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
            { achievementName: '一种基于深度学习的图像识别方法及系统', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药' },
        ]
    };

    const getCurrentData = () => {
        switch(activeTab) {
            case '专利':
                return patentData;
            case '标准':
                return standardData;
            case '在研项目':
                return projectData;
            case '成果转化':
                return transformData;
            default:
                return standardData;
        }
    };

    const currentData = getCurrentData();
    const currentRatios = columnRatiosMap[activeTab] || [];

    const getCellValue = (row, header) => {
        const fieldMapping = {
            '名称': row.name,
            '制定单位': row.issuer,
            '起草人': row.drafter,
            '标准类型': row.standardType,
            '发布日期': row.publishDate,
            '申请人/单位': row.applicant,
            '申请时间': row.applyTime,
            '类型': row.type,
            'IPC': row.ipc,
            '状态': row.status,
            '项目名称': row.projectName,
            '项目类型': row.projectType,
            '承担单位': row.undertakingUnit,
            '项目负责人': row.projectLeader,
            '关联专利': row.relatedPatent,
            '成果名称': row.achievementName,
            '成果类型': row.achievementType,
            '转化方式': row.transformMethod,
            '受让方': row.assignee,
            '转化主体': row.transformSubject,
            '技术领域': row.techField
        };
        return fieldMapping[header] || '-';
    };

    const handleMouseEnter = (e, content) => {
        const rect = e.target.getBoundingClientRect();
        setTooltip({
            show: true,
            content: content,
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ show: false, content: '', x: 0, y: 0 });
    };

    return (
        <Grid container className={className}>
            {tooltip.show && (
                <div
                    className='tooltip'
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translateX(-50%) translateY(-100%)'
                    }}
                >
                    {tooltip.content}
                </div>
            )}

            <Grid item className='tabs-container'>
                {tabs.map(tab => (
                    <div
                        key={tab}
                        className={`tabletab-item ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </div>
                ))}
            </Grid>

            <Grid item className='table-container'>
                <div className='table-header'>
                    {currentData.headers.map((header, index) => (
                        <div 
                            key={index} 
                            className='header-cell'
                            style={{ flex: currentRatios[index] || 1 }}
                        >
                            <span>{header}</span>
                        </div>
                    ))}
                </div>

                <div className='table-body'>
                    {currentData.rows.map((item, rowIndex) => (
                        <div key={rowIndex} className='table-row'>
                            {currentData.headers.map((header, colIndex) => {
                                const cellValue = getCellValue(item, header);
                                return (
                                    <div 
                                        key={colIndex} 
                                        className='cell'
                                        style={{ flex: currentRatios[colIndex] || 1 }}
                                        onMouseEnter={(e) => handleMouseEnter(e, cellValue)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span>{cellValue}</span>
                                    </div>
                                );
                            })}
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
    position: 'relative',

    '& .tooltip': {
        position: 'fixed',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        color: '#FFFFFF',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 400,
        whiteSpace: 'nowrap',
        zIndex: 9999,
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        fontFamily: 'inherit',
        
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(0, 0, 0, 0.85)'
        }
    },

    '& .tabs-container': {
        display: 'flex',
        width: 'calc(100% - 8px)', 
        flexShrink: 0,
        backgroundColor: '#0d4fa3',
        margin: '4px 4px 0 4px', 
        padding: 0,
        borderRadius: '4px',
        overflow: 'hidden',

        '& .tabletab-item': {
            flex: 1,
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: 'transparent',
            position: 'relative',

            '&:hover': {
                background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)',
                color: '#FFFFFF',
            },

            '&.active': {
                background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)',
                color: '#FFFFFF',
                
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    height: '2px',
                    backgroundColor: '#00ffe4'
                }
            }
        }
    },

    '& .table-container': {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '4px',
        width: '100%',
        minWidth: 0,
    },

    '& .table-header': {
        display: 'flex',
        padding: '10px 0',
        flexShrink: 0,
        backgroundColor: '#0d4fa3',
        width: '100%',
        minWidth: 0,

        '& .header-cell': {
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#00ffe4',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            padding: '0 4px',

            '& span': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: 'center',
            },
        },
    },

    '& .table-body': {
        flex: 1,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.2) rgba(255,255,255,0.05)',
        width: '100%',
        minWidth: 0,

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
        width: '100%',
        minWidth: 0,

        '&:hover': {
            backgroundColor: 'rgba(9, 51, 118)',
        },

        '& .cell': {
            fontSize: '0.95rem',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px',
            overflow: 'hidden',
            cursor: 'default',
            margin: '0 2px',
            borderRadius: '4px',

            '& span': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: 'center',
            },
        },
    },
};

export default styled(Resource)(styles);