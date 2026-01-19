import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors, SPACING, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, LogOut, MapPin, Phone, Moon, Sun, Package, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigation = useNavigation<any>();
    const COLORS = getColors(isDark);

    const MenuItem = ({ icon, label, value, onPress }: any) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: COLORS.surface, borderColor: COLORS.glassBorder }]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.surfaceLight }]}>
                {icon}
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuLabel, { color: COLORS.textSecondary }]}>{label}</Text>
                <Text style={[styles.menuValue, { color: COLORS.text }]}>{value || 'Belirtilmemiş'}</Text>
            </View>
        </TouchableOpacity>
    );

    const ThemeToggle = () => (
        <View style={[styles.menuItem, { backgroundColor: COLORS.surface, borderColor: COLORS.glassBorder }]}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.surfaceLight }]}>
                {isDark ? <Moon color={COLORS.primary} size={24} /> : <Sun color={COLORS.warning} size={24} />}
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuLabel, { color: COLORS.textSecondary }]}>Tema</Text>
                <Text style={[styles.menuValue, { color: COLORS.text }]}>{isDark ? 'Gece Modu' : 'Gündüz Modu'}</Text>
            </View>
            <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: COLORS.surfaceLight, true: COLORS.primaryLight }}
                thumbColor={isDark ? COLORS.primary : COLORS.warning}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <View style={[styles.header, { borderBottomColor: COLORS.glassBorder }]}>
                <Text style={[styles.headerTitle, { color: COLORS.text }]}>Profilim</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.avatarSection}>
                    <View style={[styles.avatar, { backgroundColor: COLORS.surfaceLight, borderColor: COLORS.secondary }]}>
                        <User color={COLORS.primary} size={60} />
                    </View>
                    <Text style={[styles.phoneText, { color: COLORS.text }]}>{user?.name || user?.phone}</Text>

                    <TouchableOpacity
                        style={[styles.editProfileBtn, { backgroundColor: COLORS.surfaceLight }]}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Text style={[styles.editProfileText, { color: COLORS.primary }]}>Profili Düzenle</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>Hesap Bilgileri</Text>
                    <MenuItem
                        icon={<Package color={COLORS.primary} size={24} />}
                        label="Siparişlerim"
                        value="Geçmiş Siparişleri Görüntüle"
                        onPress={() => navigation.navigate('OrderHistory')}
                    />
                    <MenuItem
                        icon={<Phone color={COLORS.secondary} size={24} />}
                        label="Telefon Numarası"
                        value={user?.phone}
                    />
                    <MenuItem
                        icon={<MapPin color={COLORS.success} size={24} />}
                        label="Adreslerim"
                        value="Kayıtlı Adresleri Yönet"
                        onPress={() => navigation.navigate('Addresses')}
                    />
                    <MenuItem
                        icon={<Lock color={COLORS.warning} size={24} />}
                        label="Şifre Değiştir"
                        value="Hesap güvenliğinizi yönetin"
                        onPress={() => navigation.navigate('ChangePassword')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>Ayarlar</Text>
                    <ThemeToggle />
                </View>

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: COLORS.error }]} onPress={logout}>
                    <LogOut color={COLORS.white} size={24} />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.l,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
        borderWidth: 2,
        ...SHADOWS.medium,
    },
    phoneText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 14,
        marginBottom: SPACING.m,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.s,
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    menuValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderRadius: 16,
        marginTop: 'auto',
        ...SHADOWS.medium,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: SPACING.s,
    },
    editProfileBtn: {
        marginTop: SPACING.s,
        paddingHorizontal: SPACING.l,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editProfileText: {
        fontWeight: '600',
        fontSize: 14,
    }
});

