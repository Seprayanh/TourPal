// Chinese provinces, autonomous regions, municipalities, and SARs
// Sorted by Pinyin romanisation
const CHINA_REGIONS = [
  { label: "Aomen (澳门)",         value: "CN-MO", latlng: [22.1987, 113.5439] as [number, number], region: "华南" },
  { label: "Anhui (安徽)",          value: "CN-AH", latlng: [31.8257, 117.2264] as [number, number], region: "华东" },
  { label: "Beijing (北京)",        value: "CN-BJ", latlng: [39.9042, 116.4074] as [number, number], region: "华北" },
  { label: "Chongqing (重庆)",      value: "CN-CQ", latlng: [29.5630, 106.5516] as [number, number], region: "西南" },
  { label: "Fujian (福建)",         value: "CN-FJ", latlng: [26.0745, 119.2965] as [number, number], region: "华东" },
  { label: "Gansu (甘肃)",          value: "CN-GS", latlng: [35.7521, 104.1869] as [number, number], region: "西北" },
  { label: "Guangdong (广东)",      value: "CN-GD", latlng: [23.1291, 113.2644] as [number, number], region: "华南" },
  { label: "Guangxi (广西)",        value: "CN-GX", latlng: [22.8150, 108.3275] as [number, number], region: "华南" },
  { label: "Guizhou (贵州)",        value: "CN-GZ", latlng: [26.5983, 106.7078] as [number, number], region: "西南" },
  { label: "Hainan (海南)",         value: "CN-HI", latlng: [19.1959, 109.7453] as [number, number], region: "华南" },
  { label: "Hebei (河北)",          value: "CN-HE", latlng: [38.0428, 114.5149] as [number, number], region: "华北" },
  { label: "Heilongjiang (黑龙江)", value: "CN-HL", latlng: [45.7420, 126.6420] as [number, number], region: "东北" },
  { label: "Henan (河南)",          value: "CN-HA", latlng: [34.7657, 113.7532] as [number, number], region: "华中" },
  { label: "Hubei (湖北)",          value: "CN-HB", latlng: [30.5928, 114.3055] as [number, number], region: "华中" },
  { label: "Hunan (湖南)",          value: "CN-HN", latlng: [28.1127, 112.9830] as [number, number], region: "华中" },
  { label: "Jiangsu (江苏)",        value: "CN-JS", latlng: [32.0603, 118.7969] as [number, number], region: "华东" },
  { label: "Jiangxi (江西)",        value: "CN-JX", latlng: [28.6820, 115.8579] as [number, number], region: "华东" },
  { label: "Jilin (吉林)",          value: "CN-JL", latlng: [43.8378, 126.5493] as [number, number], region: "东北" },
  { label: "Liaoning (辽宁)",       value: "CN-LN", latlng: [41.8357, 123.4290] as [number, number], region: "东北" },
  { label: "Nei Mongol (内蒙古)",   value: "CN-NM", latlng: [40.8175, 111.7650] as [number, number], region: "华北" },
  { label: "Ningxia (宁夏)",        value: "CN-NX", latlng: [38.4872, 106.2309] as [number, number], region: "西北" },
  { label: "Qinghai (青海)",        value: "CN-QH", latlng: [36.6171, 101.7782] as [number, number], region: "西北" },
  { label: "Shaanxi (陕西)",        value: "CN-SN", latlng: [34.2657, 108.9542] as [number, number], region: "西北" },
  { label: "Shandong (山东)",       value: "CN-SD", latlng: [36.6758, 117.0009] as [number, number], region: "华东" },
  { label: "Shanghai (上海)",       value: "CN-SH", latlng: [31.2304, 121.4737] as [number, number], region: "华东" },
  { label: "Shanxi (山西)",         value: "CN-SX", latlng: [37.8706, 112.5489] as [number, number], region: "华北" },
  { label: "Sichuan (四川)",        value: "CN-SC", latlng: [30.6510, 104.0759] as [number, number], region: "西南" },
  { label: "Taiwan (台湾)",         value: "CN-TW", latlng: [23.6978, 120.9605] as [number, number], region: "华东" },
  { label: "Tianjin (天津)",        value: "CN-TJ", latlng: [39.3434, 117.3616] as [number, number], region: "华北" },
  { label: "Xianggang (香港)",      value: "CN-HK", latlng: [22.3193, 114.1694] as [number, number], region: "华南" },
  { label: "Xinjiang (新疆)",       value: "CN-XJ", latlng: [43.7928, 87.6271]  as [number, number], region: "西北" },
  { label: "Xizang (西藏)",         value: "CN-XZ", latlng: [29.6500, 91.1000]  as [number, number], region: "西南" },
  { label: "Yunnan (云南)",         value: "CN-YN", latlng: [25.0453, 102.7100] as [number, number], region: "西南" },
  { label: "Zhejiang (浙江)",       value: "CN-ZJ", latlng: [30.2741, 120.1551] as [number, number], region: "华东" },
];

const useCountries = () => {
  const getAll = () => CHINA_REGIONS;

  const getByValue = (value: string) =>
    CHINA_REGIONS.find((r) => r.value === value);

  return { getAll, getByValue };
};

export default useCountries;
