import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';
import { Settings, Bell, Truck, CreditCard, Users, Trash2, RefreshCw, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function AdminSettingsScreen() {
    const { user } = useAuth();
    const { salesHistory, orders } = useSales();
    const navigation = useNavigation<any>();
    const [notifications, setNotifications] = useState(true);
    const [autoAccept, setAutoAccept] = useState(false);

    const SettingItem = ({ icon, title, subtitle, rightElement }: any) => (
        <View style={styles.settingItem}>
            <View style={styles.settingIcon}>{icon}</View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement}
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Admin Info */}
            <View style={styles.adminCard}>
                <View style={styles.adminAvatar}>
                    <Text style={styles.adminAvatarText}>
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </Text>
                </View>
                <View style={styles.adminInfo}>
                    <Text style={styles.adminName}>{user?.name || 'Admin'}</Text>
                    <Text style={styles.adminRole}>Yönetici</Text>
                </View>
            </View>

            {/* Statistics */}
            <Text style={styles.sectionTitle}>İstatistikler</Text>
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{salesHistory.length}</Text>
                    <Text style={styles.statLabel}>Toplam Satış</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{orders.length}</Text>
                    <Text style={styles.statLabel}>Toplam Sipariş</Text>
                </View>
            </View>

            {/* Notification Settings */}
            <Text style={styles.sectionTitle}>Bildirimler</Text>
            <View style={styles.settingsGroup}>
                <SettingItem
                    icon={<Bell color={COLORS.primary} size={22} />}
                    title="Bildirimler"
                    subtitle="Yeni sipariş bildirimleri al"
                    rightElement={
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary + '80' }}
                            thumbColor={notifications ? COLORS.primary : COLORS.textSecondary}
                        />
                    }
                />
            </View>

            {/* Order Settings */}
            <Text style={styles.sectionTitle}>Sipariş Ayarları</Text>
            <View style={styles.settingsGroup}>
                <SettingItem
                    icon={<Truck color={COLORS.success} size={22} />}
                    title="Otomatik Kabul"
                    subtitle="Siparişleri otomatik onayla"
                    rightElement={
                        <Switch
                            value={autoAccept}
                            onValueChange={setAutoAccept}
                            trackColor={{ false: COLORS.surfaceLight, true: COLORS.success + '80' }}
                            thumbColor={autoAccept ? COLORS.success : COLORS.textSecondary}
                        />
                    }
                />
                <View style={styles.divider} />
                <TouchableOpacity>
                    <SettingItem
                        icon={<CreditCard color={COLORS.secondary} size={22} />}
                        title="Ödeme Yöntemleri"
                        subtitle="Ödeme seçeneklerini yönet"
                        rightElement={<Text style={styles.arrow}>›</Text>}
                    />
                </TouchableOpacity>
            </View>

            {/* Data Management */}
            <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
            <View style={styles.settingsGroup}>
                <TouchableOpacity onPress={() => navigation.navigate('Users')}>
                    <SettingItem
                        icon={<Users color={COLORS.primary} size={22} />}
                        title="Kullanıcılar"
                        subtitle="Kayıtlı kullanıcıları görüntüle"
                        rightElement={<Text style={styles.arrow}>›</Text>}
                    />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity>
                    <SettingItem
                        icon={<RefreshCw color={COLORS.textSecondary} size={22} />}
                        title="Verileri Senkronize Et"
                        subtitle="Firebase ile senkronize et"
                        rightElement={<Text style={styles.arrow}>›</Text>}
                    />
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <Text style={styles.sectionTitle}>Uygulama Bilgisi</Text>
            <View style={styles.settingsGroup}>
                <SettingItem
                    icon={<Info color={COLORS.textSecondary} size={22} />}
                    title="Sürüm"
                    subtitle="1.0.0 (Demo)"
                    rightElement={null}
                />
            </View>

            <View style={styles.footer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.m,
    },
    adminCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.l,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.medium,
    },
    adminAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    adminAvatarText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    adminInfo: {
        flex: 1,
    },
    adminName: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    adminRole: {
        color: COLORS.primary,
        fontSize: 14,
        marginTop: 2,
    },
    sectionTitle: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
        marginTop: SPACING.s,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.l,
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
        fontSize: 28,
        fontWeight: 'bold',
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 4,
    },
    settingsGroup: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '600',
    },
    settingSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginLeft: 68,
    },
    arrow: {
        color: COLORS.textSecondary,
        fontSize: 24,
    },
    footer: {
        height: 40,
    },
});
