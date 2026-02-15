import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/lib/context';
import Colors from '@/constants/colors';

export default function AddPurchaseScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, commonItems, addPurchase, formatCurrency } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceNum = parseFloat(price) || 0;
  const qtyNum = parseInt(quantity) || 1;
  const total = priceNum * qtyNum;

  const canSubmit = itemName.trim().length > 0 && priceNum > 0 && qtyNum > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addPurchase(itemName.trim(), priceNum, qtyNum);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleSelectItem = (name: string, defaultPrice: number) => {
    setItemName(name);
    setPrice(String(defaultPrice));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Purchase</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {commonItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Quick Select</Text>
            <View style={styles.chipRow}>
              {commonItems.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectItem(item.name, item.defaultPrice)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: itemName === item.name ? colors.primary : colors.surface,
                      borderColor: itemName === item.name ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: itemName === item.name ? '#FFF' : colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.chipPrice, { color: itemName === item.name ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
                    {'\u20B9'}{item.defaultPrice}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Item Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. Milk, Bread, Rice..."
            placeholderTextColor={colors.textTertiary}
            value={itemName}
            onChangeText={setItemName}
            autoFocus
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Price ({'\u20B9'})</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => {
                  const n = Math.max(1, qtyNum - 1);
                  setQuantity(String(n));
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.qtyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </Pressable>
              <TextInput
                style={[styles.qtyInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                textAlign="center"
              />
              <Pressable
                onPress={() => {
                  setQuantity(String(qtyNum + 1));
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.qtyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>
        </View>

        {total > 0 && (
          <View style={[styles.totalCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.totalLabel, { color: colors.primary }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(total)}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.primary : colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Ionicons name="checkmark" size={22} color="#FFF" />
          <Text style={styles.submitText}>Add Purchase</Text>
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
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  section: { marginBottom: 20 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  chipText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  chipPrice: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 8 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter_400Regular', fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 44, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 14, fontFamily: 'Inter_600SemiBold', fontSize: 18 },
  totalCard: { borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: 'Inter_500Medium', fontSize: 16 },
  totalValue: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 0 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 16 },
  submitText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFF' },
});
