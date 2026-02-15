import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { storage, Deposit, Purchase, CommonItem, AppSettings } from './storage';

interface AppContextValue {
  deposits: Deposit[];
  purchases: Purchase[];
  todayPurchases: Purchase[];
  commonItems: CommonItem[];
  settings: AppSettings;
  balance: number;
  todayTotal: number;
  monthTotal: number;
  isLoading: boolean;
  isDark: boolean;
  addDeposit: (amount: number, note?: string) => Promise<void>;
  deleteDeposit: (id: string) => Promise<void>;
  addPurchase: (itemName: string, price: number, quantity: number) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  addCommonItem: (name: string, defaultPrice: number) => Promise<void>;
  updateCommonItem: (id: string, name: string, defaultPrice: number) => Promise<void>;
  deleteCommonItem: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  getMonthPurchases: (month?: string) => Promise<Purchase[]>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [commonItems, setCommonItems] = useState<CommonItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ darkMode: null, currency: '\u20B9', monthlyBudget: 5000 });
  const [isLoading, setIsLoading] = useState(true);

  const isDark = settings.darkMode === null ? systemScheme === 'dark' : settings.darkMode;

  const refreshData = useCallback(async () => {
    try {
      const [deps, purs, items, sett] = await Promise.all([
        storage.getDeposits(),
        storage.getPurchases(),
        storage.getCommonItems(),
        storage.getSettings(),
      ]);
      setDeposits(deps);
      setPurchases(purs);
      setCommonItems(items);
      setSettings(sett);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const todayStr = storage.getTodayString();
  const monthStr = storage.getMonthString();

  const todayPurchases = useMemo(
    () => purchases.filter(p => p.date.startsWith(todayStr)),
    [purchases, todayStr]
  );

  const todayTotal = useMemo(
    () => todayPurchases.reduce((sum, p) => sum + p.totalPrice, 0),
    [todayPurchases]
  );

  const monthTotal = useMemo(
    () => purchases.filter(p => p.date.startsWith(monthStr)).reduce((sum, p) => sum + p.totalPrice, 0),
    [purchases, monthStr]
  );

  const totalDeposits = useMemo(
    () => deposits.reduce((sum, d) => sum + d.amount, 0),
    [deposits]
  );

  const totalPurchases = useMemo(
    () => purchases.reduce((sum, p) => sum + p.totalPrice, 0),
    [purchases]
  );

  const balance = totalDeposits - totalPurchases;

  const formatCurrency = useCallback((amount: number) => {
    const symbol = settings.currency || '\u20B9';
    const abs = Math.abs(amount);
    if (abs >= 10000000) return `${symbol}${(amount / 10000000).toFixed(2)}Cr`;
    if (abs >= 100000) return `${symbol}${(amount / 100000).toFixed(2)}L`;
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }, [settings.currency]);

  const addDeposit = useCallback(async (amount: number, note?: string) => {
    await storage.addDeposit(amount, note || '');
    const deps = await storage.getDeposits();
    setDeposits(deps);
  }, []);

  const deleteDeposit = useCallback(async (id: string) => {
    await storage.deleteDeposit(id);
    const deps = await storage.getDeposits();
    setDeposits(deps);
  }, []);

  const addPurchase = useCallback(async (itemName: string, price: number, quantity: number) => {
    await storage.addPurchase(itemName, price, quantity);
    const purs = await storage.getPurchases();
    setPurchases(purs);
  }, []);

  const deletePurchase = useCallback(async (id: string) => {
    await storage.deletePurchase(id);
    const purs = await storage.getPurchases();
    setPurchases(purs);
  }, []);

  const addCommonItem = useCallback(async (name: string, defaultPrice: number) => {
    await storage.addCommonItem(name, defaultPrice);
    const items = await storage.getCommonItems();
    setCommonItems(items);
  }, []);

  const updateCommonItem = useCallback(async (id: string, name: string, defaultPrice: number) => {
    await storage.updateCommonItem(id, name, defaultPrice);
    const items = await storage.getCommonItems();
    setCommonItems(items);
  }, []);

  const deleteCommonItem = useCallback(async (id: string) => {
    await storage.deleteCommonItem(id);
    const items = await storage.getCommonItems();
    setCommonItems(items);
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  }, [settings]);

  const getMonthPurchases = useCallback(async (month?: string) => {
    return storage.getMonthPurchases(month);
  }, []);

  const value = useMemo(() => ({
    deposits,
    purchases,
    todayPurchases,
    commonItems,
    settings,
    balance,
    todayTotal,
    monthTotal,
    isLoading,
    isDark,
    addDeposit,
    deleteDeposit,
    addPurchase,
    deletePurchase,
    addCommonItem,
    updateCommonItem,
    deleteCommonItem,
    updateSettings,
    refreshData,
    formatCurrency,
    getMonthPurchases,
  }), [deposits, purchases, todayPurchases, commonItems, settings, balance, todayTotal, monthTotal, isLoading, isDark, addDeposit, deleteDeposit, addPurchase, deletePurchase, addCommonItem, updateCommonItem, deleteCommonItem, updateSettings, refreshData, formatCurrency, getMonthPurchases]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
