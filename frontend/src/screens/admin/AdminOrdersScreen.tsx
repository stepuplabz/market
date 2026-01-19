import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { Order } from '../../types';
import { useSales } from '../../context/SalesContext';
import { CheckCircle, Clock, Truck, X, MapPin, Package, Phone, Edit } from 'lucide-react-native';
import { getAllOrders, updateOrderStatus, cancelOrder } from '../../services/orderService';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminOrdersScreen() {
    // We are replacing useSales context with direct service calls for Admin
    // Ideally useSales should be updated, but for now direct calls
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusUpdateOrder, setStatusUpdateOrder] = useState<Order | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    }, []);

    // Robust filtering to handle potential whitespace or sensitivity issues
    const normalizeStatus = (status: string) => String(status || '').toLowerCase().trim();

    const activeOrders = orders.filter(order =>
        !['delivered', 'cancelled'].includes(normalizeStatus(order.status))
    );
    const historyOrders = orders.filter(order =>
        ['delivered', 'cancelled'].includes(normalizeStatus(order.status))
    );

    // activeOrders now contains EVERYTHING that is not finished.
    // No need for 'otherOrders' fallback anymore.
    const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;



    const loadOrders = async () => {
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Hata', 'Siparişler yüklenirken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );

    const StatusBadge = ({ status }: { status: string }) => {
        let color = COLORS.textSecondary;
        let text = status;
        let Icon = Clock;

        switch (normalizeStatus(status)) {
            case 'waiting_approval':
                color = COLORS.secondary;
                text = 'Onay Bekliyor';
                break;
            case 'preparing':
                color = '#F39C12'; // Orange/Yellow for preparing
                text = 'Hazırlanıyor';
                Icon = Package;
                break;
            case 'on_the_way':
                color = COLORS.primary;
                text = 'Yolda';
                Icon = Truck;
                break;
            case 'delivered':
                color = COLORS.success;
                text = 'Teslim Edildi';
                Icon = CheckCircle;
                break;
            case 'cancelled':
                color = COLORS.error;
                text = 'İptal Edildi';
                Icon = X;
                break;
        }

        return (
            <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
                <Icon size={14} color={color} style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color }]}>{text}</Text>
            </View>
        );
    };

    const openStatusModal = (order: Order) => {
        setStatusUpdateOrder(order);
        setStatusModalVisible(true);
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!statusUpdateOrder) return;

        try {
            await updateOrderStatus(statusUpdateOrder.id, newStatus);
            Alert.alert('Başarılı', 'Sipariş durumu güncellendi.');
            setStatusModalVisible(false);
            setStatusUpdateOrder(null);
            loadOrders();
        } catch (error: any) {
            console.error('Error updating status:', error);
            // Show detailed error for debugging
            Alert.alert('Hata', `Durum güncellenemedi: ${error.message || JSON.stringify(error)}`);
        }
    };

    const handleCancelOrder = (order: Order) => {
        Alert.alert(
            'Siparişi İptal Et',
            `#${order.orderCode} numaralı siparişi iptal etmek istiyor musunuz?`,
            [
                { text: 'Hayır', style: 'cancel' },
                {
                    text: 'İptal Et',
                    style: 'destructive',
                    onPress: async () => {
                        await cancelOrder(order.id);
                        Alert.alert('Bilgi', 'Sipariş iptal edildi.');
                        loadOrders();
                    }
                }
            ]
        );
    };

    const openDetailModal = (order: Order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    const renderOrder = ({ item }: { item: Order }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.orderId}>#{item.orderCode ? item.orderCode : item.id.slice(0, 8)}</Text>
                    <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
                </View>
                <StatusBadge status={item.status} />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Tutar:</Text>
                <Text style={styles.value}>{(item.totalPrice + item.deliveryFee).toFixed(2)} ₺</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Adres:</Text>
                <Text style={styles.value} numberOfLines={2}>{item.address}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openDetailModal(item)}>
                    <Text style={styles.actionText}>Detay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => openStatusModal(item)}
                >
                    <Edit size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                    <Text style={[styles.actionText, { color: COLORS.white, fontWeight: 'bold' }]}>Durum Değiştir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        İşlemde Olanlar ({activeOrders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                        Geçmiş Siparişler ({historyOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {displayedOrders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Package color={COLORS.textSecondary} size={64} />
                    <Text style={styles.emptyText}>
                        {activeTab === 'active' ? 'İşlemde olan sipariş bulunmuyor' : 'Geçmiş sipariş bulunmuyor'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {activeTab === 'active'
                            ? 'Bekleyen veya hazırlanan siparişler burada görünecek'
                            : 'Tamamlanan veya iptal edilen siparişler burada listelenir'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={displayedOrders}
                    keyExtractor={item => item.id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                />
            )}

            {/* Detail Modal */}
            <Modal visible={detailModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sipariş #{selectedOrder?.id}</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                <X color={COLORS.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        {selectedOrder && (
                            <>
                                <View style={styles.detailSection}>
                                    <StatusBadge status={selectedOrder.status} />
                                </View>

                                <View style={styles.detailSection}>
                                    <View style={styles.detailRow}>
                                        <Phone color={COLORS.primary} size={18} />
                                        <Text style={styles.detailLabel}>Müşteri:</Text>
                                        <Text style={styles.detailValue}>{selectedOrder.userId}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <MapPin color={COLORS.secondary} size={18} />
                                        <Text style={styles.detailLabel}>Adres:</Text>
                                        <Text style={styles.detailValue}>{selectedOrder.address}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.detailSectionTitle}>Ürünler</Text>
                                    {selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item, index) => (
                                            <View key={index} style={styles.itemRow}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemQty}>x{item.quantity}</Text>
                                                <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} ₺</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noItems}>Ürün bilgisi mevcut değil</Text>
                                    )}
                                </View>

                                <View style={styles.totalSection}>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Ara Toplam:</Text>
                                        <Text style={styles.totalValue}>{selectedOrder.totalPrice.toFixed(2)} ₺</Text>
                                    </View>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Teslimat:</Text>
                                        <Text style={styles.totalValue}>{selectedOrder.deliveryFee.toFixed(2)} ₺</Text>
                                    </View>
                                    <View style={[styles.totalRow, styles.grandTotal]}>
                                        <Text style={styles.grandTotalLabel}>Toplam:</Text>
                                        <Text style={styles.grandTotalValue}>
                                            {(selectedOrder.totalPrice + selectedOrder.deliveryFee).toFixed(2)} ₺
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Status Selection Modal */}
            <Modal visible={statusModalVisible} animationType="fade" transparent>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setStatusModalVisible(false)}
                >
                    <View style={styles.statusModalContent}>
                        <Text style={styles.modalTitle}>Durum Seçin</Text>
                        <Text style={styles.statusModalSubtitle}>
                            Sipariş #{statusUpdateOrder?.orderCode || statusUpdateOrder?.id.slice(0, 8)} için yeni durumu seçin.
                        </Text>

                        <TouchableOpacity style={styles.statusOption} onPress={() => handleStatusChange('waiting_approval')}>
                            <Clock size={20} color={COLORS.secondary} />
                            <Text style={styles.statusOptionText}>Onay Bekliyor</Text>
                            {statusUpdateOrder?.status === 'waiting_approval' && <CheckCircle size={16} color={COLORS.success} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statusOption} onPress={() => handleStatusChange('preparing')}>
                            <Package size={20} color="#F39C12" />
                            <Text style={styles.statusOptionText}>Hazırlanıyor</Text>
                            {statusUpdateOrder?.status === 'preparing' && <CheckCircle size={16} color={COLORS.success} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statusOption} onPress={() => handleStatusChange('on_the_way')}>
                            <Truck size={20} color={COLORS.primary} />
                            <Text style={styles.statusOptionText}>Yolda</Text>
                            {statusUpdateOrder?.status === 'on_the_way' && <CheckCircle size={16} color={COLORS.success} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statusOption} onPress={() => handleStatusChange('delivered')}>
                            <CheckCircle size={20} color={COLORS.success} />
                            <Text style={styles.statusOptionText}>Teslim Edildi</Text>
                            {statusUpdateOrder?.status === 'delivered' && <CheckCircle size={16} color={COLORS.success} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.statusOption, { borderBottomWidth: 0 }]} onPress={() => handleStatusChange('cancelled')}>
                            <X size={20} color={COLORS.error} />
                            <Text style={[styles.statusOptionText, { color: COLORS.error }]}>İptal Edildi</Text>
                            {statusUpdateOrder?.status === 'cancelled' && <CheckCircle size={16} color={COLORS.success} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setStatusModalVisible(false)}
                        >
                            <Text style={styles.closeBtnText}>Vazgeç</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
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
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: SPACING.m,
    },
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        marginTop: SPACING.s,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
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
        marginBottom: SPACING.m,
        paddingBottom: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
    },
    orderId: {
        color: COLORS.secondary, // Navy Blue
        fontWeight: 'bold',
        fontSize: 16,
    },
    dateText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        flexDirection: 'row',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        color: COLORS.textSecondary,
        width: 60,
    },
    value: {
        color: COLORS.text, // Dark Text
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.s,
        gap: SPACING.s,
    },
    actionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: COLORS.surfaceLight,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    actionText: {
        color: COLORS.text, // Dark Text
        fontSize: 14,
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    primaryText: {
        fontWeight: 'bold',
        color: '#FFFFFF' // Keep white for primary button text
    },
    cancelBtn: {
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
        borderColor: COLORS.error,
    },
    successBtn: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    editBtn: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusModalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: SPACING.l,
        width: '85%',
        alignSelf: 'center',
        marginBottom: 'auto',
        marginTop: 'auto',
        ...SHADOWS.medium,
    },
    statusModalSubtitle: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        fontSize: 14,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
        gap: SPACING.m,
    },
    statusOptionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
    },
    closeBtn: {
        marginTop: SPACING.m,
        padding: SPACING.m,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeBtnText: {
        color: COLORS.text,
        fontWeight: 'bold',
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
        color: COLORS.text, // Dark text
        fontSize: 20,
        fontWeight: 'bold',
    },
    detailSection: {
        marginBottom: SPACING.m,
        paddingBottom: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
        gap: SPACING.s,
    },
    detailLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    detailValue: {
        color: COLORS.text,
        fontSize: 14,
        flex: 1,
    },
    detailSectionTitle: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.s,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
    },
    itemName: {
        color: COLORS.text,
        flex: 1,
    },
    itemQty: {
        color: COLORS.textSecondary,
        marginHorizontal: SPACING.m,
    },
    itemPrice: {
        color: COLORS.success,
        fontWeight: '600',
    },
    noItems: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    totalSection: {
        marginTop: SPACING.m,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.s,
    },
    totalLabel: {
        color: COLORS.textSecondary,
    },
    totalValue: {
        color: COLORS.text,
        fontWeight: '600',
    },
    grandTotal: {
        borderTopWidth: 1,
        borderTopColor: COLORS.glassBorder,
        paddingTop: SPACING.s,
        marginTop: SPACING.s,
    },
    grandTotalLabel: {
        color: COLORS.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    grandTotalValue: {
        color: COLORS.success,
        fontWeight: 'bold',
        fontSize: 18,
    },
    tabContainer: {
        flexDirection: 'row',
        padding: SPACING.m,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
        gap: SPACING.m,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    activeTab: {
        backgroundColor: COLORS.secondary, // Navy Blue
        borderColor: COLORS.secondary,
    },
    tabText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
});
