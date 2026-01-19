import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, SHADOWS } from '../../utils/theme';
import { User as UserIcon, Shield, ChevronLeft, Phone } from 'lucide-react-native';
import { User } from '../../types';
import { useNavigation } from '@react-navigation/native';

import { getAllUsers } from '../../services/userService';

export default function AdminUsersScreen() {
    const navigation = useNavigation();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const isAdmin = role === 'admin';
        return (
            <View style={[styles.roleBadge, { backgroundColor: isAdmin ? COLORS.primary + '20' : COLORS.success + '20' }]}>
                {isAdmin ? (
                    <Shield color={COLORS.primary} size={14} />
                ) : (
                    <UserIcon color={COLORS.success} size={14} />
                )}
                <Text style={[styles.roleText, { color: isAdmin ? COLORS.primary : COLORS.success }]}>
                    {isAdmin ? 'Yönetici' : 'Kullanıcı'}
                </Text>
            </View>
        );
    };

    const renderUser = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigation.navigate('UserOrders', { user: item })}
            activeOpacity={0.7}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {(item.name || item.phone || 'U').charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name || 'İsimsiz Kullanıcı'}</Text>
                <View style={styles.phoneRow}>
                    <Phone color={COLORS.textSecondary} size={14} />
                    <Text style={styles.userPhone}>{item.phone}</Text>
                </View>
            </View>
            {getRoleBadge(item.role)}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={COLORS.secondary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kullanıcılar</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{users.filter(u => u.role === 'admin').length}</Text>
                    <Text style={styles.statLabel}>Yönetici</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>{users.filter(u => u.role === 'user').length}</Text>
                    <Text style={styles.statLabel}>Kullanıcı</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: COLORS.text }]}>{users.length}</Text>
                    <Text style={styles.statLabel}>Toplam</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : users.length === 0 ? (
                <View style={styles.center}>
                    <UserIcon color={COLORS.textSecondary} size={64} />
                    <Text style={styles.emptyText}>Henüz kayıtlı kullanıcı yok.</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => item.id}
                    renderItem={renderUser}
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
        justifyContent: 'space-between',
        padding: SPACING.m,
    },
    backButton: {
        padding: SPACING.s,
    },
    headerTitle: {
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.m,
        gap: SPACING.s,
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
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.small,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    avatarText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    userPhone: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
