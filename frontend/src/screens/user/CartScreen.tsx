import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors, SPACING, SHADOWS } from '../../utils/theme';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';
import { Trash2, ArrowRight } from 'lucide-react-native';

export default function CartScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);

    const { items, removeFromCart, totalPrice, clearCart } = useCart();
    const DELIVERY_FEE = 29.90; // Admin controlled in real app
    const FINAL_TOTAL = totalPrice + DELIVERY_FEE;

    const { user } = useAuth();
    const [isOrdering, setIsOrdering] = React.useState(false);

    const handleProceedToCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Sepet Boş', 'Lütfen önce ürün ekleyin.');
            return;
        }
        navigation.navigate('CheckoutAddress');
    };

    const renderItem = ({ item }: any) => (
        <View style={[styles.itemCard, { backgroundColor: COLORS.surface, borderColor: COLORS.glassBorder }]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: COLORS.text }]}>{item.name}</Text>
                <Text style={[styles.itemDetails, { color: COLORS.textSecondary }]}>
                    {item.quantity} {item.unitType === 'kg' ? 'kg' : 'adet'} x {item.price} ₺
                </Text>
            </View>
            <View style={styles.itemRight}>
                <Text style={[styles.itemTotal, { color: COLORS.primary }]}>{(item.price * item.quantity).toFixed(2)} ₺</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteButton}>
                    <Trash2 color={COLORS.error} size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: COLORS.glassBorder }]}>
                <Text style={[styles.headerTitle, { color: COLORS.text }]}>Sepetim</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>Sepetinizde ürün bulunmamaktadır.</Text>
                    </View>
                }
            />

            {items.length > 0 && (
                <View style={[styles.footer, { backgroundColor: COLORS.surfaceLight }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: COLORS.textSecondary }]}>Ara Toplam</Text>
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
                        style={[styles.checkoutButton, { backgroundColor: COLORS.primary }]}
                        onPress={handleProceedToCheckout}
                    >
                        <Text style={styles.checkoutButtonText}>İleri</Text>
                        <ArrowRight color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.m,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContent: {
        padding: SPACING.m,
    },
    itemCard: {
        flexDirection: 'row',
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
    },
    itemRight: {
        alignItems: 'flex-end',
    },
    itemTotal: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
    },
    deleteButton: {
        padding: 4,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
    footer: {
        padding: SPACING.l,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...SHADOWS.medium,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.s,
    },
    summaryLabel: {
        fontSize: 16,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: SPACING.s,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderRadius: 16,
        marginTop: SPACING.m,
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: SPACING.s,
    },
});

