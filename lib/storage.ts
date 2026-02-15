import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

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

const KEYS = {
  DEPOSITS: '@grocery_deposits',
  PURCHASES: '@grocery_purchases',
  COMMON_ITEMS: '@grocery_common_items',
  SETTINGS: '@grocery_settings',
};

function generateId(): string {
  return Crypto.randomUUID();
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonthString(date?: Date): string {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const storage = {
  async getDeposits(): Promise<Deposit[]> {
    const data = await AsyncStorage.getItem(KEYS.DEPOSITS);
    return data ? JSON.parse(data) : [];
  },

  async addDeposit(amount: number, note: string = ''): Promise<Deposit> {
    const deposits = await this.getDeposits();
    const deposit: Deposit = {
      id: generateId(),
      amount,
      date: new Date().toISOString(),
      note,
    };
    deposits.push(deposit);
    await AsyncStorage.setItem(KEYS.DEPOSITS, JSON.stringify(deposits));
    return deposit;
  },

  async deleteDeposit(id: string): Promise<void> {
    const deposits = await this.getDeposits();
    const filtered = deposits.filter(d => d.id !== id);
    await AsyncStorage.setItem(KEYS.DEPOSITS, JSON.stringify(filtered));
  },

  async getPurchases(): Promise<Purchase[]> {
    const data = await AsyncStorage.getItem(KEYS.PURCHASES);
    return data ? JSON.parse(data) : [];
  },

  async getTodayPurchases(): Promise<Purchase[]> {
    const purchases = await this.getPurchases();
    const today = getTodayString();
    return purchases.filter(p => p.date.startsWith(today));
  },

  async getMonthPurchases(month?: string): Promise<Purchase[]> {
    const purchases = await this.getPurchases();
    const m = month || getMonthString();
    return purchases.filter(p => p.date.startsWith(m));
  },

  async addPurchase(itemName: string, price: number, quantity: number): Promise<Purchase> {
    const purchases = await this.getPurchases();
    const purchase: Purchase = {
      id: generateId(),
      itemName,
      price,
      quantity,
      totalPrice: price * quantity,
      date: new Date().toISOString(),
    };
    purchases.push(purchase);
    await AsyncStorage.setItem(KEYS.PURCHASES, JSON.stringify(purchases));
    return purchase;
  },

  async updatePurchase(id: string, updates: Partial<Pick<Purchase, 'itemName' | 'price' | 'quantity'>>): Promise<void> {
    const purchases = await this.getPurchases();
    const idx = purchases.findIndex(p => p.id === id);
    if (idx !== -1) {
      if (updates.itemName !== undefined) purchases[idx].itemName = updates.itemName;
      if (updates.price !== undefined) purchases[idx].price = updates.price;
      if (updates.quantity !== undefined) purchases[idx].quantity = updates.quantity;
      purchases[idx].totalPrice = purchases[idx].price * purchases[idx].quantity;
      await AsyncStorage.setItem(KEYS.PURCHASES, JSON.stringify(purchases));
    }
  },

  async deletePurchase(id: string): Promise<void> {
    const purchases = await this.getPurchases();
    const filtered = purchases.filter(p => p.id !== id);
    await AsyncStorage.setItem(KEYS.PURCHASES, JSON.stringify(filtered));
  },

  async getCommonItems(): Promise<CommonItem[]> {
    const data = await AsyncStorage.getItem(KEYS.COMMON_ITEMS);
    if (data) return JSON.parse(data);
    const defaults: CommonItem[] = [
      { id: generateId(), name: '1L Milk', defaultPrice: 60 },
      { id: generateId(), name: '0.5L Milk', defaultPrice: 30 },
      { id: generateId(), name: 'Bread', defaultPrice: 40 },
      { id: generateId(), name: 'Eggs (6)', defaultPrice: 45 },
      { id: generateId(), name: 'Rice (1kg)', defaultPrice: 55 },
      { id: generateId(), name: 'Sugar (1kg)', defaultPrice: 45 },
    ];
    await AsyncStorage.setItem(KEYS.COMMON_ITEMS, JSON.stringify(defaults));
    return defaults;
  },

  async addCommonItem(name: string, defaultPrice: number): Promise<CommonItem> {
    const items = await this.getCommonItems();
    const item: CommonItem = { id: generateId(), name, defaultPrice };
    items.push(item);
    await AsyncStorage.setItem(KEYS.COMMON_ITEMS, JSON.stringify(items));
    return item;
  },

  async updateCommonItem(id: string, name: string, defaultPrice: number): Promise<void> {
    const items = await this.getCommonItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx].name = name;
      items[idx].defaultPrice = defaultPrice;
      await AsyncStorage.setItem(KEYS.COMMON_ITEMS, JSON.stringify(items));
    }
  },

  async deleteCommonItem(id: string): Promise<void> {
    const items = await this.getCommonItems();
    const filtered = items.filter(i => i.id !== id);
    await AsyncStorage.setItem(KEYS.COMMON_ITEMS, JSON.stringify(filtered));
  },

  async getSettings(): Promise<AppSettings> {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { darkMode: null, currency: '\u20B9', monthlyBudget: 5000 };
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getTotalDeposits(): Promise<number> {
    const deposits = await this.getDeposits();
    return deposits.reduce((sum, d) => sum + d.amount, 0);
  },

  async getTotalPurchases(): Promise<number> {
    const purchases = await this.getPurchases();
    return purchases.reduce((sum, p) => sum + p.totalPrice, 0);
  },

  async getBalance(): Promise<number> {
    const totalDeposits = await this.getTotalDeposits();
    const totalPurchases = await this.getTotalPurchases();
    return totalDeposits - totalPurchases;
  },

  async exportData(): Promise<string> {
    const deposits = await this.getDeposits();
    const purchases = await this.getPurchases();
    const commonItems = await this.getCommonItems();
    const settings = await this.getSettings();
    return JSON.stringify({ deposits, purchases, commonItems, settings, exportDate: new Date().toISOString() }, null, 2);
  },

  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    if (data.deposits) await AsyncStorage.setItem(KEYS.DEPOSITS, JSON.stringify(data.deposits));
    if (data.purchases) await AsyncStorage.setItem(KEYS.PURCHASES, JSON.stringify(data.purchases));
    if (data.commonItems) await AsyncStorage.setItem(KEYS.COMMON_ITEMS, JSON.stringify(data.commonItems));
    if (data.settings) await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
  },

  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.DEPOSITS, KEYS.PURCHASES, KEYS.COMMON_ITEMS, KEYS.SETTINGS]);
  },

  getTodayString,
  getMonthString,
};
