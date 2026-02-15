export interface Deposit {
  id: string;
  amount: number;
  date: string;
  note: string;
}

export interface Purchase {
  id: string;
  itemName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  date: string;
}

export interface CommonItem {
  id: string;
  name: string;
  defaultPrice: number;
}

export interface AppSettings {
  darkMode: boolean | null;
  currency: string;
  monthlyBudget: number;
}
