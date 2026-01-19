import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Modal, TouchableOpacity, TextInput, Animated, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColors, SPACING, SHADOWS, COLORS } from '../../utils/theme';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES, PRODUCTS } from '../../utils/mockData';
import CategoryItem from '../../components/CategoryItem';
import ProductCard from '../../components/ProductCard';
import Toast from '../../components/Toast';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { subscribeToProducts } from '../../services/productService';
import { X, Minus, Plus, ShoppingBasket, Search, Menu } from 'lucide-react-native';

import { subscribeToCategories } from '../../services/categoryService';
import { Category } from '../../types';

export default function HomeScreen() {
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchText, setSearchText] = useState('');
    const [weightModalVisible, setWeightModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [currentWeight, setCurrentWeight] = useState(1.0); // Default 1kg

    // Real Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Toast State
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const { addToCart, items } = useCart();

    const navigation = require('@react-navigation/native').useNavigation();
    useEffect(() => {
        const unsubscribeProd = subscribeToProducts((data) => {
            setProducts(data);
            setIsLoading(false);
        });
        const unsubscribeCat = subscribeToCategories((data) => {
            // Special Categories
            const allCategory: Category = { id: 'all', name: 'Tümü', icon: 'grid' };
            const bestSellers: Category = { id: 'best_sellers', name: 'En Çok Satanlar', icon: 'trending-up' };
            const campaigns: Category = { id: 'campaigns', name: 'Kampanyalılar', icon: 'percent' };

            setCategories([allCategory, bestSellers, campaigns, ...data]);

            // Default to 'all' if nothing selected
            if (!selectedCategory) {
                setSelectedCategory('all');
            }
        });
        return () => {
            unsubscribeProd();
            unsubscribeCat();
        };
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setToastVisible(true);
    };

    const filteredProducts = products
        .filter(p => {
            // 1. Check Stock (CRITICAL FIX)
            if ((p.stock || 0) <= 0) return false;

            const matchesSearch = searchText.trim() === '' || p.name.toLowerCase().includes(searchText.toLowerCase());

            if (!matchesSearch) return false;

            if (selectedCategory === 'all') return true;
            if (selectedCategory === 'best_sellers') return true; // Show all, will sort next
            if (selectedCategory === 'campaigns') return p.isCampaign; // Only campaigns

            return p.category === selectedCategory;
        })
        .sort((a, b) => {
            // Special sorting for Best Sellers
            if (selectedCategory === 'best_sellers') {
                return (b.salesCount || 0) - (a.salesCount || 0);
            }

            // Default sorting: Newest first
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

    const handleProductPress = (product: Product) => {
        if (product.unitType === 'kg') {
            setSelectedProduct(product);
            setCurrentWeight(1.0); // Reset to default
            setWeightModalVisible(true);
        } else {
            addToCart(product, 1);
            showToast(`${product.name} sepete eklendi`);
        }
    };

    const adjustWeight = (amount: number) => {
        setCurrentWeight(prev => {
            const newVal = prev + amount;
            return newVal > 0 ? parseFloat(newVal.toFixed(2)) : 0.1;
        });
    };

    const confirmWeightSelection = () => {
        if (selectedProduct && currentWeight > 0) {
            addToCart(selectedProduct, currentWeight);
            showToast(`${selectedProduct.name} sepete eklendi`);
            setWeightModalVisible(false);
            setSelectedProduct(null);
        }
    };


    // ... (rest of filtering logic)

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['top']}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: COLORS.textSecondary }]}>Merhaba,</Text>
                    <Text style={[styles.headerTitle, { color: COLORS.text }]}>Ne Almak İstersin?</Text>
                </View>
                <TouchableOpacity
                    style={[styles.basketIcon, { backgroundColor: COLORS.surfaceLight }]}
                    onPress={() => (navigation as any).navigate('Sepetim')}
                >
                    <ShoppingBasket color={COLORS.primary} size={28} />
                    {items.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{items.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: COLORS.surfaceLight }]}>
                <Search color={COLORS.textSecondary} size={20} />
                <TextInput
                    style={[styles.searchInput, { color: COLORS.text }]}
                    placeholder="Ürün ara..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <X color={COLORS.textSecondary} size={20} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Current Category Title Display */}
            {/* Horizontal Category List (Trendyol Style) */}
            <View style={styles.categoryContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                >
                    {categories.map(cat => (
                        <CategoryItem
                            key={cat.id}
                            category={cat}
                            isSelected={selectedCategory === cat.id}
                            onPress={() => {
                                setSelectedCategory(cat.id);
                                setSearchText('');
                            }}
                        />
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredProducts}
                key={3} // Force re-render when changing numColumns
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onAdd={() => handleProductPress(item)}
                    />
                )}
                numColumns={3}
                contentContainerStyle={styles.productList}
                columnWrapperStyle={styles.columnWrapper}
            />

            {/* Advanced Weight Selection Modal */}
            <Modal
                visible={weightModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setWeightModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: COLORS.surface, borderColor: COLORS.glassBorder }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: COLORS.textSecondary }]}>Miktar Seçimi</Text>
                            <TouchableOpacity onPress={() => setWeightModalVisible(false)} style={styles.closeBtn}>
                                <X color={COLORS.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.productSummary}>
                            <Text style={[styles.productName, { color: COLORS.text }]}>{selectedProduct?.name}</Text>
                            <Text style={[styles.productPrice, { color: COLORS.primary }]}>{selectedProduct?.price.toFixed(2)} ₺ / kg</Text>
                        </View>

                        <View style={[styles.controlsContainer, { backgroundColor: COLORS.surfaceLight }]}>
                            <TouchableOpacity
                                style={[styles.controlBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.glassBorder }]}
                                onPress={() => adjustWeight(-0.5)}
                            >
                                <Minus color={COLORS.text} size={24} />
                            </TouchableOpacity>

                            <View style={styles.weightDisplay}>
                                <TextInput
                                    style={[styles.weightInput, { color: COLORS.text }]}
                                    value={currentWeight.toString()}
                                    onChangeText={(t) => setCurrentWeight(parseFloat(t) || 0)}
                                    keyboardType="numeric"
                                />
                                <Text style={[styles.unitText, { color: COLORS.textSecondary }]}>kg</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.controlBtn, styles.plusBtn, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                                onPress={() => adjustWeight(0.5)}
                            >
                                <Plus color="#FFFFFF" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.totalSection, { borderTopColor: COLORS.glassBorder }]}>
                            <Text style={[styles.totalLabel, { color: COLORS.textSecondary }]}>Toplam Tutar</Text>
                            <Text style={[styles.totalValue, { color: COLORS.text }]}>
                                {(currentWeight * (selectedProduct?.price || 0)).toFixed(2)} ₺
                            </Text>
                        </View>

                        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: COLORS.success }]} onPress={confirmWeightSelection}>
                            <Text style={styles.confirmText}>Sepete Ekle</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Toast
                visible={toastVisible}
                message={toastMessage}
                onHide={() => setToastVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.l,
        paddingBottom: SPACING.s,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    basketIcon: {
        padding: SPACING.s,
        borderRadius: 12,
    },
    categoryContainer: {
        paddingVertical: SPACING.m,
    },
    categoryList: {
        paddingHorizontal: SPACING.m,
    },
    productList: {
        padding: SPACING.s,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'flex-start',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: SPACING.xl,
        borderTopWidth: 1,
        minHeight: 450,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    closeBtn: {
        padding: 4,
    },
    productSummary: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '600',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        borderRadius: 24,
        padding: SPACING.s,
    },
    controlBtn: {
        width: 56,
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    plusBtn: {},
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weightInput: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: 80,
    },
    unitText: {
        fontSize: 18,
        marginLeft: 4,
        fontWeight: '600',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        paddingTop: SPACING.l,
        borderTopWidth: 1,
    },
    totalLabel: {
        fontSize: 16,
    },
    totalValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    confirmBtn: {
        padding: SPACING.l,
        borderRadius: 16,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    confirmText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.l,
        paddingHorizontal: SPACING.m,
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: SPACING.s,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.s,
        fontSize: 16,
    },

    badge: {
        position: 'absolute',
        top: -5,
        right: -5, // Slightly outside the icon
        backgroundColor: '#F97316', // Orange
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

