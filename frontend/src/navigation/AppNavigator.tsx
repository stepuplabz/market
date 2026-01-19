import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getColors } from '../utils/theme';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/user/HomeScreen';
import CartScreen from '../screens/user/CartScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import OrderHistoryScreen from '../screens/user/OrderHistoryScreen';
import EditProfileScreen from '../screens/user/EditProfileScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminSalesScreen from '../screens/admin/AdminSalesScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AddressesScreen from '../screens/user/AddressesScreen';
import AddAddressScreen from '../screens/user/AddAddressScreen';
import ChangePasswordScreen from '../screens/user/ChangePasswordScreen';
import CheckoutAddressScreen from '../screens/user/CheckoutAddressScreen';
import { View, ActivityIndicator, Platform } from 'react-native';

import { Home, ShoppingCart, User } from 'lucide-react-native';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const UserStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

function MainTabs() {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);
    // iOS cihazlar için alt safe area padding'i ekle (home indicator için)
    const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 8;

    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: COLORS.navBar,
                borderTopColor: isDark ? '#334155' : '#E2E8F0',
                borderTopWidth: 1,
                height: 60 + bottomPadding,
                paddingBottom: bottomPadding,
                paddingTop: 8,
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    },
                    android: {
                        elevation: 8,
                    },
                }),
            },
            tabBarActiveTintColor: COLORS.navBarText,
            tabBarInactiveTintColor: isDark ? '#94A3B8' : '#94A3B8', // Slate 400 for better visibility in both modes
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
            },
        }}>
            <Tab.Screen
                name="Ana Sayfa"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Sepetim"
                component={CartScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Profil"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
}

function UserNavigator() {
    return (
        <UserStack.Navigator screenOptions={{ headerShown: false }}>
            <UserStack.Screen name="MainTabs" component={MainTabs} />
            <UserStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <UserStack.Screen name="EditProfile" component={EditProfileScreen} />
            <UserStack.Screen name="Addresses" component={AddressesScreen} />
            <UserStack.Screen name="AddAddress" component={AddAddressScreen} />
            <UserStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <UserStack.Screen name="CheckoutAddress" component={CheckoutAddressScreen} />
        </UserStack.Navigator>
    );
}

import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminUserOrdersScreen from '../screens/admin/AdminUserOrdersScreen';

// ... (previous imports)

import AdminCampaignsScreen from '../screens/admin/AdminCampaignsScreen';

function AdminNavigator() {
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);

    return (
        <AdminStack.Navigator screenOptions={{
            headerStyle: { backgroundColor: COLORS.navBar },
            headerTintColor: COLORS.navBarText,
            contentStyle: { backgroundColor: COLORS.background },
            headerTitleStyle: { fontWeight: 'bold' }
        }}>
            <AdminStack.Screen name="Dashboard" component={AdminDashboard} options={{ headerShown: false }} />
            <AdminStack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'Siparişler' }} />
            <AdminStack.Screen name="Products" component={AdminProductsScreen} options={{ title: 'Ürünler' }} />
            <AdminStack.Screen name="Campaigns" component={AdminCampaignsScreen} options={{ title: 'Kampanya Yönetimi' }} />
            <AdminStack.Screen name="Categories" component={AdminCategoriesScreen} options={{ title: 'Kategoriler' }} />
            <AdminStack.Screen name="Sales" component={AdminSalesScreen} options={{ title: 'Satışlar' }} />
            <AdminStack.Screen name="Users" component={AdminUsersScreen} options={{ title: 'Kullanıcılar', headerShown: false }} />
            <AdminStack.Screen name="UserOrders" component={AdminUserOrdersScreen} options={{ title: 'Kullanıcı Siparişleri', headerShown: false }} />
            <AdminStack.Screen name="Settings" component={AdminSettingsScreen} options={{ title: 'Ayarlar' }} />
        </AdminStack.Navigator>
    );
}

export default function AppNavigator() {
    const { user, viewMode, isLoading } = useAuth();
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        )
    }

    return (
        <NavigationContainer>
            {!user ? (
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                    <AuthStack.Screen name="Login" component={LoginScreen} />
                    <AuthStack.Screen name="Register" component={RegisterScreen} />
                </AuthStack.Navigator>
            ) : viewMode === 'admin' ? (
                <AdminNavigator />
            ) : (
                <UserNavigator />
            )}
        </NavigationContainer>
    );
}

