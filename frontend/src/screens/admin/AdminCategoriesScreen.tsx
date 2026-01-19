import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, X, Save, Grid } from 'lucide-react-native';
import { subscribeToCategories, addCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import { CATEGORIES } from '../../utils/mockData';

export default function AdminCategoriesScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form, setForm] = useState({
        name: '',
        icon: '', // For now we'll just use text or existing logic, later maybe proper icon picker
    });

    useEffect(() => {
        const unsubscribe = subscribeToCategories((data) => {
            setCategories(data);
        });
        return () => unsubscribe();
    }, []);

    const openAddModal = () => {
        setEditingCategory(null);
        setForm({ name: '', icon: '' });
        setModalVisible(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setForm({
            name: category.name,
            icon: category.icon || ''
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!form.name) {
            Alert.alert('Hata', 'Kategori adı zorunludur');
            return;
        }

        try {
            const categoryData = {
                name: form.name,
                icon: form.icon || 'default_icon'
            };

            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryData);
            } else {
                await addCategory(categoryData as any);
            }
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu.');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Kategoriyi Sil',
            'Bu kategoriyi silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: async () => await deleteCategory(id) }
            ]
        );
    };

    const seedCategories = async () => {
        Alert.alert(
            'Verileri Aktar',
            'Mevcut mock kategorileri Firestore\'a eklenecek. Onaylıyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Aktar',
                    onPress: async () => {
                        for (const cat of CATEGORIES) {
                            try {
                                await addCategory({
                                    name: cat.name,
                                    icon: cat.icon
                                } as any);
                            } catch (e) {
                                console.log('Error seeding', cat.name);
                            }
                        }
                        Alert.alert('Tamamlandı', 'Kategoriler aktarıldı.');
                    }
                }
            ]
        );
    }

    const renderItem = ({ item }: { item: Category }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.iconBox}>
                    <Grid color={COLORS.primary} size={24} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.idText}>ID: {item.id}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
                    <Edit2 color={COLORS.primary} size={18} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
                    <Trash2 color={COLORS.error} size={18} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerActions}>
                {categories.length === 0 && (
                    <TouchableOpacity style={styles.seedButton} onPress={seedCategories}>
                        <Text style={styles.seedButtonText}>Mock Verileri Aktar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={categories}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                        <Plus color={COLORS.white} size={20} />
                        <Text style={styles.addButtonText}>Yeni Kategori Ekle</Text>
                    </TouchableOpacity>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X color={COLORS.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Kategori Adı"
                            placeholderTextColor={COLORS.textSecondary}
                            value={form.name}
                            onChangeText={text => setForm(prev => ({ ...prev, name: text }))}
                        />

                        {/* Future: Icon Picker */}

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Save color={COLORS.white} size={20} />
                            <Text style={styles.saveButtonText}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    list: {
        padding: SPACING.m,
    },
    headerActions: {
        padding: SPACING.m,
        alignItems: 'flex-end',
    },
    seedButton: {
        padding: SPACING.s,
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
    },
    seedButtonText: {
        color: COLORS.white,
        fontSize: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.m,
        gap: SPACING.s,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.small,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    info: {
        flex: 1,
    },
    name: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    idText: {
        color: COLORS.textSecondary,
        fontSize: 10,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    actionBtn: {
        padding: SPACING.s,
        borderRadius: 8,
        backgroundColor: COLORS.surfaceLight,
    },
    deleteBtn: {
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING.l,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 12,
        padding: SPACING.m,
        color: COLORS.text,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.success,
        padding: SPACING.m,
        borderRadius: 12,
        gap: SPACING.s,
        marginTop: SPACING.m,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
