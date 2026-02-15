import React, { useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert,
  Animated as RNAnimated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApp } from '@/lib/context';
import Colors from '@/constants/colors';

function AnimatedBalanceCard() {
  const { balance, todayTotal, isDark, formatCurrency, deposits } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const totalDeposited = deposits.reduce((s, d) => s + d.amount, 0);
  const isLow = balance < 100 && balance >= 0;
  const isNegative = balance < 0;

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(100)} style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <View style={styles.balanceBadge}>
          <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      <Text style={[styles.balanceAmount, isNegative && { color: '#FCA5A5' }]}>
        {formatCurrency(balance)}
      </Text>
      {(isLow || isNegative) && (
        <View style={styles.warningPill}>
          <Ionicons name="warning-outline" size={12} color="#FEF3C7" />
          <Text style={styles.warningText}>
            {isNegative ? 'Balance is negative!' : 'Low balance warning'}
          </Text>
        </View>
      )}
      <View style={styles.balanceRow}>
        <View style={styles.balanceStat}>
          <Text style={styles.balanceStatLabel}>Total Deposited</Text>
          <Text style={styles.balanceStatValue}>{formatCurrency(totalDeposited)}</Text>
        </View>
        <View style={[styles.balanceDivider]} />
        <View style={styles.balanceStat}>
          <Text style={styles.balanceStatLabel}>Today's Spend</Text>
          <Text style={styles.balanceStatValue}>{formatCurrency(todayTotal)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function QuickActionButton({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color: string }) {
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

function QuickAddItem({ name, price, onAdd, isDark }: { name: string; price: number; onAdd: () => void; isDark: boolean }) {
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onAdd();
      }}
      style={({ pressed }) => [
        styles.quickAddItem,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[styles.quickAddName, { color: colors.text }]} numberOfLines={1}>{name}</Text>
      <Text style={[styles.quickAddPrice, { color: colors.primary }]}>{'\u20B9'}{price}</Text>
      <Ionicons name="add-circle" size={20} color={colors.primary} />
    </Pressable>
  );
}

function PurchaseRow({ item, isDark, onDelete, formatCurrency }: any) {
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <Pressable
      onLongPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Delete Purchase', `Remove ${item.itemName}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
        ]);
      }}
      style={[styles.purchaseRow, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.purchaseDot, { backgroundColor: colors.primary }]} />
      <View style={styles.purchaseInfo}>
        <Text style={[styles.purchaseName, { color: colors.text }]}>{item.itemName}</Text>
        <Text style={[styles.purchaseQty, { color: colors.textSecondary }]}>
          {item.quantity > 1 ? `${item.quantity} x ${formatCurrency(item.price)}` : ''}
        </Text>
      </View>
      <Text style={[styles.purchasePrice, { color: colors.text }]}>{formatCurrency(item.totalPrice)}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, todayPurchases, commonItems, addPurchase, deletePurchase, formatCurrency, monthTotal, balance } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleQuickAdd = async (name: string, price: number) => {
    await addPurchase(name, price, 1);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
        <Animated.View entering={FadeInDown.duration(400)} style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{dayNames[today.getDay()]}</Text>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {today.getDate()} {monthNames[today.getMonth()]}
            </Text>
          </View>
          <View style={[styles.monthBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.monthBadgeText, { color: colors.primary }]}>
              This month: {formatCurrency(monthTotal)}
            </Text>
          </View>
        </Animated.View>

        <AnimatedBalanceCard />

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.actionsRow}>
          <QuickActionButton icon="add-circle-outline" label="Purchase" onPress={() => router.push('/add-purchase')} color={colors.primary} />
          <QuickActionButton icon="wallet-outline" label="Deposit" onPress={() => router.push('/add-deposit')} color={colors.accent} />
        </Animated.View>

        {commonItems.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Add</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickAddRow}>
              {commonItems.slice(0, 6).map(item => (
                <QuickAddItem
                  key={item.id}
                  name={item.name}
                  price={item.defaultPrice}
                  onAdd={() => handleQuickAdd(item.name, item.defaultPrice)}
                  isDark={isDark}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Purchases</Text>
            {todayPurchases.length > 0 && (
              <Text style={[styles.sectionCount, { color: colors.primary }]}>
                {todayPurchases.length} item{todayPurchases.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {todayPurchases.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Ionicons name="receipt-outline" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No purchases today</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                Tap the + button to add your first purchase
              </Text>
            </View>
          ) : (
            <View style={[styles.purchaseList, { backgroundColor: colors.surface }]}>
              {todayPurchases.map(p => (
                <PurchaseRow key={p.id} item={p} isDark={isDark} onDelete={deletePurchase} formatCurrency={formatCurrency} />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <Pressable
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/add-purchase');
        }}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, bottom: Platform.OS === 'web' ? 100 : 100, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontFamily: 'Inter_500Medium', fontSize: 14, marginBottom: 2 },
  dateText: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  monthBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  monthBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  balanceCard: { borderRadius: 20, padding: 24, marginBottom: 20 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  balanceBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  balanceAmount: { fontFamily: 'Inter_700Bold', fontSize: 36, color: '#FFF', marginBottom: 16 },
  warningPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 16 },
  warningText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FEF3C7' },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flex: 1 },
  balanceStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balanceStatValue: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFF' },
  balanceDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickAction: { flex: 1, alignItems: 'center', gap: 8 },
  quickActionIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  quickAddRow: { gap: 10, paddingBottom: 4, marginBottom: 24 },
  quickAddItem: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  quickAddName: { fontFamily: 'Inter_500Medium', fontSize: 13, maxWidth: 90 },
  quickAddPrice: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, marginBottom: 12 },
  sectionCount: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  emptyState: { borderRadius: 16, padding: 32, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center' },
  purchaseList: { borderRadius: 16, overflow: 'hidden' },
  purchaseRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  purchaseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  purchaseInfo: { flex: 1 },
  purchaseName: { fontFamily: 'Inter_500Medium', fontSize: 15 },
  purchaseQty: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  purchasePrice: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
});
