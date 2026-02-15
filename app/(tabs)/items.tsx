import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useApp } from '@/lib/context';
import Colors from '@/constants/colors';

function ItemCard({ item, isDark, onDelete, onEdit, formatCurrency, onQuickAdd }: any) {
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.itemCard, { backgroundColor: colors.surface }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
          Default: {formatCurrency(item.defaultPrice)}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onQuickAdd();
          }}
          style={({ pressed }) => [styles.itemActionBtn, { backgroundColor: colors.primaryLight, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="add" size={18} color={colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Delete Item', `Remove "${item.name}" from common items?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
            ]);
          }}
          style={({ pressed }) => [styles.itemActionBtn, { backgroundColor: colors.dangerLight, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

export default function ItemsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, commonItems, deleteCommonItem, addPurchase, formatCurrency } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const [search, setSearch] = useState('');

  const filteredItems = commonItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickAdd = async (name: string, price: number) => {
    await addPurchase(name, price, 1);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Common Items</Text>
          <Pressable
            onPress={() => router.push('/add-item')}
            style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search items..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              {search ? 'No items found' : 'No common items yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              {search ? 'Try a different search' : 'Add items you buy frequently for quick access'}
            </Text>
            {!search && (
              <Pressable
                onPress={() => router.push('/add-item')}
                style={({ pressed }) => [styles.emptyBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
              >
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.emptyBtnText}>Add First Item</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredItems.map((item, i) => (
            <Animated.View key={item.id} entering={FadeInDown.duration(300).delay(i * 50)}>
              <ItemCard
                item={item}
                isDark={isDark}
                onDelete={deleteCommonItem}
                onEdit={() => {}}
                formatCurrency={formatCurrency}
                onQuickAdd={() => handleQuickAdd(item.name, item.defaultPrice)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28 },
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, padding: 0 },
  itemCard: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginBottom: 4 },
  itemPrice: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  itemActions: { flexDirection: 'row', gap: 8 },
  itemActionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', maxWidth: 260 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 12 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFF' },
});
