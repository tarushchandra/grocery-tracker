import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/lib/context';
import Colors from '@/constants/colors';

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, addCommonItem } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceNum = parseFloat(price) || 0;
  const canSubmit = name.trim().length > 0 && priceNum > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addCommonItem(name.trim(), priceNum);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Common Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.iconPreview, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="bag-add-outline" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Item Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. 1L Milk, Bread, Eggs..."
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 20 }]}>Default Price ({'\u20B9'})</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          This item will appear in your quick-add section for fast purchase entry.
        </Text>
      </View>

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
          <Text style={styles.submitText}>Save Item</Text>
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
  iconPreview: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 28 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 8 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter_400Regular', fontSize: 16 },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 16, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 16 },
  submitText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFF' },
});
