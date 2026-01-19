import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';
import { Package, Smartphone, Settings as SettingsIcon, LogOut, TrendingUp, DollarSign, Grid, ClipboardList, Percent } from 'lucide-react-native';

export default function AdminDashboard({ navigation }: any) {
    const { logout } = useAuth();
    const { dailySales, pendingOrdersCount, refreshSalesData } = useSales();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (refreshSalesData) {
            await refreshSalesData();
        }
        setRefreshing(false);
    }, [refreshSalesData]);

    const DashboardCard = ({ icon, title, value, color, onPress }: any) => (
        <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
            <View style={styles.cardHeader}>
                {icon}
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <Text style={[styles.cardValue, { color }]}>{value}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Yönetici Paneli</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <LogOut color={COLORS.error} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                <Text style={styles.sectionTitle}>İstatistikler</Text>
                <View style={styles.statsGrid}>
                    <DashboardCard
                        icon={<TrendingUp color={COLORS.success} size={24} />}
                        title="Günlük Satış"
                        value={`${dailySales.toFixed(2)} ₺`}
                        color={COLORS.success}
                        onPress={() => navigation.navigate('Sales')}
                    />
                    <DashboardCard
                        icon={<Package color={COLORS.secondary} size={24} />}
                        title="Aktif Sipariş"
                        value={pendingOrdersCount.toString()}
                        color={COLORS.secondary}
                        onPress={() => navigation.navigate('AdminOrders')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')} style={[styles.actionCard, { backgroundColor: COLORS.surface }]}>
                            <ClipboardList color={COLORS.primary} size={32} />
                            <Text style={styles.actionText}>Siparişler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Products')} style={[styles.actionCard, { backgroundColor: COLORS.surface }]}>
                            <Package color={COLORS.success} size={32} />
                            <Text style={styles.actionText}>Ürünler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Categories')} style={[styles.actionCard, { backgroundColor: COLORS.surface }]}>
                            <Grid color={COLORS.warning} size={32} />
                            <Text style={styles.actionText}>Kategoriler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Campaigns')} style={[styles.actionCard, { backgroundColor: COLORS.surface }]}>
                            <Percent color={COLORS.error} size={32} />
                            <Text style={styles.actionText}>Kampanyalar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Yönetim</Text>
                <View style={styles.menuGrid}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AdminOrders')}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 101, 132, 0.1)' }]}>
                            <Package color={COLORS.secondary} size={32} />
                        </View>
                        <Text style={styles.menuText}>Siparişler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Products')}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(108, 99, 255, 0.1)' }]}>
                            <Smartphone color={COLORS.primary} size={32} />
                        </View>
                        <Text style={styles.menuText}>Ürünler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Campaigns')}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                            <Percent color={COLORS.error} size={32} />
                        </View>
                        <Text style={styles.menuText}>Kampanyalar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Sales')}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 224, 150, 0.1)' }]}>
                            <DollarSign color={COLORS.success} size={32} />
                        </View>
                        <Text style={styles.menuText}>Satışlar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(160, 160, 160, 0.1)' }]}>
                            <SettingsIcon color={COLORS.textSecondary} size={32} />
                        </View>
                        <Text style={styles.menuText}>Ayarlar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.secondary,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    logoutBtn: {
        padding: SPACING.s,
    },
    content: {
        padding: SPACING.m,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: SPACING.m,
        marginTop: SPACING.s,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.l,
    },
    card: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: 16,
        borderLeftWidth: 4,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
        gap: SPACING.s,
    },
    cardTitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.m,
    },
    menuItem: {
        width: '47%',
        backgroundColor: COLORS.surface,
        padding: SPACING.l,
        borderRadius: 20,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
    },
    menuText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: SPACING.l,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.m,
    },
    actionCard: {
        width: '47%',
        padding: SPACING.m,
        borderRadius: 16,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.s,
        ...SHADOWS.small,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
