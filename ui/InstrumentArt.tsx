import { Image, ImageStyle, StyleProp } from 'react-native';

const instruments = [
  { key: 'tranh', image: require('../assets/img/Dan_Tranh_Transparent.png') },
  { key: 'nguyệt', image: require('../assets/img/Dan_Nguyet_Transparent.png') },
  { key: 'bầu', image: require('../assets/img/Dan_Bau_Transparent.png') },
  { key: 'nhị', image: require('../assets/img/Dan_Nhi_Transparent.png') },
  { key: 'tỳ', image: require('../assets/img/Dan_Ty_Ba_Transparent.png') },
  { key: 'tì', image: require('../assets/img/Dan_Ty_Ba_Transparent.png') },
  { key: 'đáy', image: require('../assets/img/Dan_Day_Transparent.png') },
];
export function InstrumentArt({ instrument, style }: { instrument?: string | null; style?: StyleProp<ImageStyle> }) {
  const source = instruments.find(item => instrument?.toLocaleLowerCase('vi').includes(item.key))?.image
    ?? require('../assets/img/Sao_Truc_Transparent.png');
  return <Image source={source} resizeMode="contain" style={style} accessible={false} />;
}
