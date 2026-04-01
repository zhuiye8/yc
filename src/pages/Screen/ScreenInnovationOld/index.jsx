import './innovation.scss'
import EChartsChinaMap from "../components/map";
import Header from "../components/header";
import Bottom from "../components/bottom";
import { useNavigate } from "react-router-dom";
import Patent from "./components/patent";
import AnnualTrend from './components/annual-trend';
import Resource from "./components/resource"
import Hotspot from './components/hotspot';

function Innovation() {
    const navigate = useNavigate();
    const tabs = [
        { name: "产业布局", url: "/screen/industry" },
        { name: "人才总览", url: "/screen/talent" },
        { name: "创新资源", url: "/screen/innovation" },
        { name: "资金概览", url: "/screen/funds" },
        { name: "政策全景", url: "/screen/policy" },
    ]

    const customData = [
        { name: '湖北省', label: '宜昌市', talents: 113349, organization: 34380 },
        { name: '西陵区', label: '西陵区', talents: 18560, organization: 5620 },
        { name: '夷陵区', label: '夷陵区', talents: 16320, organization: 4950 },
        { name: '伍家岗区', label: '伍家岗区', talents: 14280, organization: 4320 },
        { name: '宜都市', label: '宜都市', talents: 12450, organization: 3780 },
        { name: '枝江市', label: '枝江市', talents: 11320, organization: 3430 },
        { name: '猇亭区', label: '猇亭区', talents: 7890, organization: 2390 },
        { name: '点军区', label: '点军区', talents: 6540, organization: 1980 },
        { name: '长阳土家族自治县', label: '长阳县', talents: 8760, organization: 2650 },
        { name: '兴山县', label: '兴山县', talents: 4920, organization: 1490 },
        { name: '当阳市', label: '当阳市', talents: 9820, organization: 2980 },
        { name: '远安县', label: '远安县', talents: 4580, organization: 1390 },
        { name: '秭归县', label: '秭归县', talents: 7320, organization: 2220 },
        { name: '五峰土家族自治县', label: '五峰县', talents: 3820, organization: 1160 },




        { name: '北京市', label: '北京市', talents: 3256800, organization: 98500 },
        { name: '天津市', label: '天津市', talents: 1567200, organization: 47500 },
        { name: '河北省', label: '河北省', talents: 2356400, organization: 71500 },
        { name: '山西省', label: '山西省', talents: 1452300, organization: 44100 },
        { name: '内蒙古自治区', label: '内蒙古', talents: 1125400, organization: 34200 },
        { name: '辽宁省', label: '辽宁省', talents: 1987300, organization: 60300 },
        { name: '吉林省', label: '吉林省', talents: 1243600, organization: 37800 },
        { name: '黑龙江省', label: '黑龙江省', talents: 1356800, organization: 41200 },
        { name: '上海市', label: '上海市', talents: 4235600, organization: 128500 },
        { name: '江苏省', label: '江苏省', talents: 3987800, organization: 121200 },
        { name: '浙江省', label: '浙江省', talents: 3568200, organization: 108600 },
        { name: '安徽省', label: '安徽省', talents: 1876500, organization: 56900 },
        { name: '福建省', label: '福建省', talents: 2134800, organization: 64700 },
        { name: '江西省', label: '江西省', talents: 1567400, organization: 47600 },
        { name: '山东省', label: '山东省', talents: 3879600, organization: 117800 },
        { name: '湖南省', label: '湖南省', talents: 715560, organization: 21700 },
        { name: '河南省', label: '河南省', talents: 2678400, organization: 81300 },
        { name: '广东省', label: '广东省', talents: 5236800, organization: 158900 },
        { name: '广西壮族自治区', label: '广西', talents: 1678200, organization: 50900 },
        { name: '海南省', label: '海南省', talents: 456200, organization: 13800 },
        { name: '重庆市', label: '重庆市', talents: 1896700, organization: 57500 },
        { name: '四川省', label: '四川省', talents: 2567800, organization: 77900 },
        { name: '贵州省', label: '贵州省', talents: 1123400, organization: 34100 },
        { name: '云南省', label: '云南省', talents: 1345600, organization: 40800 },
        { name: '西藏自治区', label: '西藏', talents: 156200, organization: 4700 },
        { name: '陕西省', label: '陕西省', talents: 1789600, organization: 54300 },
        { name: '甘肃省', label: '甘肃省', talents: 987500, organization: 29900 },
        { name: '青海省', label: '青海省', talents: 324800, organization: 9800 },
        { name: '宁夏回族自治区', label: '宁夏', talents: 456700, organization: 13800 },
        { name: '新疆维吾尔自治区', label: '新疆', talents: 876400, organization: 26600 },
        { name: '香港特别行政区', label: '香港', talents: 1234500, organization: 37400 },
        { name: '澳门特别行政区', label: '澳门', talents: 234500, organization: 7100 },
        { name: '台湾省', label: '台湾', talents: 2345600, organization: 71100 }
    ]

    const tooltipFields = [
        { label: '创新人才数', key: 'talents', unit: '人' },
        { label: '创新机构数', key: 'organization', unit: '家' }
    ]

    function handleClick(url) {
        return navigate(url)
    }
    return (
        <div className="main-content innovation-container">
        {/* <Header /> removed - provided by ScreenLayout */}

        <div className="main-content">

            <div className="left-column innovation-left">
                <div className="left-top">
                    <div className='left-top-title'></div>
                    <Patent />
                </div>
                <div className="left-bottom">
                    <div className='left-bottom-title'></div>
                    <AnnualTrend />
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
                    <EChartsChinaMap tooltipFields={tooltipFields}
                    customData={customData}/>
                    </div>
                </div>
            </div>

            <div className="right-column innovation-right">
                <div className="right-top">
                    <div className='right-top-title'></div>
                    <Resource />
                </div>
                <div className="right-bottom">
                    <div className='right-bottom-title'></div>
                    <Hotspot />
                </div>

            </div>
        </div>
        {/* Bottom removed - provided by ScreenLayout */}
        </div>
    );
}

export default Innovation;