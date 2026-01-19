import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard, Image, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { Product } from '../../types';
import { Package, Plus, Edit2, Trash2, X, Save, Upload, Camera, Check } from 'lucide-react-native';
import { addProduct, updateProduct, deleteProduct, subscribeToProducts, uploadProductImage } from '../../services/productService';
import { subscribeToCategories } from '../../services/categoryService';
import * as ImagePicker from 'expo-image-picker';
import { Category } from '../../types';

export default function AdminProductsScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [stockModalVisible, setStockModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
    const [stockToAdd, setStockToAdd] = useState('');
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState<{
        name: string;
        barcode: string;
        category: string;
        price: string;
        stock: string;
        unitType: 'piece' | 'kg';
        image: string;
        imageBase64?: string | null;
        isCampaign: boolean;
        brand: string;
        campaignPrice: string;
        campaignDuration: '1_day' | '3_days' | '1_week' | '1_month' | null;
    }>({
        name: '',
        barcode: '',
        category: '',
        price: '',
        stock: '',
        unitType: 'piece',
        image: '',
        imageBase64: null,
        isCampaign: false,
        brand: '',
        campaignPrice: '',
        campaignDuration: null
    });

    useEffect(() => {
        const unsubscribeProd = subscribeToProducts((data) => {
            setProducts(data);
        });
        const unsubscribeCat = subscribeToCategories((data) => {
            setCategories(data);
        });
        return () => {
            unsubscribeProd();
            unsubscribeCat();
        };
    }, []);

    const openAddModal = () => {
        setEditingProduct(null);
        setForm({
            name: '',
            barcode: '',
            category: '',
            price: '',
            stock: '',
            unitType: 'piece',
            image: '',
            imageBase64: null,
            brand: '',
            isCampaign: false,
            campaignPrice: '',
            campaignDuration: null
        });
        setModalVisible(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            barcode: product.barcode,
            category: product.category,
            price: (product.originalPrice || product.price).toString(), // Show original price if campaign active
            stock: product.stock.toString(),
            unitType: product.unitType,
            brand: product.brand || '',
            image: product.imageUrl || '',
            imageBase64: null,
            isCampaign: product.isCampaign || false,
            campaignPrice: product.isCampaign ? product.price.toString() : '', // Current price is campaign price if active
            campaignDuration: null // Reset duration on edit, user sets new if needed
        });
        setModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            // No base64 needed for form data upload usually, but keeping uri is key
        });

        if (!result.canceled) {
            setForm(prev => ({
                ...prev,
                image: result.assets[0].uri,
                // imageBase64: result.assets[0].base64 // Not needed for multipart
            }));
        }
    };

    const uploadImage = async (uri: string): Promise<string> => {
        try {
            return await uploadProductImage(uri);
        } catch (error) {
            console.error("Upload failed", error);
            throw error;
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.price || !form.category) {
            Alert.alert('Hata', 'Lütfen gerekli alanları doldurun');
            return;
        }

        setUploading(true);
        try {
            let imageUrl = form.image;

            // If local URI (starts with file: or content:)
            if (form.image && (form.image.startsWith('file:') || form.image.startsWith('content:'))) {
                imageUrl = await uploadImage(form.image);
            }

            // Campaign Logic
            let finalPrice = parseFloat(form.price.replace(',', '.'));
            let originalPrice = undefined;
            let campaignStartDate = undefined;
            let campaignEndDate = undefined;

            if (form.isCampaign && form.campaignPrice) {
                // If it's a campaign, the main price becomes the campaign price
                // The original price is preserved (or set to current main price if new)
                originalPrice = editingProduct?.originalPrice || parseFloat(form.price.replace(',', '.'));
                finalPrice = parseFloat(form.campaignPrice.replace(',', '.'));

                campaignStartDate = new Date().toISOString();

                // Calculate End Date
                const now = new Date();
                switch (form.campaignDuration) {
                    case '1_day': now.setDate(now.getDate() + 1); break;
                    case '3_days': now.setDate(now.getDate() + 3); break;
                    case '1_week': now.setDate(now.getDate() + 7); break;
                    case '1_month': now.setMonth(now.getMonth() + 1); break;
                    default: now.setDate(now.getDate() + 7); break; // Default 1 week
                }
                campaignEndDate = now.toISOString();
            } else if (!form.isCampaign && editingProduct?.isCampaign) {
                // If turning OFF campaign, revert price
                if (editingProduct.originalPrice) {
                    finalPrice = editingProduct.originalPrice;
                }
            }

            const productData = {
                name: form.name,
                brand: form.brand,
                barcode: form.barcode,
                category: form.category,
                price: finalPrice,
                originalPrice: originalPrice,
                stock: parseInt(form.stock),
                unitType: form.unitType,
                imageUrl: imageUrl || 'https://via.placeholder.com/150',
                isCampaign: form.isCampaign,
                campaignStartDate,
                campaignEndDate,
                salesCount: 0
            };

            Keyboard.dismiss();

            if (editingProduct) {
                // Don't overwrite salesCount if editing
                const { salesCount, ...updateData } = productData;
                await updateProduct(editingProduct.id, updateData);
            } else {
                await addProduct(productData);
            }
            setModalVisible(false);
            setForm({
                name: '',
                barcode: '',
                category: '',
                price: '',
                stock: '',
                unitType: 'piece',
                image: '',
                imageBase64: null,
                brand: '',
                isCampaign: false,
                campaignPrice: '',
                campaignDuration: null
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Kayıt sırasında bir hata oluştur ' + (error as any).message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Ürünü Sil',
            'Bu ürünü silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: async () => await deleteProduct(id) }
            ]
        );
    };

    const openStockModal = (product: Product) => {
        setSelectedProductForStock(product);
        setStockToAdd('');
        setStockModalVisible(true);
    };

    const handleQuickStockAdd = async () => {
        if (!selectedProductForStock || !stockToAdd) return;

        const amount = parseInt(stockToAdd);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Hata', 'Geçerli bir miktar giriniz');
            return;
        }

        setUploading(true);
        try {
            const newStock = (selectedProductForStock.stock || 0) + amount;
            await updateProduct(selectedProductForStock.id, { stock: newStock });

            Alert.alert('Başarılı', `${amount} ${selectedProductForStock.unitType === 'kg' ? 'kg' : 'adet'} stok eklendi. Yeni stok: ${newStock}`);
            setStockModalVisible(false);
            setSelectedProductForStock(null);
            setStockToAdd('');
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Stok güncellenirken bir hata oluştu');
        } finally {
            setUploading(false);
        }
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.iconBox}>
                    <Package color={COLORS.primary} size={24} />
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productCategory}>{item.category}</Text>
                    <Text style={styles.productPrice}>{item.price.toFixed(2)} ₺ / {item.unitType === 'kg' ? 'kg' : 'adet'}</Text>
                </View>
                <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>{item.stock}</Text>
                    <Text style={styles.stockLabel}>Stok</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.success + '20' }]} onPress={() => openStockModal(item)}>
                    <Plus color={COLORS.success} size={18} />
                </TouchableOpacity>
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
            <FlatList
                data={products}
                keyExtractor={item => item.id}
                renderItem={renderProduct}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                        <Plus color={COLORS.white} size={20} />
                        <Text style={styles.addButtonText}>Yeni Ürün Ekle</Text>
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
                                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X color={COLORS.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={{ marginBottom: 20 }}>
                                <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                                    {form.image ? (
                                        <View>
                                            <Image source={{ uri: form.image }} style={styles.imagePreview} />
                                            <View style={styles.editImageIcon}>
                                                <Edit2 color={COLORS.white} size={16} />
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <Camera color={COLORS.textSecondary} size={32} />
                                            <Text style={styles.imagePlaceholderText}>Ürün Fotoğrafı Ekle</Text>
                                            <Text style={{ ...styles.imagePlaceholderText, fontSize: 10, marginTop: 4 }}>(İsteğe Bağlı)</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                {form.image ? (
                                    <TouchableOpacity
                                        style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 20 }}
                                        onPress={() => setForm(prev => ({ ...prev, image: '', imageBase64: null }))}
                                    >
                                        <X color={COLORS.white} size={16} />
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Ürün Adı"
                                placeholderTextColor={COLORS.textSecondary}
                                value={form.name}
                                onChangeText={text => setForm(prev => ({ ...prev, name: text }))}
                                returnKeyType="next"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Marka (İsteğe Bağlı)"
                                placeholderTextColor={COLORS.textSecondary}
                                value={form.brand}
                                onChangeText={text => setForm(prev => ({ ...prev, brand: text }))}
                                returnKeyType="next"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Barkod"
                                placeholderTextColor={COLORS.textSecondary}
                                value={form.barcode}
                                onChangeText={text => setForm(prev => ({ ...prev, barcode: text }))}
                                returnKeyType="next"
                            />

                            <Text style={styles.label}>Kategori Seçimi:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelectScroll}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryOption,
                                            form.category === cat.id && styles.categoryOptionActive
                                        ]}
                                        onPress={() => setForm(prev => ({ ...prev, category: cat.id }))}
                                    >
                                        <Text style={[
                                            styles.categoryOptionText,
                                            form.category === cat.id && styles.categoryOptionTextActive
                                        ]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TextInput
                                style={styles.input}
                                placeholder="Fiyat (₺)"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="decimal-pad"
                                value={form.price}
                                onChangeText={text => setForm(prev => ({ ...prev, price: text }))}
                                returnKeyType="next"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Stok"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="number-pad"
                                value={form.stock}
                                onChangeText={text => setForm(prev => ({ ...prev, stock: text }))}
                                returnKeyType="done"
                            />

                            <TouchableOpacity
                                style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.isCampaign ? 10 : 20 }]}
                                onPress={() => setForm(prev => ({ ...prev, isCampaign: !prev.isCampaign }))}
                            >
                                <Text style={{ color: COLORS.text }}>Kampanyalı Ürün Yap</Text>
                                <View style={{
                                    width: 24, height: 24,
                                    borderRadius: 4,
                                    borderWidth: 2,
                                    borderColor: form.isCampaign ? COLORS.primary : COLORS.textSecondary,
                                    backgroundColor: form.isCampaign ? COLORS.primary : 'transparent',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {form.isCampaign && <Check size={16} color={COLORS.white} />}
                                </View>
                            </TouchableOpacity>

                            {form.isCampaign && (
                                <View style={styles.campaignSection}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="İndirimli Kampanya Fiyatı (₺)"
                                        placeholderTextColor={COLORS.textSecondary}
                                        keyboardType="decimal-pad"
                                        value={form.campaignPrice}
                                        onChangeText={text => setForm(prev => ({ ...prev, campaignPrice: text }))}
                                    />

                                    <Text style={styles.label}>Kampanya Süresi:</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationSelectScroll}>
                                        {[
                                            { label: '1 Gün', value: '1_day' },
                                            { label: '3 Gün', value: '3_days' },
                                            { label: '1 Hafta', value: '1_week' },
                                            { label: '1 Ay', value: '1_month' }
                                        ].map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.durationOption,
                                                    form.campaignDuration === option.value && styles.durationOptionActive
                                                ]}
                                                onPress={() => setForm(prev => ({ ...prev, campaignDuration: option.value as any }))}
                                            >
                                                <Text style={[
                                                    styles.durationOptionText,
                                                    form.campaignDuration === option.value && styles.durationOptionTextActive
                                                ]}>
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.unitTypeRow}>
                                <TouchableOpacity
                                    style={[styles.unitBtn, form.unitType === 'piece' && styles.unitBtnActive]}
                                    onPress={() => setForm(prev => ({ ...prev, unitType: 'piece' }))}
                                >
                                    <Text style={[styles.unitBtnText, form.unitType === 'piece' && styles.unitBtnTextActive]}>Adet</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.unitBtn, form.unitType === 'kg' && styles.unitBtnActive]}
                                    onPress={() => setForm(prev => ({ ...prev, unitType: 'kg' }))}
                                >
                                    <Text style={[styles.unitBtnText, form.unitType === 'kg' && styles.unitBtnTextActive]}>Kg</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, uploading && { opacity: 0.7 }]}
                                onPress={handleSave}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Save color={COLORS.white} size={20} />
                                )}
                                <Text style={styles.saveButtonText}>
                                    {uploading ? 'Yükleniyor...' : 'Kaydet'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Quick Stock Add Modal */}
            <Modal visible={stockModalVisible} animationType="fade" transparent>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={[styles.modalContent, { maxHeight: 300 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Stok Ekle</Text>
                            <TouchableOpacity onPress={() => setStockModalVisible(false)}>
                                <X color={COLORS.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ marginBottom: 10, color: COLORS.textSecondary }}>
                            {selectedProductForStock?.name} için eklenecek miktar:
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Miktar Giriniz"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="number-pad"
                            value={stockToAdd}
                            onChangeText={setStockToAdd}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleQuickStockAdd}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Plus color={COLORS.white} size={20} />
                            )}
                            <Text style={styles.saveButtonText}>Stok Ekle</Text>
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
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.small,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    productCategory: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    productPrice: {
        color: COLORS.success,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    stockBadge: {
        backgroundColor: 'rgba(0, 224, 150, 0.1)',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: 8,
        alignItems: 'center',
    },
    stockText: {
        color: COLORS.success,
        fontSize: 18,
        fontWeight: 'bold',
    },
    stockLabel: {
        color: COLORS.textSecondary,
        fontSize: 11,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.m,
        gap: SPACING.s,
        borderTopWidth: 1,
        borderTopColor: COLORS.glassBorder,
        paddingTop: SPACING.m,
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
        maxHeight: '85%',
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
    unitTypeRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.l,
    },
    unitBtn: {
        flex: 1,
        padding: SPACING.m,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    unitBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    unitBtnText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    unitBtnTextActive: {
        color: COLORS.white,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.success,
        padding: SPACING.m,
        borderRadius: 12,
        gap: SPACING.s,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    categorySelectScroll: {
        marginBottom: SPACING.m,
        flexGrow: 0,
    },
    categoryOption: {
        paddingHorizontal: SPACING.m,
        paddingVertical: 10,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 20,
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    categoryOptionActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryOptionText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    categoryOptionTextActive: {
        color: COLORS.white,
    },
    imageSelector: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 16,
        marginBottom: SPACING.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    editImageIcon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 20,
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.s,
    },
    imagePlaceholderText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    campaignSection: {
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    durationSelectScroll: {
        marginBottom: SPACING.s,
        flexGrow: 0,
        marginTop: 8,
    },
    durationOption: {
        paddingHorizontal: SPACING.m,
        paddingVertical: 8,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 20,
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    durationOptionActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    durationOptionText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    durationOptionTextActive: {
        color: COLORS.white,
    }
});
