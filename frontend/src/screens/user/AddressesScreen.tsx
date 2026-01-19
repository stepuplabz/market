import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Plus, Trash2, MapPin } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { getUserAddresses, deleteUserAddress } from '../../services/addressService';
import { Address } from '../../types';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';

export default function AddressesScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAddresses = async () => {
        if (user?.id) {
            setIsLoading(true);
            const data = await getUserAddresses(user.id);
            setAddresses(data);
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAddresses();
        }, [user?.id])
    );

    const handleDelete = (address: Address) => {
        Alert.alert(
            'Adresi Sil',
            'Bu adresi silmek istediğinize emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        if (user?.id) {
                            const success = await deleteUserAddress(user.id, address.id);
                            if (success) {
                                loadAddresses();
                            } else {
                                Alert.alert('Hata', 'Adres silinemedi.');
                            }
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Address }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin color={COLORS.primary} size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Trash2 color={COLORS.error} size={20} />
                </TouchableOpacity>
            </View>
            <Text style={styles.addressText}>{item.fullAddress}</Text>
            <Text style={styles.locationText}>{item.district} / {item.city}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Adreslerim</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MapPin size={48} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>Henüz kayıtlı adresiniz yok.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddAddress')}
            >
                <Plus color={COLORS.white} size={24} />
            </TouchableOpacity>
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
        backgroundColor: COLORS.surface,
        ...SHADOWS.small,
        zIndex: 1,
    },
    backButton: {
        padding: SPACING.s,
    },
    backButtonText: {
        fontSize: 24,
        color: COLORS.text,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: SPACING.m,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addressText: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 4,
        lineHeight: 20,
    },
    locationText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textSecondary,
    },
});
