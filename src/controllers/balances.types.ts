export interface ICreateBalanceBody {
  month: string;
  broker: 'IBKR' | 'TASTY';
  calculatedBalance: number;
  realBalance?: number;
  delta?: number;
  calculatedDetail?: Record<string, unknown>;
  comment?: string;
}

export interface IUpdateBalanceBody {
  calculatedBalance?: number;
  realBalance?: number;
  delta?: number;
  calculatedDetail?: Record<string, unknown>;
  comment?: string;
}
