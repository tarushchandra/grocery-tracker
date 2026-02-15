import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/lib/context';
import Colors from '@/constants/colors';

function BarChart({ data, maxVal, color, isDark }: { data: { label: string; value: number }[]; maxVal: number; color: string; isDark: boolean }) {
  const colors = isDark ? Colors.dark : Colors.light;
  if (maxVal === 0) return null;
  return (
    <View style={styles.chartContainer}>
      <View style={styles.barsRow}>
        {data.map((d, i) => (
          <View key={i} style={styles.barCol}>
            <View style={[styles.barBg, { backgroundColor: colors.surfaceSecondary }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: color,
                    height: `${Math.max((d.value / maxVal) * 100, d.value > 0 ? 5 : 0)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: colors.textTertiary }]}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatCard({ icon, label, value, color, isDark }: { icon: string; label: string; value: string; color: string; isDark: boolean }) {
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function CalendarGrid({ monthPurchases, year, month, isDark, formatCurrency }: any) {
  const colors = isDark ? Colors.dark : Colors.light;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const dailyTotals: Record<number, number> = {};
  monthPurchases.forEach((p: any) => {
    const d = new Date(p.date).getDate();
    dailyTotals[d] = (dailyTotals[d] || 0) + p.totalPrice;
  });

  const maxDaily = Math.max(...Object.values(dailyTotals), 1);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<View key={`e${i}`} style={styles.calCell} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const total = dailyTotals[d] || 0;
    const intensity = total > 0 ? Math.max(0.15, total / maxDaily) : 0;
    const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    cells.push(
      <View key={d} style={[styles.calCell, total > 0 && { backgroundColor: `rgba(${isDark ? '52,211,153' : '13,159,110'},${intensity})` }, isToday && styles.calToday]}>
        <Text style={[styles.calDay, { color: isToday ? colors.primary : colors.text }]}>{d}</Text>
        {total > 0 && (
          <Text style={[styles.calAmount, { color: colors.textSecondary }]} numberOfLines={1}>
            {total}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.calendar, { backgroundColor: colors.surface }]}>
      <View style={styles.calHeader}>
        {dayLabels.map(l => (
          <View key={l} style={styles.calCell}>
            <Text style={[styles.calHeaderText, { color: colors.textTertiary }]}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={styles.calGrid}>{cells}</View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, purchases, deposits, formatCurrency } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthPurchases = useMemo(
    () => purchases.filter(p => p.date.startsWith(monthStr)),
    [purchases, monthStr]
  );

  const monthTotal = useMemo(
    () => monthPurchases.reduce((s, p) => s + p.totalPrice, 0),
    [monthPurchases]
  );

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyData = useMemo(() => {
    const map: Record<number, number> = {};
    monthPurchases.forEach(p => {
      const d = new Date(p.date).getDate();
      map[d] = (map[d] || 0) + p.totalPrice;
    });
    const result: { label: string; value: number }[] = [];
    const step = daysInMonth > 15 ? 3 : 1;
    for (let i = 1; i <= daysInMonth; i += step) {
      let sum = 0;
      for (let j = 0; j < step && i + j <= daysInMonth; j++) {
        sum += map[i + j] || 0;
      }
      result.push({ label: String(i), value: sum });
    }
    return result;
  }, [monthPurchases, daysInMonth]);

  const maxDaily = useMemo(() => Math.max(...dailyData.map(d => d.value), 1), [dailyData]);

  const topItems = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    monthPurchases.forEach(p => {
      if (!map[p.itemName]) map[p.itemName] = { count: 0, total: 0 };
      map[p.itemName].count += p.quantity;
      map[p.itemName].total += p.totalPrice;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);
  }, [monthPurchases]);

  const avgDaily = monthPurchases.length > 0 ? monthTotal / daysInMonth : 0;
  const purchaseCount = monthPurchases.length;

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: (Platform.OS !== 'web' ? insets.top : webTopInset) + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>

        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={[styles.navBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {monthNames[selectedMonth]} {selectedYear}
          </Text>
          <Pressable onPress={nextMonth} style={[styles.navBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.statsRow}>
          <StatCard icon="cash-outline" label="Total Spent" value={formatCurrency(monthTotal)} color={colors.primary} isDark={isDark} />
          <StatCard icon="calendar-outline" label="Avg/Day" value={formatCurrency(Math.round(avgDaily))} color={colors.accent} isDark={isDark} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.statsRow}>
          <StatCard icon="receipt-outline" label="Purchases" value={String(purchaseCount)} color="#8B5CF6" isDark={isDark} />
          <StatCard icon="trending-down-outline" label="Highest Day" value={formatCurrency(maxDaily)} color={colors.danger} isDark={isDark} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Spending</Text>
          {monthPurchases.length === 0 ? (
            <View style={[styles.emptyChart, { backgroundColor: colors.surface }]}>
              <Ionicons name="bar-chart-outline" size={32} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No data for this month</Text>
            </View>
          ) : (
            <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
              <BarChart data={dailyData} maxVal={maxDaily} color={colors.primary} isDark={isDark} />
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Calendar</Text>
          <CalendarGrid
            monthPurchases={monthPurchases}
            year={selectedYear}
            month={selectedMonth}
            isDark={isDark}
            formatCurrency={formatCurrency}
          />
        </Animated.View>

        {topItems.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Items</Text>
            <View style={[styles.topItemsList, { backgroundColor: colors.surface }]}>
              {topItems.map(([name, data], i) => (
                <View key={name} style={[styles.topItem, i < topItems.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
                  <View style={[styles.topItemRank, { backgroundColor: i === 0 ? colors.accent + '20' : colors.surfaceSecondary }]}>
                    <Text style={[styles.topItemRankText, { color: i === 0 ? colors.accent : colors.textSecondary }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={styles.topItemInfo}>
                    <Text style={[styles.topItemName, { color: colors.text }]}>{name}</Text>
                    <Text style={[styles.topItemCount, { color: colors.textSecondary }]}>{data.count}x purchased</Text>
                  </View>
                  <Text style={[styles.topItemTotal, { color: colors.primary }]}>{formatCurrency(data.total)}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, marginBottom: 20 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 },
  navBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, minWidth: 120, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, gap: 8 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, marginBottom: 12, marginTop: 12 },
  chartCard: { borderRadius: 16, padding: 16 },
  chartContainer: {},
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 120 },
  barCol: { flex: 1, alignItems: 'center', height: '100%' },
  barBg: { flex: 1, width: '80%', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4, minHeight: 0 },
  barLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 4 },
  emptyChart: { borderRadius: 16, padding: 32, alignItems: 'center', gap: 8 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  calendar: { borderRadius: 16, padding: 12 },
  calHeader: { flexDirection: 'row', marginBottom: 4 },
  calHeaderText: { fontFamily: 'Inter_500Medium', fontSize: 11, textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, padding: 2 },
  calToday: { borderWidth: 1.5, borderColor: '#0D9F6E' },
  calDay: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  calAmount: { fontFamily: 'Inter_400Regular', fontSize: 8 },
  topItemsList: { borderRadius: 16, overflow: 'hidden' },
  topItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  topItemRank: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topItemRankText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  topItemInfo: { flex: 1 },
  topItemName: { fontFamily: 'Inter_500Medium', fontSize: 15 },
  topItemCount: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  topItemTotal: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});
