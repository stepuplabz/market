import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { Product } from '../../types';
import { Search, Percent, X, Save, Clock, Trash2, CheckCircle2 } from 'lucide-react-native';
import { updateProduct, subscribeToProducts } from '../../services/productService';

export default function AdminCampaignsScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [campaignPrice, setCampaignPrice] = useState('');
    const [duration, setDuration] = useState<'1_day' | '3_days' | '1_week' | '1_month' | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToProducts((data) => {
            setProducts(data);
        });
        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchText.toLowerCase()))
    );

    // Filter to show active campaigns at the top if search is empty
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (searchText) return 0;
        return (Number(b.isCampaign) - Number(a.isCampaign));
    });

    const openCampaignModal = (product: Product) => {
        setSelectedProduct(product);
        setCampaignPrice(product.isCampaign ? product.price.toString() : '');
        setDuration(null); // Reset duration
        setModalVisible(true);
    };

    const handleSaveCampaign = async () => {
        if (!selectedProduct) return;
        if (!campaignPrice || !duration) {
            Alert.alert('Hata', 'Lütfen fiyat ve süre seçiniz.');
            return;
        }

        const price = parseFloat(campaignPrice.replace(',', '.'));
        if (isNaN(price) || price <= 0) {
            Alert.alert('Hata', 'Geçerli bir fiyat giriniz.');
            return;
        }

        setUploading(true);
        try {
            const now = new Date();
            let endDate = new Date();

            switch (duration) {
                case '1_day': endDate.setDate(now.getDate() + 1); break;
                case '3_days': endDate.setDate(now.getDate() + 3); break;
                case '1_week': endDate.setDate(now.getDate() + 7); break;
                case '1_month': endDate.setMonth(now.getMonth() + 1); break;
            }

            // Original Price Logic:
            // If already campaign, keep original. If not, set current price as original.
            const originalPrice = selectedProduct.isCampaign && selectedProduct.originalPrice
                ? selectedProduct.originalPrice
                : selectedProduct.price;

            await updateProduct(selectedProduct.id, {
                isCampaign: true,
                price: price, // Campaign Price
                originalPrice: originalPrice,
                campaignStartDate: now.toISOString(),
                campaignEndDate: endDate.toISOString()
            });

            Alert.alert('Başarılı', 'Kampanya oluşturuldu!');
            setModalVisible(false);
            setSelectedProduct(null);
            setCampaignPrice('');
            setDuration(null);
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Kampanya oluşturulamadı.');
        } finally {
            setUploading(false);
        }
    };

    const removeCampaign = async (product: Product) => {
        Alert.alert('Kampanyayı Kaldır', 'Bu ürünün kampanyasını bitirmek istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Kaldır',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const originalPrice = product.originalPrice || product.price;
                        await updateProduct(product.id, {
                            isCampaign: false,
                            price: originalPrice,
                            originalPrice: undefined, // Clear original price
                            campaignStartDate: undefined,
                            campaignEndDate: undefined
                        });
                        Alert.alert('Başarılı', 'Kampanya kaldırıldı.');
                    } catch (error) {
                        Alert.alert('Hata', 'İşlem başarısız.');
                    }
                }
            }
        ]);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <View style={[styles.card, item.isCampaign && { borderColor: COLORS.primary, borderWidth: 1 }]}>
            <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.name}</Text>
                {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}

                <View style={styles.priceRow}>
                    {item.isCampaign && (
                        <Text style={styles.oldPrice}>{item.originalPrice?.toFixed(2)} ₺</Text>
                    )}
                    <Text style={[styles.price, item.isCampaign && { color: COLORS.primary }]}>
                        {item.price.toFixed(2)} ₺
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                {item.isCampaign ? (
                    <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => removeCampaign(item)}>
                        <Trash2 color={COLORS.error} size={20} />
                    </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                    style={[styles.actionBtn, styles.addBtn, item.isCampaign && { backgroundColor: COLORS.surfaceLight }]}
                    onPress={() => openCampaignModal(item)}
                >
                    {item.isCampaign ? (
                        <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Düzenle</Text>
                    ) : (
                        <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Kampanya Yap</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Search color={COLORS.textSecondary} size={20} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Ürün Ara..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            <FlatList
                data={sortedProducts}
                keyExtractor={item => item.id}
                renderItem={renderProduct}
                contentContainerStyle={styles.list}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Kampanya Oluştur</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X color={COLORS.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        {selectedProduct && (
                            <View style={styles.summary}>
                                <Text style={styles.summaryName}>{selectedProduct.name}</Text>
                                <Text style={styles.summaryPrice}>Şu anki Fiyat: {selectedProduct.price.toFixed(2)} ₺</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Kampanya Fiyatı (₺)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0,00"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="decimal-pad"
                            value={campaignPrice}
                            onChangeText={setCampaignPrice}
                        />

                        <Text style={styles.label}>Süre Seçin</Text>
                        <View style={styles.durationGrid}>
                            {[
                                { label: '1 Gün', value: '1_day' },
                                { label: '3 Gün', value: '3_days' },
                                { label: '1 Hafta', value: '1_week' },
                                { label: '1 Ay', value: '1_month' }
                            ].map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[styles.durationRaw, duration === opt.value && styles.durationSelected]}
                                    onPress={() => setDuration(opt.value as any)}
                                >
                                    <Clock size={16} color={duration === opt.value ? COLORS.white : COLORS.textSecondary} />
                                    <Text style={[styles.durationText, duration === opt.value && { color: COLORS.white }]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveCampaign}
                            disabled={uploading}
                        >
                            {uploading ? <ActivityIndicator color={COLORS.white} /> : <Save color={COLORS.white} size={20} />}
                            <Text style={styles.saveButtonText}>Kaydet ve Başlat</Text>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        margin: SPACING.m,
        padding: SPACING.m,
        borderRadius: 12,
        ...SHADOWS.small,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.s,
        color: COLORS.text,
        fontSize: 16,
    },
    list: {
        padding: SPACING.m,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.small,
    },
    cardInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    brand: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    oldPrice: {
        fontSize: 13,
        color: COLORS.textMuted,
        textDecorationLine: 'line-through',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtn: {
        backgroundColor: COLORS.primary,
    },
    removeBtn: {
        backgroundColor: COLORS.surfaceLight,
        padding: 8,
    },
    // Modal
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
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    summary: {
        backgroundColor: COLORS.surfaceLight,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.m,
    },
    summaryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    summaryPrice: {
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.surfaceLight,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.l,
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    durationGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: SPACING.xl,
    },
    durationRaw: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 12,
        gap: 8,
    },
    durationSelected: {
        backgroundColor: COLORS.primary,
    },
    durationText: {
        color: COLORS.text,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: COLORS.success,
        padding: SPACING.m,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
