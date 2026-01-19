import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Save } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { addUserAddress } from '../../services/addressService';
import { COLORS, SPACING, SHADOWS } from '../../utils/theme';

export default function AddAddressScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);

    // Auto-filled as requested
    const [city, setCity] = useState('Adana');
    const [district, setDistrict] = useState('Ceyhan');

    const [title, setTitle] = useState('');
    const [fullAddress, setFullAddress] = useState('');

    const handleSave = async () => {
        if (!title.trim() || !fullAddress.trim()) {
            Alert.alert('Hata', 'Lütfen başlık ve açık adres alanlarını doldurun.');
            return;
        }

        if (user?.id) {
            setLoading(true);
            const success = await addUserAddress(user.id, {
                title,
                city,
                district,
                address: fullAddress // Map fullAddress to address for backend
            } as any);
            setLoading(false);

            if (success) {
                Alert.alert('Başarılı', 'Adres başarıyla kaydedildi.', [
                    { text: 'Tamam', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Hata', 'Adres kaydedilirken bir hata oluştu.');
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yeni Adres Ekle</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Adres Başlığı (Ev, İş vb.)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Evim"
                            placeholderTextColor={COLORS.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.s }]}>
                            <Text style={styles.label}>İl</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={city}
                                editable={false} // Fixed as requested
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1, marginLeft: SPACING.s }]}>
                            <Text style={styles.label}>İlçe</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={district}
                                editable={false} // Fixed as requested
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Açık Adres</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Adres detaylarını giriniz..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={fullAddress}
                            onChangeText={setFullAddress}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.saveButtonText}>Kaydediliyor...</Text>
                        ) : (
                            <>
                                <Save color={COLORS.white} size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Adresi Kaydet</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
    content: {
        padding: SPACING.m,
    },
    formGroup: {
        marginBottom: SPACING.m,
    },
    row: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: SPACING.m,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    disabledInput: {
        backgroundColor: COLORS.surfaceLight,
        color: COLORS.textSecondary,
    },
    textArea: {
        height: 120,
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.m,
        ...SHADOWS.medium,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
