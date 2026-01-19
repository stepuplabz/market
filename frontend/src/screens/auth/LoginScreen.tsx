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
    SafeAreaView,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, SHADOWS, wp, hp, fp } from '../../utils/theme';
import { Lock, ArrowRight, ShieldCheck, X, UserPlus, Eye, EyeOff, User, ShoppingBag } from 'lucide-react-native';

export default function LoginScreen() {
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
    const [roleSelectionModalVisible, setRoleSelectionModalVisible] = useState(false);
    const [pendingUserData, setPendingUserData] = useState<any>(null);

    // User login states
    const [phone, setPhone] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [showUserPassword, setShowUserPassword] = useState(false);

    // Register states
    const [registerPhone, setRegisterPhone] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    // Forgot password states
    const [forgotPhone, setForgotPhone] = useState('');

    const { loginUser, completeLogin, registerUser, isProcessing } = useAuth();
    const navigation = require('@react-navigation/native').useNavigation();

    const handleLogin = async () => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length !== 10) {
            Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz (10 hane).');
            return;
        }
        if (!userPassword) {
            Alert.alert('Hata', 'Lütfen şifrenizi giriniz.');
            return;
        }

        const result = await loginUser(`+90${cleanPhone}`, userPassword);

        if (result.success && result.userData) {
            if (result.role === 'admin') {
                setPendingUserData(result.userData);
                setRoleSelectionModalVisible(true);
            } else {
                await completeLogin(result.userData, 'user');
            }
        }
    };

    const handleRoleSelection = async (mode: 'admin' | 'user') => {
        if (pendingUserData) {
            await completeLogin(pendingUserData, mode);
            setRoleSelectionModalVisible(false);
            setPendingUserData(null);
        }
    };

    const handleRegister = async () => {
        const cleanPhone = registerPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.length !== 10) {
            Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz (10 hane).');
            return;
        }
        if (!registerPassword || registerPassword.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
            return;
        }
        if (registerPassword !== registerPasswordConfirm) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor.');
            return;
        }

        const success = await registerUser(`+90${cleanPhone}`, registerPassword);

        if (success) {
            setRegisterModalVisible(false);
            setPhone(registerPhone);
            setRegisterPhone('');
            setRegisterPassword('');
            setRegisterPasswordConfirm('');

            Alert.alert(
                '✅ Kayıt Başarılı!',
                'Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.',
                [{ text: 'Tamam' }]
            );
        }
    };

    const handleForgotPassword = () => {
        const cleanPhone = forgotPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.length !== 10) {
            Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz (10 hane).');
            return;
        }
        // TODO: Implement actual password reset
        Alert.alert('Bilgi', 'Şifre sıfırlama bağlantısı SMS olarak gönderildi.', [
            {
                text: 'Tamam',
                onPress: () => {
                    setForgotPasswordModalVisible(false);
                    setForgotPhone('');
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Clean White Background with subtle top decoration */}
            {/* Clean White Background with subtle decorative elements */}
            <View style={styles.topDecorationCircle} />
            <View style={[styles.decorativeShape, styles.shape1]} />
            <View style={[styles.decorativeShape, styles.shape2]} />
            <View style={[styles.decorativeShape, styles.shape3]} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={styles.scrollContent}
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <ShoppingBag size={40} color={COLORS.primary} />
                            </View>
                            <Text style={styles.title}>Market</Text>
                            <Text style={styles.subtitle}>Market Cebinizde</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {/* Phone Input */}
                            <Text style={styles.inputLabel}>Telefon Numarası</Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.prefixContainer}>
                                    <Text style={styles.prefixText}>TR +90</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="5XX XXX XX XX"
                                    placeholderTextColor={COLORS.textMuted}
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
                            <Text style={styles.inputLabel}>Şifre</Text>
                            <View style={styles.passwordWrapper}>
                                <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="••••••"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={userPassword}
                                    onChangeText={setUserPassword}
                                    secureTextEntry={!showUserPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowUserPassword(!showUserPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showUserPassword ? (
                                        <EyeOff color={COLORS.textSecondary} size={20} />
                                    ) : (
                                        <Eye color={COLORS.textSecondary} size={20} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity
                                style={styles.forgotPasswordButton}
                                onPress={() => setForgotPasswordModalVisible(true)}
                            >
                                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                                disabled={isProcessing}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.primaryDark]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.loginButtonGradient}
                                >
                                    <Text style={styles.loginButtonText}>
                                        {isProcessing ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                    </Text>
                                    {!isProcessing && <ArrowRight color={COLORS.white} size={20} />}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Divider with Text */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>veya</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Register Button - Now Secondary Style */}
                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={() => setRegisterModalVisible(true)}
                            >
                                <UserPlus color={COLORS.primary} size={20} />
                                <Text style={styles.registerButtonText}>Yeni Hesap Oluştur</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* ROLE SELECTION MODAL */}
            <Modal
                visible={roleSelectionModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRoleSelectionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Görünüm Seçin</Text>
                        </View>
                        <Text style={styles.modalDescription}>
                            Devam etmek istediğiniz arayüzü seçin.
                        </Text>

                        <TouchableOpacity
                            style={styles.roleButton}
                            onPress={() => handleRoleSelection('admin')}
                        >
                            <LinearGradient
                                colors={['#7c3aed', '#6d28d9']}
                                style={styles.roleButtonGradient}
                            >
                                <ShieldCheck color={COLORS.white} size={24} />
                                <Text style={styles.roleButtonText}>Yönetici Paneli</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.roleButton}
                            onPress={() => handleRoleSelection('user')}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.primaryDark]}
                                style={styles.roleButtonGradient}
                            >
                                <User color={COLORS.white} size={24} />
                                <Text style={styles.roleButtonText}>Kullanıcı Arayüzü</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* REGISTER MODAL */}
            <Modal
                visible={registerModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setRegisterModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ width: '100%' }}
                        >
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeaderRow}>
                                    <Text style={styles.modalTitleLarge}>Kayıt Ol</Text>
                                    <TouchableOpacity onPress={() => setRegisterModalVisible(false)}>
                                        <X color={COLORS.textSecondary} size={24} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.modalSubtitle}>Hızlıca aramıza katılın!</Text>

                                <View style={styles.modalForm}>
                                    <View style={styles.modalInputContainer}>
                                        <View style={styles.modalPrefix}>
                                            <Text style={styles.modalPrefixText}>+90</Text>
                                        </View>
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="5XX XXX XX XX"
                                            placeholderTextColor={COLORS.textMuted}
                                            value={registerPhone}
                                            onChangeText={(t) => setRegisterPhone(t.replace(/[^0-9]/g, ''))}
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                        />
                                    </View>

                                    <View style={styles.modalInputContainer}>
                                        <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="Şifre"
                                            placeholderTextColor={COLORS.textMuted}
                                            value={registerPassword}
                                            onChangeText={setRegisterPassword}
                                            secureTextEntry={!showRegisterPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowRegisterPassword(!showRegisterPassword)}>
                                            {showRegisterPassword ? <EyeOff color={COLORS.textSecondary} size={20} /> : <Eye color={COLORS.textSecondary} size={20} />}
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.modalInputContainer}>
                                        <Lock color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="Şifre Tekrar"
                                            placeholderTextColor={COLORS.textMuted}
                                            value={registerPasswordConfirm}
                                            onChangeText={setRegisterPasswordConfirm}
                                            secureTextEntry={!showRegisterPassword}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={styles.modalActionButton}
                                        onPress={handleRegister}
                                        disabled={isProcessing}
                                    >
                                        <LinearGradient
                                            colors={[COLORS.success, COLORS.successLight]}
                                            style={styles.modalActionGradient}
                                        >
                                            <Text style={styles.modalActionText}>
                                                {isProcessing ? 'Kayıt Yapılıyor...' : 'Hesap Oluştur'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* FORGOT PASSWORD MODAL - Simplified for brevity but styled same way */}
            <Modal
                visible={forgotPasswordModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setForgotPasswordModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeaderRow}>
                                <Text style={styles.modalTitleLarge}>Şifremi Unuttum</Text>
                                <TouchableOpacity onPress={() => setForgotPasswordModalVisible(false)}>
                                    <X color={COLORS.textSecondary} size={24} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSubtitle}>
                                Telefon numaranızı girin, size SMS göndereceğiz.
                            </Text>

                            <View style={styles.modalInputContainer}>
                                <View style={styles.modalPrefix}>
                                    <Text style={styles.modalPrefixText}>+90</Text>
                                </View>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="5XX XXX XX XX"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={forgotPhone}
                                    onChangeText={(t) => setForgotPhone(t.replace(/[^0-9]/g, ''))}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.modalActionButton}
                                onPress={handleForgotPassword}
                            >
                                <LinearGradient
                                    colors={[COLORS.warning, COLORS.warningLight]}
                                    style={styles.modalActionGradient}
                                >
                                    <Text style={styles.modalActionText}>Gönder</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // White
    },
    topDecorationCircle: {
        position: 'absolute',
        top: -hp(20),
        right: -wp(20),
        width: wp(80),
        height: wp(80),
        borderRadius: wp(40),
        backgroundColor: COLORS.primary, // Orange Circle
        opacity: 0.15,
        transform: [{ scale: 1.5 }],
    },
    decorativeShape: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.2,
    },
    shape1: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.secondary, // Navy
        top: hp(15),
        left: -30,
    },
    shape2: {
        width: 150,
        height: 150,
        backgroundColor: COLORS.primary, // Orange
        bottom: hp(10),
        right: -40,
    },
    shape3: {
        width: 60,
        height: 60,
        backgroundColor: COLORS.secondary, // Navy
        bottom: hp(30),
        left: wp(10),
    },
    safeArea: { flex: 1 },
    scrollContent: { flex: 1 },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.l,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 1.5
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
        ...SHADOWS.soft,
        borderWidth: 1,
        borderColor: COLORS.surfaceElevated,
    },

    title: {
        fontSize: fp(32),
        fontWeight: 'bold',
        color: COLORS.secondary, // Navy Blue
        letterSpacing: 0.5
    },
    subtitle: {
        fontSize: fp(16),
        color: COLORS.textSecondary,
        marginTop: SPACING.xs
    },

    // User Form
    formContainer: {
        width: '100%',
    },
    inputLabel: {
        color: COLORS.text,
        fontSize: fp(14),
        fontWeight: '600',
        marginBottom: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        height: hp(56),
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.surfaceElevated,
        ...SHADOWS.small, // Soft shadow
    },
    prefixContainer: {
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: SPACING.m,
        borderRightWidth: 1,
        borderRightColor: COLORS.surfaceElevated,
        backgroundColor: COLORS.surfaceLight,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    prefixText: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: fp(14)
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: fp(16),
        paddingHorizontal: SPACING.m,
        fontWeight: '500',
        height: '100%',
    },

    // Password
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        height: hp(56),
        marginBottom: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.surfaceElevated,
        paddingLeft: SPACING.m,
        ...SHADOWS.small,
    },
    inputIcon: { marginRight: SPACING.s },
    passwordInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: fp(16),
        height: '100%',
    },
    eyeButton: { padding: SPACING.m },

    // Actions
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.l,
        padding: SPACING.xs,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: fp(14),
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: SPACING.l,
        ...SHADOWS.medium,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: hp(56),
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: fp(16),
        fontWeight: 'bold',
        marginRight: SPACING.s,
    },

    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.surfaceElevated,
    },
    dividerText: {
        color: COLORS.textMuted,
        marginHorizontal: SPACING.m,
        fontSize: 14,
    },

    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: hp(56),
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
    },
    registerButtonText: {
        color: COLORS.primary,
        fontSize: fp(16),
        fontWeight: 'bold',
        marginLeft: SPACING.s,
    },

    // Modal Common
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // Navy overlay
        justifyContent: 'flex-end',
        padding: 0,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: SPACING.xl,
        paddingBottom: hp(40), // Safe area
        ...SHADOWS.large,
    },
    modalHeader: { alignItems: 'center', marginBottom: SPACING.m },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs
    },
    modalTitle: { fontSize: fp(18), fontWeight: 'bold', color: COLORS.text },
    modalTitleLarge: { fontSize: fp(24), fontWeight: 'bold', color: COLORS.secondary },
    modalDescription: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginBottom: SPACING.l
    },
    modalSubtitle: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.l,
        fontSize: fp(14),
    },

    // Role Buttons
    roleButton: { borderRadius: 16, overflow: 'hidden', marginBottom: SPACING.m, ...SHADOWS.small },
    roleButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: hp(56),
    },
    roleButtonText: { color: COLORS.white, fontSize: fp(16), fontWeight: 'bold', marginLeft: SPACING.s },

    // Modal Forms
    modalForm: { gap: SPACING.m },
    modalInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 12,
        height: hp(52),
        paddingHorizontal: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.surfaceElevated,
    },
    modalPrefix: {
        borderRightWidth: 1,
        borderRightColor: COLORS.surfaceElevated,
        paddingRight: SPACING.m,
        marginRight: SPACING.m,
    },
    modalPrefixText: { color: COLORS.text, fontWeight: 'bold' },
    modalInput: { flex: 1, color: COLORS.text, height: '100%', fontSize: fp(15) },
    modalActionButton: { borderRadius: 12, overflow: 'hidden', marginTop: SPACING.s },
    modalActionGradient: { alignItems: 'center', justifyContent: 'center', height: hp(50) },
    modalActionText: { color: COLORS.white, fontWeight: 'bold', fontSize: fp(16) },
});
