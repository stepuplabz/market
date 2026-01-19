import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors, SPACING, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, User, Phone, MapPin, Save } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function EditProfileScreen() {
    const { user, updateUser, isProcessing } = useAuth();
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);
    const navigation = useNavigation();

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });

    const handleSave = async () => {
        if (!form.phone) {
            Alert.alert('Hata', 'Telefon numarası zorunludur.');
            return;
        }

        const success = await updateUser(form);
        if (success) {
            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Hata', 'Güncelleme yapılırken bir sorun oluştu.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <View style={[styles.header, { borderBottomColor: COLORS.glassBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={COLORS.text} size={28} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.text }]}>Profili Düzenle</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: COLORS.textSecondary }]}>Ad Soyad</Text>
                        <View style={[styles.inputContainer, { backgroundColor: COLORS.surfaceLight, borderColor: COLORS.glassBorder }]}>
                            <User color={COLORS.textSecondary} size={20} />
                            <TextInput
                                style={[styles.input, { color: COLORS.text }]}
                                value={form.name}
                                onChangeText={text => setForm({ ...form, name: text })}
                                placeholder="Adınız Soyadınız"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: COLORS.textSecondary }]}>Telefon</Text>
                        <View style={[styles.inputContainer, { backgroundColor: COLORS.surfaceLight, borderColor: COLORS.glassBorder }]}>
                            <Phone color={COLORS.textSecondary} size={20} />
                            <TextInput
                                style={[styles.input, { color: COLORS.text }]}
                                value={form.phone}
                                onChangeText={text => setForm({ ...form, phone: text })}
                                placeholder="5XX XXX XX XX"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: COLORS.textSecondary }]}>Adres</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: COLORS.surfaceLight, borderColor: COLORS.glassBorder }]}>
                            <MapPin color={COLORS.textSecondary} size={20} style={{ marginTop: 4 }} />
                            <TextInput
                                style={[styles.input, styles.textArea, { color: COLORS.text }]}
                                value={form.address}
                                onChangeText={text => setForm({ ...form, address: text })}
                                placeholder="Açık adresiniz..."
                                placeholderTextColor={COLORS.textSecondary}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: COLORS.primary, opacity: isProcessing ? 0.7 : 1 }]}
                        onPress={handleSave}
                        disabled={isProcessing}
                    >
                        <Save color={COLORS.white} size={20} />
                        <Text style={styles.saveButtonText}>
                            {isProcessing ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: SPACING.s,
        marginRight: SPACING.s,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.l,
    },
    inputGroup: {
        marginBottom: SPACING.l,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 12,
        borderWidth: 1,
        gap: SPACING.s,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    textAreaContainer: {
        alignItems: 'flex-start',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderRadius: 16,
        gap: SPACING.s,
        marginTop: SPACING.xl,
        ...SHADOWS.medium,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
