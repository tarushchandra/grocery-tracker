import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert, Switch, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/lib/context';
import { storage } from '@/lib/storage';
import Colors from '@/constants/colors';

function SettingsRow({ icon, label, value, onPress, isDark, danger }: { icon: string; label: string; value?: string; onPress: () => void; isDark: boolean; danger?: boolean }) {
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [styles.settingsRow, { backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: danger ? colors.dangerLight : colors.primaryLight }]}>
        <Ionicons name={icon as any} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.settingsLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      {value && <Text style={[styles.settingsValue, { color: colors.textSecondary }]}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

function SettingsToggle({ icon, label, value, onToggle, isDark }: { icon: string; label: string; value: boolean; onToggle: (v: boolean) => void; isDark: boolean }) {
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.settingsRow, { backgroundColor: colors.surface }]}>
      <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.settingsLabel, { color: colors.text, flex: 1 }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFF"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, settings, updateSettings, deposits, purchases, formatCurrency, refreshData } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const totalDeposits = deposits.reduce((s, d) => s + d.amount, 0);
  const totalSpent = purchases.reduce((s, p) => s + p.totalPrice, 0);

  const handleExport = async () => {
    try {
      const data = await storage.exportData();
      await Share.share({ message: data, title: 'Grocery Tracker Backup' });
    } catch (e) {
      Alert.alert('Export Failed', 'Could not export data.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your deposits, purchases, and common items. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAllData();
            await refreshData();
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const darkModeEnabled = settings.darkMode === null ? isDark : settings.darkMode;

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
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Deposits</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalDeposits)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Appearance</Text>
          <View style={styles.settingsGroup}>
            <SettingsToggle
              icon="moon-outline"
              label="Dark Mode"
              value={darkModeEnabled}
              onToggle={(v) => updateSettings({ darkMode: v })}
              isDark={isDark}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Data</Text>
          <View style={styles.settingsGroup}>
            <SettingsRow
              icon="download-outline"
              label="Export Data"
              value="JSON"
              onPress={handleExport}
              isDark={isDark}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingsRow
              icon="trash-outline"
              label="Clear All Data"
              onPress={handleClearData}
              isDark={isDark}
              danger
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>About</Text>
          <View style={styles.settingsGroup}>
            <View style={[styles.settingsRow, { backgroundColor: colors.surface }]}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.settingsLabel, { color: colors.text, flex: 1 }]}>Version</Text>
              <Text style={[styles.settingsValue, { color: colors.textSecondary }]}>1.0.0</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <View style={[styles.depositHistory, { backgroundColor: colors.surface }]}>
            <Text style={[styles.depositHistoryTitle, { color: colors.text }]}>Deposit History</Text>
            {deposits.length === 0 ? (
              <Text style={[styles.noDeposits, { color: colors.textTertiary }]}>No deposits yet</Text>
            ) : (
              deposits.slice().reverse().map((d, i) => (
                <View key={d.id} style={[styles.depositRow, i < deposits.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={[styles.depositAmount, { color: colors.success }]}>+{formatCurrency(d.amount)}</Text>
                    <Text style={[styles.depositDate, { color: colors.textTertiary }]}>
                      {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, marginBottom: 20 },
  summaryCard: { borderRadius: 20, padding: 24, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1 },
  summaryLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  summaryValue: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFF' },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
  settingsGroup: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  settingsIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { fontFamily: 'Inter_500Medium', fontSize: 15 },
  settingsValue: { fontFamily: 'Inter_400Regular', fontSize: 14, marginRight: 4 },
  divider: { height: 0.5, marginLeft: 58 },
  depositHistory: { borderRadius: 16, padding: 16, marginTop: 8 },
  depositHistoryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 12 },
  noDeposits: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  depositRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  depositAmount: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  depositDate: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
});
