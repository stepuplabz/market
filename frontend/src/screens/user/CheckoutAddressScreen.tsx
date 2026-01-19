import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MapPin, ChevronLeft, Check, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { getUserAddresses } from '../../services/addressService';
import { createOrder } from '../../services/orderService';
import { Address } from '../../types';
import { getColors, SPACING, SHADOWS } from '../../utils/theme';

export default function CheckoutAddressScreen() {
    const { user } = useAuth();
    const { items, totalPrice, clearCart } = useCart();
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);
    const navigation = useNavigation<any>();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOrdering, setIsOrdering] = useState(false);

    const DELIVERY_FEE = 29.90;
    const FINAL_TOTAL = totalPrice + DELIVERY_FEE;

    const loadAddresses = async () => {
        if (user?.id) {
            setIsLoading(true);
            const data = await getUserAddresses(user.id);
            setAddresses(data);
            if (data.length > 0) {
                setSelectedAddress(data[0]); // Auto-select first address
            }
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAddresses();
        }, [user?.id])
    );

    const handleConfirmOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Hata', 'Lütfen bir teslimat adresi seçin.');
            return;
        }

        if (items.length === 0) {
            Alert.alert('Hata', 'Sepetiniz boş.');
            return;
        }

        if (!user) {
            Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı.');
            return;
        }

        setIsOrdering(true);
        try {
            const fullAddress = `${selectedAddress.title}: ${selectedAddress.fullAddress}, ${selectedAddress.district}/${selectedAddress.city}`;

            const success = await createOrder(
                user.id,
                items,
                FINAL_TOTAL,
                fullAddress
            );

            if (success) {
                clearCart();
                Alert.alert(
                    '✅ Sipariş Alındı!',
                    'Siparişiniz başarıyla oluşturuldu.\n\nSiparişlerim sayfasından durumunu takip edebilirsiniz.',
                    [{ text: 'Tamam', onPress: () => navigation.navigate('MainTabs') }]
                );
            } else {
                Alert.alert('Hata', 'Sipariş oluşturulurken bir sorun oluştu.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Bir sorun oluştu.');
        } finally {
            setIsOrdering(false);
        }
    };

    const renderAddressItem = ({ item }: { item: Address }) => {
        const isSelected = selectedAddress?.id === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.addressCard,
                    {
                        backgroundColor: COLORS.surface,
                        borderColor: isSelected ? COLORS.primary : COLORS.glassBorder,
                        borderWidth: isSelected ? 2 : 1
                    }
                ]}
                onPress={() => setSelectedAddress(item)}
            >
                <View style={styles.addressHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <MapPin color={isSelected ? COLORS.primary : COLORS.textSecondary} size={20} style={{ marginRight: 8 }} />
                        <Text style={[styles.addressTitle, { color: COLORS.text }]}>{item.title}</Text>
                    </View>
                    {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: COLORS.primary }]}>
                            <Check color={COLORS.white} size={14} />
                        </View>
                    )}
                </View>
                <Text style={[styles.addressText, { color: COLORS.textSecondary }]}>{item.fullAddress}</Text>
                <Text style={[styles.locationText, { color: COLORS.textSecondary }]}>{item.district} / {item.city}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={COLORS.text} size={28} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.text }]}>Teslimat Adresi</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : addresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MapPin size={48} color={COLORS.textSecondary} />
                    <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>
                        Kayıtlı adresiniz yok.
                    </Text>
                    <TouchableOpacity
                        style={[styles.addAddressButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('AddAddress')}
                    >
                        <Text style={styles.addAddressButtonText}>Adres Ekle</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={addresses}
                        renderItem={renderAddressItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                    />

                    {/* Order Summary */}
                    <View style={[styles.summaryContainer, { backgroundColor: COLORS.surfaceLight }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: COLORS.textSecondary }]}>Ürünler ({items.length})</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.text }]}>{totalPrice.toFixed(2)} ₺</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: COLORS.textSecondary }]}>Taşıma Ücreti</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.text }]}>{DELIVERY_FEE.toFixed(2)} ₺</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: COLORS.glassBorder }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[styles.totalLabel, { color: COLORS.text }]}>Toplam</Text>
                            <Text style={[styles.totalValue, { color: COLORS.primary }]}>{FINAL_TOTAL.toFixed(2)} ₺</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: COLORS.success, opacity: isOrdering ? 0.7 : 1 }]}
                            onPress={handleConfirmOrder}
                            disabled={isOrdering || !selectedAddress}
                        >
                            {isOrdering ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <ShoppingBag color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                                    <Text style={styles.confirmButtonText}>Siparişi Onayla</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        ...SHADOWS.small,
    },
    backButton: {
        padding: SPACING.s,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: SPACING.m,
    },
    addressCard: {
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    locationText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    addAddressButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addAddressButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    summaryContainer: {
        padding: SPACING.m,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        ...SHADOWS.medium,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderRadius: 12,
        marginTop: SPACING.m,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
