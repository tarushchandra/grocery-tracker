import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/lib/context';
import Colors from '@/constants/colors';

function BarChart({ data, maxVal, color, isDark, showValues }: { data: { label: string; value: number }[]; maxVal: number; color: string; isDark: boolean; showValues?: boolean }) {
  const colors = isDark ? Colors.dark : Colors.light;
  if (maxVal === 0) return null;
  return (
    <View style={styles.chartContainer}>
      <View style={styles.barsRow}>
        {data.map((d, i) => (
          <View key={i} style={styles.barCol}>
            {showValues && d.value > 0 && (
              <Text style={[styles.barValue, { color: colors.textTertiary }]}>{d.value}</Text>
            )}
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

function HorizontalBar({ label, value, maxVal, color, isDark, formatCurrency }: any) {
  const colors = isDark ? Colors.dark : Colors.light;
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
  return (
    <View style={styles.hBarRow}>
      <Text style={[styles.hBarLabel, { color: colors.text }]} numberOfLines={1}>{label}</Text>
      <View style={[styles.hBarTrack, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={[styles.hBarFill, { backgroundColor: color, width: `${Math.max(pct, 3)}%` }]} />
      </View>
      <Text style={[styles.hBarValue, { color: colors.textSecondary }]}>{formatCurrency(value)}</Text>
    </View>
  );
}

function StatCard({ icon, label, value, subValue, color, isDark }: { icon: string; label: string; value: string; subValue?: string; color: string; isDark: boolean }) {
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      {subValue && <Text style={[styles.statSubValue, { color: colors.textTertiary }]}>{subValue}</Text>}
    </View>
  );
}

function SpendingRing({ spent, budget, isDark, formatCurrency }: { spent: number; budget: number; isDark: boolean; formatCurrency: (n: number) => string }) {
  const colors = isDark ? Colors.dark : Colors.light;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;
  const ringColor = isOver ? colors.danger : pct > 75 ? colors.warning : colors.primary;
  const segments = 20;
  const filled = Math.round((pct / 100) * segments);

  return (
    <View style={[styles.ringCard, { backgroundColor: colors.surface }]}>
      <View style={styles.ringVisual}>
        <View style={styles.ringCircle}>
          {Array.from({ length: segments }).map((_, i) => {
            const angle = (i / segments) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const r = 48;
            const x = 52 + r * Math.cos(rad);
            const y = 52 + r * Math.sin(rad);
            const isFilled = i < filled;
            return (
              <View
                key={i}
                style={[
                  styles.ringDot,
                  {
                    left: x - 4,
                    top: y - 4,
                    backgroundColor: isFilled ? ringColor : colors.surfaceSecondary,
                  },
                ]}
              />
            );
          })}
          <View style={styles.ringCenter}>
            <Text style={[styles.ringPct, { color: ringColor }]}>{Math.round(pct)}%</Text>
            <Text style={[styles.ringLabel, { color: colors.textTertiary }]}>used</Text>
          </View>
        </View>
      </View>
      <View style={styles.ringInfo}>
        <View style={styles.ringRow}>
          <View style={[styles.ringIndicator, { backgroundColor: ringColor }]} />
          <Text style={[styles.ringText, { color: colors.textSecondary }]}>Spent</Text>
          <Text style={[styles.ringAmount, { color: colors.text }]}>{formatCurrency(spent)}</Text>
        </View>
        <View style={styles.ringRow}>
          <View style={[styles.ringIndicator, { backgroundColor: colors.surfaceSecondary }]} />
          <Text style={[styles.ringText, { color: colors.textSecondary }]}>Budget</Text>
          <Text style={[styles.ringAmount, { color: colors.text }]}>{formatCurrency(budget)}</Text>
        </View>
        <View style={styles.ringRow}>
          <View style={[styles.ringIndicator, { backgroundColor: isOver ? colors.danger : colors.success }]} />
          <Text style={[styles.ringText, { color: colors.textSecondary }]}>{isOver ? 'Over' : 'Remaining'}</Text>
          <Text style={[styles.ringAmount, { color: isOver ? colors.danger : colors.success }]}>
            {formatCurrency(Math.abs(budget - spent))}
          </Text>
        </View>
      </View>
    </View>
  );
}

function CalendarGrid({ monthPurchases, year, month, isDark }: any) {
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

function WeekdayAnalysis({ monthPurchases, isDark, formatCurrency }: any) {
  const colors = isDark ? Colors.dark : Colors.light;
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totals = [0, 0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  monthPurchases.forEach((p: any) => {
    const day = new Date(p.date).getDay();
    totals[day] += p.totalPrice;
    counts[day]++;
  });

  const maxTotal = Math.max(...totals, 1);
  const busiestDay = totals.indexOf(Math.max(...totals));

  return (
    <View style={[styles.weekdayCard, { backgroundColor: colors.surface }]}>
      <View style={styles.weekdayHeader}>
        <Text style={[styles.weekdayTitle, { color: colors.text }]}>Spending by Day of Week</Text>
        {monthPurchases.length > 0 && (
          <Text style={[styles.weekdaySubtitle, { color: colors.textTertiary }]}>
            Busiest: {weekdays[busiestDay]}
          </Text>
        )}
      </View>
      <View style={styles.weekdayBars}>
        {weekdays.map((day, i) => {
          const pct = maxTotal > 0 ? (totals[i] / maxTotal) * 100 : 0;
          const isBusiest = i === busiestDay && totals[i] > 0;
          return (
            <View key={day} style={styles.weekdayCol}>
              <View style={[styles.weekdayBarBg, { backgroundColor: colors.surfaceSecondary }]}>
                <View
                  style={[
                    styles.weekdayBarFill,
                    {
                      backgroundColor: isBusiest ? colors.accent : colors.primary,
                      height: `${Math.max(pct, totals[i] > 0 ? 8 : 0)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.weekdayLabel, { color: isBusiest ? colors.accent : colors.textTertiary, fontFamily: isBusiest ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SpendingTrend({ purchases, isDark, formatCurrency }: any) {
  const colors = isDark ? Colors.dark : Colors.light;

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    purchases.forEach((p: any) => {
      const m = p.date.substring(0, 7);
      map[m] = (map[m] || 0) + p.totalPrice;
    });
    const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.slice(-6);
  }, [purchases]);

  if (monthlyData.length < 2) return null;

  const maxVal = Math.max(...monthlyData.map(d => d[1]), 1);
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const lastTwo = monthlyData.slice(-2);
  const trend = lastTwo.length === 2 ? lastTwo[1][1] - lastTwo[0][1] : 0;
  const trendPct = lastTwo.length === 2 && lastTwo[0][1] > 0 ? Math.round((trend / lastTwo[0][1]) * 100) : 0;

  return (
    <View style={[styles.trendCard, { backgroundColor: colors.surface }]}>
      <View style={styles.trendHeader}>
        <Text style={[styles.trendTitle, { color: colors.text }]}>Spending Trend</Text>
        {trend !== 0 && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? colors.dangerLight : colors.primaryLight }]}>
            <Ionicons name={trend > 0 ? 'trending-up' : 'trending-down'} size={14} color={trend > 0 ? colors.danger : colors.success} />
            <Text style={[styles.trendBadgeText, { color: trend > 0 ? colors.danger : colors.success }]}>
              {Math.abs(trendPct)}%
            </Text>
          </View>
        )}
      </View>
      <View style={styles.trendChart}>
        {monthlyData.map(([m, val], i) => {
          const parts = m.split('-');
          const mIdx = parseInt(parts[1]) - 1;
          const pct = (val / maxVal) * 100;
          return (
            <View key={m} style={styles.trendCol}>
              <Text style={[styles.trendValue, { color: colors.textSecondary }]}>{formatCurrency(val)}</Text>
              <View style={[styles.trendBarBg, { backgroundColor: colors.surfaceSecondary }]}>
                <View
                  style={[
                    styles.trendBarFill,
                    {
                      backgroundColor: i === monthlyData.length - 1 ? colors.primary : colors.primary + '60',
                      height: `${Math.max(pct, 8)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.trendLabel, { color: colors.textTertiary }]}>{monthShort[mIdx]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function InsightsCard({ monthPurchases, purchases, isDark, formatCurrency, deposits }: any) {
  const colors = isDark ? Colors.dark : Colors.light;

  const insights: { icon: string; text: string; color: string }[] = [];

  if (monthPurchases.length > 0) {
    const dailyMap: Record<number, number> = {};
    monthPurchases.forEach((p: any) => {
      const d = new Date(p.date).getDate();
      dailyMap[d] = (dailyMap[d] || 0) + p.totalPrice;
    });
    const days = Object.keys(dailyMap).length;
    const avg = monthPurchases.reduce((s: number, p: any) => s + p.totalPrice, 0) / days;
    insights.push({ icon: 'analytics-outline', text: `You spend an average of ${formatCurrency(Math.round(avg))} on days you shop`, color: colors.primary });

    const itemCounts: Record<string, number> = {};
    monthPurchases.forEach((p: any) => {
      itemCounts[p.itemName] = (itemCounts[p.itemName] || 0) + p.quantity;
    });
    const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
    if (topItem) {
      insights.push({ icon: 'star-outline', text: `Your most purchased item is "${topItem[0]}" (${topItem[1]}x)`, color: colors.accent });
    }

    const uniqueItems = Object.keys(itemCounts).length;
    insights.push({ icon: 'grid-outline', text: `You bought ${uniqueItems} different items this month`, color: '#8B5CF6' });

    const totalDeposited = deposits.reduce((s: number, d: any) => s + d.amount, 0);
    const totalSpent = purchases.reduce((s: number, p: any) => s + p.totalPrice, 0);
    const burnRate = totalSpent > 0 && totalDeposited > totalSpent
      ? Math.round((totalDeposited - totalSpent) / (totalSpent / purchases.length))
      : 0;
    if (burnRate > 0) {
      insights.push({ icon: 'timer-outline', text: `At current rate, your balance lasts ~${burnRate} more purchases`, color: colors.warning });
    }
  }

  if (insights.length === 0) return null;

  return (
    <View style={[styles.insightsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.insightsTitle, { color: colors.text }]}>Insights</Text>
      {insights.map((insight, i) => (
        <View key={i} style={[styles.insightRow, i < insights.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
          <View style={[styles.insightIcon, { backgroundColor: insight.color + '18' }]}>
            <Ionicons name={insight.icon as any} size={18} color={insight.color} />
          </View>
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>{insight.text}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, purchases, deposits, formatCurrency, settings } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
      .slice(0, 8);
  }, [monthPurchases]);

  const avgDaily = monthPurchases.length > 0 ? monthTotal / daysInMonth : 0;
  const purchaseCount = monthPurchases.length;
  const activeDays = useMemo(() => {
    const set = new Set<number>();
    monthPurchases.forEach(p => set.add(new Date(p.date).getDate()));
    return set.size;
  }, [monthPurchases]);

  const avgPerVisit = activeDays > 0 ? monthTotal / activeDays : 0;
  const uniqueItems = useMemo(() => {
    const set = new Set<string>();
    monthPurchases.forEach(p => set.add(p.itemName));
    return set.size;
  }, [monthPurchases]);

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const topItemMaxVal = topItems.length > 0 ? topItems[0][1].total : 1;

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
          <View style={styles.monthCenter}>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {fullMonthNames[selectedMonth]}
            </Text>
            <Text style={[styles.yearText, { color: colors.textTertiary }]}>{selectedYear}</Text>
          </View>
          <Pressable onPress={nextMonth} style={[styles.navBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <SpendingRing spent={monthTotal} budget={settings.monthlyBudget} isDark={isDark} formatCurrency={formatCurrency} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.statsRow}>
          <StatCard icon="cash-outline" label="Total Spent" value={formatCurrency(monthTotal)} color={colors.primary} isDark={isDark} />
          <StatCard icon="calendar-outline" label="Avg/Day" value={formatCurrency(Math.round(avgDaily))} subValue={`${activeDays} active days`} color={colors.accent} isDark={isDark} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.statsRow}>
          <StatCard icon="receipt-outline" label="Purchases" value={String(purchaseCount)} subValue={`${uniqueItems} unique items`} color="#8B5CF6" isDark={isDark} />
          <StatCard icon="storefront-outline" label="Avg/Visit" value={formatCurrency(Math.round(avgPerVisit))} subValue="per shopping trip" color="#EC4899" isDark={isDark} />
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
              <BarChart data={dailyData} maxVal={maxDaily} color={colors.primary} isDark={isDark} showValues />
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <WeekdayAnalysis monthPurchases={monthPurchases} isDark={isDark} formatCurrency={formatCurrency} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <SpendingTrend purchases={purchases} isDark={isDark} formatCurrency={formatCurrency} />
        </Animated.View>

        {topItems.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(350)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Items</Text>
            <View style={[styles.topItemsList, { backgroundColor: colors.surface }]}>
              {topItems.map(([name, data], i) => (
                <View key={name} style={[styles.topItem, i < topItems.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
                  <View style={[styles.topItemRank, { backgroundColor: i === 0 ? colors.accent + '20' : i === 1 ? colors.primary + '15' : colors.surfaceSecondary }]}>
                    <Text style={[styles.topItemRankText, { color: i === 0 ? colors.accent : i === 1 ? colors.primary : colors.textSecondary }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={styles.topItemInfo}>
                    <Text style={[styles.topItemName, { color: colors.text }]}>{name}</Text>
                    <View style={styles.topItemMeta}>
                      <Text style={[styles.topItemCount, { color: colors.textTertiary }]}>{data.count}x</Text>
                      <View style={[styles.topItemBar, { backgroundColor: colors.surfaceSecondary }]}>
                        <View style={[styles.topItemBarFill, { backgroundColor: i === 0 ? colors.accent : colors.primary, width: `${(data.total / topItemMaxVal) * 100}%` }]} />
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.topItemTotal, { color: colors.primary }]}>{formatCurrency(data.total)}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Calendar</Text>
          <CalendarGrid
            monthPurchases={monthPurchases}
            year={selectedYear}
            month={selectedMonth}
            isDark={isDark}
            formatCurrency={formatCurrency}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(450)}>
          <InsightsCard
            monthPurchases={monthPurchases}
            purchases={purchases}
            isDark={isDark}
            formatCurrency={formatCurrency}
            deposits={deposits}
          />
        </Animated.View>
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
  monthCenter: { alignItems: 'center', minWidth: 140 },
  monthTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  yearText: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  statSubValue: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, marginBottom: 12, marginTop: 12 },
  chartCard: { borderRadius: 16, padding: 16 },
  chartContainer: {},
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 140 },
  barCol: { flex: 1, alignItems: 'center', height: '100%' },
  barBg: { flex: 1, width: '80%', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4, minHeight: 0 },
  barLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 4 },
  barValue: { fontFamily: 'Inter_400Regular', fontSize: 7, marginBottom: 2 },
  emptyChart: { borderRadius: 16, padding: 32, alignItems: 'center', gap: 8 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  ringCard: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  ringVisual: { marginRight: 20 },
  ringCircle: { width: 104, height: 104, position: 'relative' },
  ringDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  ringLabel: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  ringInfo: { flex: 1, gap: 10 },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ringIndicator: { width: 8, height: 8, borderRadius: 4 },
  ringText: { fontFamily: 'Inter_400Regular', fontSize: 13, flex: 1 },
  ringAmount: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  weekdayCard: { borderRadius: 16, padding: 16, marginTop: 12 },
  weekdayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  weekdayTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  weekdaySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  weekdayBars: { flexDirection: 'row', gap: 6, height: 100 },
  weekdayCol: { flex: 1, alignItems: 'center' },
  weekdayBarBg: { flex: 1, width: '75%', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  weekdayBarFill: { width: '100%', borderRadius: 6 },
  weekdayLabel: { fontSize: 10, marginTop: 4 },
  trendCard: { borderRadius: 16, padding: 16, marginTop: 12 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  trendTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  trendBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  trendChart: { flexDirection: 'row', gap: 8, height: 120 },
  trendCol: { flex: 1, alignItems: 'center' },
  trendValue: { fontFamily: 'Inter_400Regular', fontSize: 8, marginBottom: 4 },
  trendBarBg: { flex: 1, width: '70%', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  trendBarFill: { width: '100%', borderRadius: 6 },
  trendLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 4 },
  hBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  hBarLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, width: 80 },
  hBarTrack: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  hBarFill: { height: '100%', borderRadius: 4 },
  hBarValue: { fontFamily: 'Inter_500Medium', fontSize: 12, width: 60, textAlign: 'right' },
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
  topItemName: { fontFamily: 'Inter_500Medium', fontSize: 14, marginBottom: 4 },
  topItemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topItemCount: { fontFamily: 'Inter_400Regular', fontSize: 11, width: 24 },
  topItemBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  topItemBarFill: { height: '100%', borderRadius: 2 },
  topItemTotal: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  insightsCard: { borderRadius: 16, padding: 16, marginTop: 12 },
  insightsTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginBottom: 12 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  insightIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
});
