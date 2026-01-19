import { getUserOrders } from '../../services/orderService';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronLeft, User } from 'lucide-react-native';
import { Order, User as UserType } from '../../types';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AdminUserOrdersScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { user } = route.params as { user: UserType };

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUserOrders = async () => {
        setLoading(true);
        try {
            const data = await getUserOrders(user.id);
            setOrders(data);
        } catch (error) {
            console.error('Error loading user orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUserOrders();
        }, [user.id])
    );

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

    const renderOrder = ({ item }: { item: Order }) => {
        const status = getStatusInfo(item.status);
        const StatusIcon = status.icon;
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : 'Tarih Yok';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.orderIdContainer}>
                        <Package color={COLORS.primary} size={18} />
                        <Text style={styles.orderId}>#{item.orderCode ? item.orderCode : item.id.slice(0, 8)}</Text>
                    </View>
                    <Text style={styles.date}>{date}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.itemsList}>
                    {item.items.slice(0, 3).map((prod, idx) => (
                        <Text key={idx} style={styles.itemText}>
                            • {prod.quantity}x {prod.name}
                        </Text>
                    ))}
                    {item.items.length > 3 && (
                        <Text style={styles.moreText}>
                            + {item.items.length - 3} ürün daha...
                        </Text>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.totalLabel}>Toplam</Text>
                        <Text style={styles.totalPrice}>{item.totalPrice.toFixed(2)} ₺</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <StatusIcon color={status.color} size={14} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={COLORS.secondary} size={28} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{user.name || 'Kullanıcı'}</Text>
                    <Text style={styles.headerSubtitle}>{user.phone}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{orders.length}</Text>
                    <Text style={styles.statLabel}>Toplam Sipariş</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>
                        {orders.filter(o => o.status === 'delivered').length}
                    </Text>
                    <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.center}>
                    <Package color={COLORS.textSecondary} size={64} />
                    <Text style={styles.emptyText}>Bu kullanıcının henüz siparişi yok.</Text>
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
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    backButton: {
        padding: SPACING.s,
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.m,
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    statValue: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.m,
        fontSize: 16,
    },
    list: {
        padding: SPACING.m,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
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
        gap: 6,
    },
    orderId: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    date: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
    },
    itemsList: {
        padding: SPACING.m,
    },
    itemText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    moreText: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
    },
    totalLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    totalPrice: {
        color: COLORS.success,
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: 16,
        gap: 4,
    },
    statusText: {
        fontWeight: '600',
        fontSize: 12,
    },
});
