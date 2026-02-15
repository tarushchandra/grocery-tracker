import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/lib/context';
import Colors from '@/constants/colors';

export default function AddDepositScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, addDeposit, formatCurrency, balance } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const canSubmit = amountNum > 0;

  const presets = [100, 200, 500, 1000, 2000, 5000];

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDeposit(amountNum, note.trim());
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Deposit</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.balanceInfo, { backgroundColor: colors.surface }]}>
          <Ionicons name="wallet-outline" size={20} color={colors.primary} />
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Current Balance:</Text>
          <Text style={[styles.balanceValue, { color: colors.primary }]}>{formatCurrency(balance)}</Text>
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Amount ({'\u20B9'})</Text>
        <TextInput
          style={[styles.amountInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          autoFocus
        />

        <View style={styles.presetsRow}>
          {presets.map(p => (
            <Pressable
              key={p}
              onPress={() => {
                setAmount(String(p));
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                styles.presetBtn,
                {
                  backgroundColor: amount === String(p) ? colors.primary : colors.surface,
                  borderColor: amount === String(p) ? colors.primary : colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.presetText, { color: amount === String(p) ? '#FFF' : colors.text }]}>
                {'\u20B9'}{p}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 20 }]}>Note (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. Monthly deposit"
          placeholderTextColor={colors.textTertiary}
          value={note}
          onChangeText={setNote}
        />

        {amountNum > 0 && (
          <View style={[styles.previewCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.previewLabel, { color: colors.primary }]}>New Balance</Text>
            <Text style={[styles.previewValue, { color: colors.primary }]}>{formatCurrency(balance + amountNum)}</Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.accent : colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Ionicons name="wallet" size={20} color="#FFF" />
          <Text style={styles.submitText}>Add Deposit</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
  content: { flex: 1, paddingHorizontal: 20 },
  balanceInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, marginBottom: 24 },
  balanceLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, flex: 1 },
  balanceValue: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 8 },
  amountInput: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 16, fontFamily: 'Inter_700Bold', fontSize: 28, textAlign: 'center', marginBottom: 16 },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  presetText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter_400Regular', fontSize: 16 },
  previewCard: { borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  previewLabel: { fontFamily: 'Inter_500Medium', fontSize: 16 },
  previewValue: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 16 },
  submitText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFF' },
});
