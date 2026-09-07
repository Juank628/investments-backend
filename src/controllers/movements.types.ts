export interface ICreateMovementBody {
  dateTime: string;
  broker: 'IBKR' | 'TASTY';
  amount: number;
  description: string;
  userId: string;
}

export interface IUpdateMovementBody {
  dateTime?: string;
  broker?: 'IBKR' | 'TASTY';
  amount?: number;
  description?: string;
  userId?: string;
}

export interface IGetAllMovementsQuery {
  fromDate?: string;
  toDate?: string;
}
