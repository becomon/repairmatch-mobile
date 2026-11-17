import { Image } from 'react-native';

const MARK = require('../../../assets/brand-mark.png');

/** The RepairMatch logo: the R with helmet and wrench on the brand-orange tile. */
export function BrandMark({ size = 56 }: { size?: number }) {
  return <Image source={MARK} accessible={false} style={{ width: size, height: size, borderRadius: size * 0.23 }} />;
}
