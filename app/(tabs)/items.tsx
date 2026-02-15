import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useApp } from '@/lib/context';
import Colors from '@/constants/colors';
import { CommonItem } from '@/lib/storage';

function EditItemModal({ visible, item, isDark, onClose, onSave }: {
  visible: boolean;
  item: CommonItem | null;
  isDark: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, price: number) => void;
}) {
  const colors = isDark ? Colors.dark : Colors.light;
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item ? String(item.defaultPrice) : '');

  React.useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(String(item.defaultPrice));
    }
  }, [item]);

  const priceNum = parseFloat(price) || 0;
  const canSave = name.trim().length > 0 && priceNum > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHandle}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Item</Text>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Item Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Item name"
            placeholderTextColor={colors.textTertiary}
            autoFocus
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 16 }]}>Default Price ({'\u20B9'})</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
          />

          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.modalBtn, styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (canSave && item) {
                  onSave(item.id, name.trim(), priceNum);
                  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onClose();
                }
              }}
              disabled={!canSave}
              style={({ pressed }) => [styles.modalBtn, styles.modalSaveBtn, { backgroundColor: canSave ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ItemCard({ item, isDark, onDelete, onEdit, formatCurrency, onQuickAdd }: {
  item: CommonItem;
  isDark: boolean;
  onDelete: (id: string) => void;
  onEdit: (item: CommonItem) => void;
  formatCurrency: (n: number) => string;
  onQuickAdd: () => void;
}) {
  const colors = isDark ? Colors.dark : Colors.light;
  return (
    <View style={[styles.itemCard, { backgroundColor: colors.surface }]}>
      <Pressable
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onEdit(item);
        }}
        style={styles.itemInfo}
      >
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.itemPriceRow}>
          <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
            {'\u20B9'}{item.defaultPrice}
          </Text>
          <View style={[styles.editHint, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="pencil" size={10} color={colors.textTertiary} />
            <Text style={[styles.editHintText, { color: colors.textTertiary }]}>tap to edit</Text>
          </View>
        </View>
      </Pressable>
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
            onEdit(item);
          }}
          style={({ pressed }) => [styles.itemActionBtn, { backgroundColor: colors.accentLight, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="create-outline" size={16} color={colors.accent} />
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
  const { isDark, commonItems, deleteCommonItem, updateCommonItem, addPurchase, formatCurrency } = useApp();
  const colors = isDark ? Colors.dark : Colors.light;
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<CommonItem | null>(null);

  const filteredItems = commonItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickAdd = async (name: string, price: number) => {
    await addPurchase(name, price, 1);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveEdit = async (id: string, name: string, price: number) => {
    await updateCommonItem(id, name, price);
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
                onEdit={setEditingItem}
                formatCurrency={formatCurrency}
                onQuickAdd={() => handleQuickAdd(item.name, item.defaultPrice)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      <EditItemModal
        visible={!!editingItem}
        item={editingItem}
        isDark={isDark}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
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
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemPrice: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  editHint: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  editHintText: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  itemActions: { flexDirection: 'row', gap: 8 },
  itemActionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', maxWidth: 260 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 12 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFF' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, zIndex: 1 },
  modalHandle: { alignItems: 'center', marginBottom: 16 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, marginBottom: 20 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 8 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Inter_400Regular', fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  modalCancelBtn: {},
  modalSaveBtn: {},
  modalBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});
