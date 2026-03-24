/**
 * @input MUI Grid, 背景图片
 * @output { Indicator } 产业链核心指标组件
 * @position 大屏产业页子组件，展示缺链数/强链数/产业链数/企业总数/人才总数
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import tabImg from '../../../assets/imgs/tooltip.png'
import { Grid2 as Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

function Indicator({className}) {

    const items1 = [
        {title: '缺链数', value: 4},
        {title: '强链数', value: 10},
    ]
    const items2 = [
        {title: '产业链数', value: 6},
        {title: '企业总数', value: 20944},
        {title: '人才总数', value: 419039},
    ]


    return <Grid container className={className}>
        <Grid item size={12} >
            <Grid container className='item-container' 
            spacing={1} justifyContent={'center'}>
                {
                    items1.map((item, index) => {
                        return <Grid item size={4}>
                            <Item key={index} title={item.title} value={item.value} />
                        </Grid>
                    })
                }
            </Grid>
        </Grid>
        <Grid item size={12} >
            <Grid container className='item-container' 
             spacing={1} justifyContent={'center'}>
                {
                    items2.map((item, index) => {
                        return <Grid item size={4}>
                            <Item key={index} title={item.title} value={item.value} />
                        </Grid>
                    })
                }
            </Grid>
        </Grid>
    </Grid>
}

function Item(props) {
    const { title, value } = props
    return <div className='sum'>
                <div className='sum-title'>{title}</div>
                <div className='sum-value'>{value}</div>
        </div>
}

const styles ={
    height: 'calc(100% - 40px)',
    display: 'flex',
    padding: '12px',
    overflow: 'hidden',

    '& .item-container': {
        height: '100%',
        padding: '8px'
    },

    '& .sum': {
        padding: '0.375rem', // 6px转为rem
        textAlign: 'center',
        backgroundImage: `url(${tabImg})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        '@media screen and (max-width: 1440px)': {
            padding: '0.25rem',
        },
    },
    '& .sum-title': {
        color: '#fff',
        lineHeight: 1.2,
        padding: '0.25rem',
        fontWeight: 'bold',
        fontSize: '1.2em',
        
        
        '@media screen and (max-width: 1440px)': {
            fontSize: '1em',
        },
        '@media screen and (max-width: 1280px)': {
            fontSize: '0.9em',
        },
    },
    '& .sum-value': {
        fontSize: 'clamp(1.2rem, 4vw, 2.2rem)',
        fontWeight: 700,
        lineHeight: 1.2,
        background: 'linear-gradient(135deg, #f8d06bff 0%, #FF8A00 100%)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textShadow: '0 2px 4px rgba(255, 138, 0, 0.2)',
        padding: '0.25rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        
        '@media screen and (max-width: 1440px)': {
            fontSize: 'clamp(1rem, 3.5vw, 1.8rem)',
        },
    },



}

export default styled(Indicator)(styles)