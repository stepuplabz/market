import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, SHADOWS, wp, hp, fp } from '../../utils/theme';
import { Lock, ArrowLeft, User, Phone, MapPin, Eye, EyeOff, UserPlus } from 'lucide-react-native';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const { registerUser, isProcessing } = useAuth();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState(''); // Optional

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Hata', 'Lütfen adınızı ve soyadınızı girin.');
            return;
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length !== 10) {
            Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz (10 hane).');
            return;
        }

        if (!password || password.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor.');
            return;
        }

        // Register user with name and optional address
        const success = await registerUser(`+90${cleanPhone}`, password, name, address);

        if (success) {
            Alert.alert(
                '✅ Kayıt Başarılı!',
                'Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.',
                [{ text: 'Tamam', onPress: () => navigation.goBack() }]
            );
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, '#1a1a2e']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft color={COLORS.white} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hesap Oluştur</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <UserPlus color={COLORS.primary} size={48} />
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputWrapper}>
                        <User color={COLORS.primary} size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Ad Soyad"
                            placeholderTextColor={COLORS.textSecondary}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Phone Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.prefixContainer}>
                            <Text style={styles.prefixText}>+90</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="5XX XXX XX XX"
                            placeholderTextColor={COLORS.textSecondary}
                            value={phone}
                            onChangeText={(text) => {
                                const formatted = text.replace(/[^0-9]/g, '');
                                if (formatted.length <= 10) setPhone(formatted);
                            }}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                        <Lock color={COLORS.primary} size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre (en az 6 karakter)"
                            placeholderTextColor={COLORS.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                            {showPassword ? <EyeOff color={COLORS.textSecondary} size={20} /> : <Eye color={COLORS.textSecondary} size={20} />}
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputWrapper}>
                        <Lock color={COLORS.primary} size={20} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre Tekrar"
                            placeholderTextColor={COLORS.textSecondary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                            {showConfirmPassword ? <EyeOff color={COLORS.textSecondary} size={20} /> : <Eye color={COLORS.textSecondary} size={20} />}
                        </TouchableOpacity>
                    </View>

                    {/* Address Input (Optional) */}
                    <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                        <MapPin color={COLORS.success} size={20} style={[styles.inputIcon, { marginTop: 8 }]} />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Adres (İsteğe bağlı)"
                            placeholderTextColor={COLORS.textSecondary}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, isProcessing && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={isProcessing}
                    >
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.registerButtonGradient}
                        >
                            <Text style={styles.registerButtonText}>
                                {isProcessing ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
                        <Text style={styles.loginLinkText}>Zaten hesabınız var mı? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Giriş Yap</Text></Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: {
        position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    },
    safeArea: { flex: 1 },
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
        color: COLORS.white,
        fontSize: fp(18),
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.l,
        paddingTop: SPACING.m,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        borderRadius: wp(12),
        height: hp(56),
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        paddingHorizontal: SPACING.m,
    },
    textAreaWrapper: {
        height: hp(100),
        alignItems: 'flex-start',
        paddingVertical: SPACING.s,
    },
    inputIcon: {
        marginRight: SPACING.s,
    },
    prefixContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: SPACING.s,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: SPACING.s,
    },
    prefixText: { color: COLORS.white, fontWeight: 'bold', fontSize: fp(12) },
    input: {
        flex: 1,
        color: COLORS.white,
        fontSize: fp(15),
        height: '100%',
    },
    textArea: {
        textAlignVertical: 'top',
        paddingTop: 0,
    },
    eyeButton: {
        padding: SPACING.s,
    },
    registerButton: {
        borderRadius: wp(12),
        overflow: 'hidden',
        marginTop: SPACING.m,
        ...SHADOWS.medium,
    },
    registerButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: hp(56),
        paddingHorizontal: SPACING.l,
    },
    registerButtonText: {
        color: COLORS.white,
        fontSize: fp(16),
        fontWeight: 'bold',
    },
    loginLink: {
        alignItems: 'center',
        marginTop: SPACING.l,
        padding: SPACING.m,
    },
    loginLinkText: {
        color: COLORS.textSecondary,
        fontSize: fp(14),
    },
});
