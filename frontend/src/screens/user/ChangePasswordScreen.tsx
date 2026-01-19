import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors, SPACING, SHADOWS } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, Lock, Eye, EyeOff, Save } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ChangePasswordScreen() {
    const { changePassword, isProcessing } = useAuth();
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);
    const navigation = useNavigation();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSave = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (newPassword.length < 4) {
            Alert.alert('Hata', 'Yeni şifre en az 4 karakter olmalıdır.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
            return;
        }

        const success = await changePassword(oldPassword, newPassword);
        if (success) {
            Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        }
    };

    const PasswordInput = ({ label, value, onChangeText, show, toggleShow }: any) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: COLORS.textSecondary }]}>{label}</Text>
            <View style={[styles.inputContainer, { backgroundColor: COLORS.surfaceLight, borderColor: COLORS.glassBorder }]}>
                <Lock color={COLORS.textSecondary} size={20} />
                <TextInput
                    style={[styles.input, { color: COLORS.text }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry={!show}
                />
                <TouchableOpacity onPress={toggleShow}>
                    {show ? <EyeOff color={COLORS.textSecondary} size={20} /> : <Eye color={COLORS.textSecondary} size={20} />}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
            <View style={[styles.header, { borderBottomColor: COLORS.glassBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={COLORS.text} size={28} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: COLORS.text }]}>Şifre Değiştir</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <PasswordInput
                        label="Mevcut Şifre"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        show={showOld}
                        toggleShow={() => setShowOld(!showOld)}
                    />

                    <PasswordInput
                        label="Yeni Şifre"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        show={showNew}
                        toggleShow={() => setShowNew(!showNew)}
                    />

                    <PasswordInput
                        label="Yeni Şifre (Tekrar)"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        show={showConfirm}
                        toggleShow={() => setShowConfirm(!showConfirm)}
                    />

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: COLORS.primary, opacity: isProcessing ? 0.7 : 1 }]}
                        onPress={handleSave}
                        disabled={isProcessing}
                    >
                        <Save color={COLORS.white} size={20} />
                        <Text style={styles.saveButtonText}>
                            {isProcessing ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
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
