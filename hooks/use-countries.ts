// Chinese provinces, autonomous regions, municipalities, and SARs
// Sorted by Pinyin romanisation
const CHINA_REGIONS = [
  { label: "Macau",           value: "CN-MO", latlng: [22.1987, 113.5439] as [number, number], region: "South China" },
  { label: "Anhui",           value: "CN-AH", latlng: [31.8257, 117.2264] as [number, number], region: "East China" },
  { label: "Beijing",         value: "CN-BJ", latlng: [39.9042, 116.4074] as [number, number], region: "North China" },
  { label: "Chongqing",       value: "CN-CQ", latlng: [29.5630, 106.5516] as [number, number], region: "Southwest" },
  { label: "Fujian",          value: "CN-FJ", latlng: [26.0745, 119.2965] as [number, number], region: "East China" },
  { label: "Gansu",           value: "CN-GS", latlng: [35.7521, 104.1869] as [number, number], region: "Northwest" },
  { label: "Guangdong",       value: "CN-GD", latlng: [23.1291, 113.2644] as [number, number], region: "South China" },
  { label: "Guangxi",         value: "CN-GX", latlng: [22.8150, 108.3275] as [number, number], region: "South China" },
  { label: "Guizhou",         value: "CN-GZ", latlng: [26.5983, 106.7078] as [number, number], region: "Southwest" },
  { label: "Hainan",          value: "CN-HI", latlng: [19.1959, 109.7453] as [number, number], region: "South China" },
  { label: "Hebei",           value: "CN-HE", latlng: [38.0428, 114.5149] as [number, number], region: "North China" },
  { label: "Heilongjiang",    value: "CN-HL", latlng: [45.7420, 126.6420] as [number, number], region: "Northeast" },
  { label: "Henan",           value: "CN-HA", latlng: [34.7657, 113.7532] as [number, number], region: "Central China" },
  { label: "Hubei",           value: "CN-HB", latlng: [30.5928, 114.3055] as [number, number], region: "Central China" },
  { label: "Hunan",           value: "CN-HN", latlng: [28.1127, 112.9830] as [number, number], region: "Central China" },
  { label: "Jiangsu",         value: "CN-JS", latlng: [32.0603, 118.7969] as [number, number], region: "East China" },
  { label: "Jiangxi",         value: "CN-JX", latlng: [28.6820, 115.8579] as [number, number], region: "East China" },
  { label: "Jilin",           value: "CN-JL", latlng: [43.8378, 126.5493] as [number, number], region: "Northeast" },
  { label: "Liaoning",        value: "CN-LN", latlng: [41.8357, 123.4290] as [number, number], region: "Northeast" },
  { label: "Inner Mongolia",  value: "CN-NM", latlng: [40.8175, 111.7650] as [number, number], region: "North China" },
  { label: "Ningxia",         value: "CN-NX", latlng: [38.4872, 106.2309] as [number, number], region: "Northwest" },
  { label: "Qinghai",         value: "CN-QH", latlng: [36.6171, 101.7782] as [number, number], region: "Northwest" },
  { label: "Shaanxi",         value: "CN-SN", latlng: [34.2657, 108.9542] as [number, number], region: "Northwest" },
  { label: "Shandong",        value: "CN-SD", latlng: [36.6758, 117.0009] as [number, number], region: "East China" },
  { label: "Shanghai",        value: "CN-SH", latlng: [31.2304, 121.4737] as [number, number], region: "East China" },
  { label: "Shanxi",          value: "CN-SX", latlng: [37.8706, 112.5489] as [number, number], region: "North China" },
  { label: "Sichuan",         value: "CN-SC", latlng: [30.6510, 104.0759] as [number, number], region: "Southwest" },
  { label: "Taiwan",          value: "CN-TW", latlng: [23.6978, 120.9605] as [number, number], region: "East China" },
  { label: "Tianjin",         value: "CN-TJ", latlng: [39.3434, 117.3616] as [number, number], region: "North China" },
  { label: "Hong Kong",       value: "CN-HK", latlng: [22.3193, 114.1694] as [number, number], region: "South China" },
  { label: "Xinjiang",        value: "CN-XJ", latlng: [43.7928, 87.6271]  as [number, number], region: "Northwest" },
  { label: "Tibet",           value: "CN-XZ", latlng: [29.6500, 91.1000]  as [number, number], region: "Southwest" },
  { label: "Yunnan",          value: "CN-YN", latlng: [25.0453, 102.7100] as [number, number], region: "Southwest" },
  { label: "Zhejiang",        value: "CN-ZJ", latlng: [30.2741, 120.1551] as [number, number], region: "East China" },
];

const useCountries = () => {
  const getAll = () => CHINA_REGIONS;

  const getByValue = (value: string) =>
    CHINA_REGIONS.find((r) => r.value === value);

  return { getAll, getByValue };
};

export default useCountries;
