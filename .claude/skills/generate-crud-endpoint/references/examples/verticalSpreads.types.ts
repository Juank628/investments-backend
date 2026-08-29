export interface ICreateVerticalSpreadBody {
  ticker: string;
  openDateTime: string;
  dayType: 'normal' | 'gap too hight' | 'risk event';
  maxGapFirst15min: number;
  priceAtOpen: number;
  straddleAtOpen: number;
  strategy: 'bearCallSpread' | 'bullPutSpread';
  strike: number;
  width: number;
  delta: number;
  credit: number;
  dte: number;
  closeDateTime?: string;
  priceAtClose?: number;
  netProfitLoss?: number;
}

export interface IUpdateVerticalSpreadBody {
  ticker?: string;
  openDateTime?: string;
  dayType?: 'normal' | 'gap too hight' | 'risk event';
  maxGapFirst15min?: number;
  priceAtOpen?: number;
  straddleAtOpen?: number;
  strategy?: 'bearCallSpread' | 'bullPutSpread';
  strike?: number;
  width?: number;
  delta?: number;
  credit?: number;
  dte?: number;
  closeDateTime?: string;
  priceAtClose?: number;
  netProfitLoss?: number;
}
