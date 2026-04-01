import './funds.scss'
import EChartsChinaMap from "../components/map";
import Header from "../components/header";
import Bottom from "../components/bottom";
import { useNavigate } from "react-router-dom";
import Indicator from "./components/indicator";
import Product from "./components/product";
import CredictList from "./components/credict-list"
import FundOverview from "./components/fund-overview"

function Funds() {
    const navigate = useNavigate();
    const tabs = [
        { name: "产业布局", url: "/screen/industry" },
        { name: "人才总览", url: "/screen/talent" },
        { name: "创新资源", url: "/screen/innovation" },
        { name: "资金概览", url: "/screen/funds" },
        { name: "政策全景", url: "/screen/policy" },
    ]

        const customData = [
            // {name: '湖北省', label:'宜昌市', registered: 89933, creditAmount: 30.2},
            { name: '西陵区', label: '西陵区', registered: 12560, creditAmount: 4.2 },
            { name: '夷陵区', label: '夷陵区', registered: 10890, creditAmount: 3.8 },
            { name: '伍家岗区', label: '伍家岗区', registered: 9850, creditAmount: 3.5 },
            { name: '宜都市', label: '宜都市', registered: 8760, creditAmount: 3.2 },
            { name: '枝江市', label: '枝江市', registered: 7920, creditAmount: 2.9 },
            { name: '猇亭区', label: '猇亭区', registered: 5680, creditAmount: 2.1 },
            { name: '点军区', label: '点军区', registered: 4320, creditAmount: 1.8 },
            { name: '长阳土家族自治县', label: '长阳县', registered: 6580, creditAmount: 2.3 },
            { name: '兴山县', label: '兴山县', registered: 4120, creditAmount: 1.5 },
            { name: '当阳市', label: '当阳市', registered: 7340, creditAmount: 2.6 },
            { name: '远安县', label: '远安县', registered: 3850, creditAmount: 1.4 },
            { name: '秭归县', label: '秭归县', registered: 5460, creditAmount: 1.9 },
            { name: '五峰土家族自治县', label: '五峰县', registered: 3100, creditAmount: 1.1 },
        ]

    const tooltipFields = [
            { label: '注册人数', key: 'registered', unit: '人' },
            { label: '授信金额', key: 'creditAmount', unit: '亿' }
    ]

    function handleClick(url) {
        return navigate(url)
    }
    return (
        <div className="main-content funds-container">
        {/* <Header /> removed - provided by ScreenLayout */}

        <div className="main-content">

            <div className="left-column funds-left">
                <div className="left-top">
                    <div className='left-top-title'></div>
                    <Indicator/>
                </div>
                <div className="left-bottom">
                    <div className='left-bottom-title'></div>
                    <Product/>
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
                    <EChartsChinaMap isYichang={true} 
                    tooltipFields={tooltipFields}
                    customData={customData}/>
                    </div>
                </div>
            </div>

            <div className="right-column funds-right">
                <div className="right-top">
                    <div className='right-top-title'></div>
                    <FundOverview/>
                </div>
                <div className="right-bottom">
                    <div className='right-bottom-title'></div>
                    <CredictList/>
                </div>

            </div>
        </div>
        {/* Bottom removed - provided by ScreenLayout */}
        </div>
    );
}

export default Funds;