import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserOrders, cancelOrder } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getColors, SPACING, SHADOWS } from '../../utils/theme';
import { Order } from '../../types';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function OrderHistoryScreen() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);
    const navigation = useNavigation();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        setLoading(true);
        const data = await getUserOrders(user!.id);
        setOrders(data);
        setLoading(false);
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'waiting_approval': return { color: COLORS.secondary, text: 'Onay Bekliyor', icon: Clock };
            case 'preparing': return { color: '#F39C12', text: 'Hazırlanıyor', icon: Package };
            case 'on_the_way': return { color: COLORS.primary, text: 'Yolda', icon: Truck };
            case 'delivered': return { color: COLORS.success, text: 'Teslim Edildi', icon: CheckCircle };
            case 'cancelled': return { color: COLORS.error, text: 'İptal Edildi', icon: XCircle };
            default: return { color: COLORS.textSecondary, text: status, icon: Clock };
        }
    };

    const handleCancelOrder = (order: Order) => {
        Alert.alert(
            'Siparişi İptal Et',
            'Bu siparişi iptal etmek istediğinize emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'İptal Et',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await cancelOrder(order.id);
                        if (success) {
                            Alert.alert('Başarılı', 'Siparişiniz iptal edildi.');
                            loadOrders(); // Refresh list
                        } else {
                            Alert.alert('Hata', 'Sipariş iptal edilemedi.');
                        }
                    }
                }
            ]
        );
    };

    const renderOrder = ({ item }: { item: Order }) => {
        const status = getStatusInfo(item.status);
        const StatusIcon = status.icon;

        // Date formatting (simple fallback)
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 'Tarih Yok';

        return (
            <View style={[styles.card, { backgroundColor: COLORS.surface, borderColor: COLORS.glassBorder }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.orderIdContainer}>
                        <Package color={COLORS.primary} size={20} />
                        <Text style={[styles.orderId, { color: COLORS.text }]}>#{item.orderCode ? item.orderCode : item.id.slice(0, 8)}</Text>
                    </View>
                    <Text style={[styles.date, { color: COLORS.textSecondary }]}>{date}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: COLORS.glassBorder }]} />

                <View style={styles.itemsList}>
                    {item.items.slice(0, 3).map((prod, idx) => (
                        <Text key={idx} style={[styles.itemText, { color: COLORS.textSecondary }]}>
                            • {prod.quantity}x {prod.name}
                        </Text>
                    ))}
                    {item.items.length > 3 && (
                        <Text style={[styles.moreText, { color: COLORS.textSecondary }]}>
                            + {item.items.length - 3} ürün daha...
                        </Text>
                    )}
                </View>

                <View style={[styles.divider, { backgroundColor: COLORS.glassBorder }]} />

                <View style={styles.cardFooter}>
                    <View style={styles.totalContainer}>
                        <Text style={[styles.totalLabel, { color: COLORS.textSecondary }]}>Toplam</Text>
                        <Text style={[styles.totalPrice, { color: COLORS.text }]}>{item.totalPrice.toFixed(2)} ₺</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <StatusIcon color={status.color} size={16} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                    </View>
                </View>

                {/* Cancel Button - Only for pending/waiting_approval orders */}
                {item.status === 'waiting_approval' && (
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error }]}
                        onPress={() => handleCancelOrder(item)}
                    >
                        <XCircle color={COLORS.error} size={16} />
                        <Text style={[styles.cancelButtonText, { color: COLORS.error }]}>Siparişi İptal Et</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <View style={[styles.header, { borderBottomColor: COLORS.glassBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={COLORS.text} size={28} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.text }]}>Siparişlerim</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.center}>
                    <Package color={COLORS.textSecondary} size={64} />
                    <Text style={[styles.emptyText, { color: COLORS.textSecondary }]}>Henüz siparişiniz yok.</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: SPACING.s,
        marginRight: SPACING.s,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        padding: SPACING.m,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: SPACING.m,
        fontSize: 16,
    },
    card: {
        borderRadius: 16,
        marginBottom: SPACING.m,
        borderWidth: 1,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    orderId: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    date: {
        fontSize: 14,
    },
    divider: {
        height: 1,
    },
    itemsList: {
        padding: SPACING.m,
    },
    itemText: {
        fontSize: 14,
        marginBottom: 4,
    },
    moreText: {
        fontStyle: 'italic',
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
    },
    totalContainer: {
    },
    totalLabel: {
        fontSize: 12,
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.s,
        marginHorizontal: SPACING.m,
        marginBottom: SPACING.m,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    cancelButtonText: {
        fontWeight: '600',
        fontSize: 14,
    }
});
