import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { useSales } from '../../context/SalesContext';
import { TrendingUp, Calendar, DollarSign, ShoppingBag } from 'lucide-react-native';

type FilterType = 'daily' | 'weekly' | 'monthly';

export default function AdminSalesScreen() {
    const { dailySales, weeklySales, monthlySales, salesHistory } = useSales();
    const [filter, setFilter] = useState<FilterType>('daily');

    const getFilteredSales = () => {
        const now = new Date();
        const today = now.toDateString();
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        switch (filter) {
            case 'daily':
                return salesHistory.filter(sale => new Date(sale.date).toDateString() === today);
            case 'weekly':
                return salesHistory.filter(sale => new Date(sale.date) >= oneWeekAgo);
            case 'monthly':
                return salesHistory.filter(sale => new Date(sale.date) >= oneMonthAgo);
            default:
                return salesHistory;
        }
    };

    const getTotalForFilter = () => {
        switch (filter) {
            case 'daily': return dailySales;
            case 'weekly': return weeklySales;
            case 'monthly': return monthlySales;
            default: return 0;
        }
    };

    const FilterButton = ({ type, label }: { type: FilterType; label: string }) => (
        <TouchableOpacity
            style={[styles.filterBtn, filter === type && styles.filterBtnActive]}
            onPress={() => setFilter(type)}
        >
            <Text style={[styles.filterBtnText, filter === type && styles.filterBtnTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const filteredSales = getFilteredSales();

    return (
        <View style={styles.container}>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                    <TrendingUp color={COLORS.success} size={32} />
                </View>
                <View style={styles.summaryInfo}>
                    <Text style={styles.summaryLabel}>
                        {filter === 'daily' ? 'Bugünkü' : filter === 'weekly' ? 'Haftalık' : 'Aylık'} Toplam
                    </Text>
                    <Text style={styles.summaryValue}>{getTotalForFilter().toFixed(2)} ₺</Text>
                </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterRow}>
                <FilterButton type="daily" label="Bugün" />
                <FilterButton type="weekly" label="Bu Hafta" />
                <FilterButton type="monthly" label="Bu Ay" />
            </View>

            {/* Sales List */}
            <Text style={styles.sectionTitle}>Satış Geçmişi</Text>

            {filteredSales.length === 0 ? (
                <View style={styles.emptyState}>
                    <ShoppingBag color={COLORS.textSecondary} size={48} />
                    <Text style={styles.emptyText}>Henüz satış yok</Text>
                    <Text style={styles.emptySubtext}>
                        Sipariş tamamlandığında satışlar burada görünecek
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredSales}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.saleCard}>
                            <View style={styles.saleIcon}>
                                <DollarSign color={COLORS.success} size={20} />
                            </View>
                            <View style={styles.saleInfo}>
                                <Text style={styles.saleOrderId}>Sipariş #{item.orderId}</Text>
                                <View style={styles.saleDetails}>
                                    <Calendar color={COLORS.textSecondary} size={12} />
                                    <Text style={styles.saleDate}>
                                        {new Date(item.date).toLocaleDateString('tr-TR')} - {new Date(item.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.saleAmount}>
                                <Text style={styles.saleAmountText}>+{item.amount.toFixed(2)} ₺</Text>
                                <Text style={styles.saleItems}>{item.items} ürün</Text>
                            </View>
                        </View>
                    )}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.m,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.l,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        marginBottom: SPACING.m,
        ...SHADOWS.medium,
    },
    summaryIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0, 224, 150, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    summaryValue: {
        color: COLORS.success,
        fontSize: 32,
        fontWeight: 'bold',
    },
    filterRow: {
        flexDirection: 'row',
        gap: SPACING.s,
        marginBottom: SPACING.l,
    },
    filterBtn: {
        flex: 1,
        padding: SPACING.m,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    filterBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterBtnText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    filterBtnTextActive: {
        color: COLORS.white,
    },
    sectionTitle: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
    },
    list: {
        paddingBottom: SPACING.xl,
    },
    saleCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    saleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 224, 150, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    saleInfo: {
        flex: 1,
    },
    saleOrderId: {
        color: COLORS.text,
        fontWeight: '600',
    },
    saleDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    saleDate: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    saleAmount: {
        alignItems: 'flex-end',
    },
    saleAmountText: {
        color: COLORS.success,
        fontSize: 16,
        fontWeight: 'bold',
    },
    saleItems: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '600',
        marginTop: SPACING.m,
    },
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        marginTop: SPACING.s,
        paddingHorizontal: SPACING.xl,
    },
});
