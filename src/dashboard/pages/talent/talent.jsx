/**
 * @input EChartsChinaMap, Header, Bottom from '../../components', Nationwide/Classification/Total/Yichang/ValueChain/GapCount from './components', { useNavigate }
 * @output { Talent } 大屏人才总览页组件
 * @position 大屏人才页入口，组合地图 + 六个人才统计子组件
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import './talent.scss'
import EChartsChinaMap from "../../components/map";
import Header from "../../components/header";
import Bottom from "../../components/bottom";
import { useNavigate } from "react-router-dom";
import NationwideDistribution from './components/nationwide'
import Classification from './components/classfication'
import Total from './components/total'
import Yichang from './components/yichang';
import ValueChain from './components/valuechain';
import GapCount from './components/gapcount';


function Talent() {
    const navigate = useNavigate();
    const tabs = [
        { name: "产业布局", url: "/screen/industry" },
        { name: "人才总览", url: "/screen/talent" },
        { name: "创新资源", url: "/screen" },
        { name: "资金概览", url: "/screen" },
        { name: "政策全景", url: "/screen" },
    ]
    function handleClick(url) {
      console.log('url')
        return navigate(url)
    }
    return (
        <div className="container talent-container">
        <Header />

        <div className="main-content">
            <div className="left-column">
                <div className="left-top">
                    <div className='left-top-title'></div>
                    <NationwideDistribution />
                </div>
                <div className="left-middle">
                    <div className='left-middle-title'></div>
                    <Classification />
                </div>
                <div className="left-bottom">
                    <div className='left-bottom-title'></div>
                    <Total />
                </div>
            </div>

            <div className="middle-column">
                <div className="middle-top">
                    {
                        tabs.map((item, index) => {
                            return (
                                <span 
                                className="tab-item" key={index} 
                                onClick={() => handleClick(item.url)}
                                >
                                    {item.name}
                                </span>
                            )
                        })
                    }
                </div>

                <div className="middle-center">
                    <div className="map-container">
                    <EChartsChinaMap />
                    </div>
                </div>
            </div>

            <div className="right-column">
                <div className="right-top">
                    <div className='right-top-title'></div>
                    <Yichang />
                </div>
                <div className="right-middle">
                    <div className='right-middle-title'></div>
                    <ValueChain />
                </div>
                <div className="right-bottom">
                    <div className='right-bottom-title'></div>
                    <GapCount />
                </div>
            </div>
        </div>
        <Bottom onReturnHome={() => handleClick('/screen')}/>
        </div>
    );
}

export default Talent;