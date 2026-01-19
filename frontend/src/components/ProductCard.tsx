import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { getColors, SPACING, SHADOWS } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { Product } from '../types';
import { Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');
// Screen Width - (Horizontal Padding of List * 2) - (Margin of Card * 2 * Columns)
// We have 3 columns.
// List Padding = SPACING.s
// Card Margin = SPACING.xs
// Available Width = width - (SPACING.s * 2)
// Each Card Width = (Available Width / 3) - (SPACING.xs * 2)

const CARD_MARGIN = SPACING.xs;
const CONTAINER_PADDING = SPACING.s;
const NUM_COLUMNS = 3;

const CARD_WIDTH = (width - (CONTAINER_PADDING * 2)) / NUM_COLUMNS - (CARD_MARGIN * 2);

interface Props {
    product: Product;
    onAdd: () => void;
}

export default function ProductCard({ product, onAdd }: Props) {
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: COLORS.surface,
                borderColor: COLORS.glassBorder,
                opacity: product.stock <= 0 ? 0.6 : 1, // Gray out if out of stock
                width: CARD_WIDTH
            }
        ]}>
            <View>
                <Image
                    source={{ uri: product.imageUrl }}
                    style={[
                        styles.image,
                        {
                            backgroundColor: '#FFFFFF', // Force white background for pngs
                            opacity: product.stock <= 0 ? 0.8 : 1
                        }
                    ]}
                    resizeMode="contain"
                />
                {/* Campaign Badge */}
                {
                    product.isCampaign && (!product.campaignEndDate || new Date(product.campaignEndDate) > new Date()) && (!product.campaignStartDate || new Date(product.campaignStartDate) <= new Date()) && product.stock > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>★</Text>
                        </View>
                    )
                }
            </View>

            <View style={styles.content}>
                {/* Brand & Name */}
                {product.brand && (
                    <Text style={[styles.brand, { color: COLORS.text }]}>{product.brand}</Text>
                )}
                <Text style={[styles.name, { color: COLORS.primaryDark }]} numberOfLines={2}>{product.name}</Text>

                {/* Description */}
                {product.description && (
                    <Text style={[styles.description, { color: COLORS.textSecondary }]} numberOfLines={1}>{product.description}</Text>
                )}

                {/* Stock Info - Only show if out of stock */}
                {product.stock <= 0 && (
                    <Text style={[styles.stock, { color: COLORS.textSecondary }]}>
                        Stok Bitti
                    </Text>
                )}

                <View style={styles.footer}>
                    {/* Price Display */}
                    <View style={styles.priceContainer}>
                        {(() => {
                            const isCampaignActive = product.isCampaign && (!product.campaignEndDate || new Date(product.campaignEndDate) > new Date()) && (!product.campaignStartDate || new Date(product.campaignStartDate) <= new Date());

                            return isCampaignActive && product.originalPrice && product.stock > 0 ? (
                                <>
                                    <Text style={[styles.oldPrice, { color: COLORS.textMuted }]}>
                                        {product.originalPrice.toFixed(2)} ₺
                                    </Text>
                                    <Text style={[styles.price, { color: COLORS.primary }]}>
                                        {product.price.toFixed(2)} ₺ <Text style={styles.unit}>/ {product.unitType === 'piece' ? 'adet' : product.unitType}</Text>
                                    </Text>
                                </>
                            ) : (
                                <Text style={[styles.price, { color: product.stock <= 0 ? COLORS.textSecondary : COLORS.primary }]}>
                                    {(product.originalPrice || product.price).toFixed(2)} ₺ <Text style={styles.unit}>/ {product.unitType === 'piece' ? 'adet' : product.unitType}</Text>
                                </Text>
                            );
                        })()}
                    </View>

                    {/* Add Button */}
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: product.stock <= 0 ? COLORS.surfaceLight : COLORS.primary, opacity: product.stock > 0 ? 1 : 0.5 }]}
                        onPress={onAdd}
                        disabled={product.stock <= 0}
                    >
                        {product.stock <= 0 ? (
                            <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold' }}>X</Text>
                        ) : (
                            <Plus color="#FFFFFF" size={20} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        margin: SPACING.xs, // Keep tight margin
        overflow: 'hidden',
        ...SHADOWS.small,
        borderWidth: 1,
    },
    image: {
        width: '100%',
        height: 100, // Reduced from 140
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#EF4444',
        width: 24, // Reduced from 28
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10, // Reduced from 14
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.xs, // Reduced padding
    },
    brand: {
        fontSize: 11, // Slightly increased for visibility
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    name: {
        fontSize: 12, // Reduced from 14
        fontWeight: '600',
        marginBottom: 4,
        height: 32, // Reduced from 36
    },
    description: {
        fontSize: 10, // Reduced from 11
        marginBottom: 6,
        height: 14,
    },
    stock: {
        fontSize: 9, // Reduced from 10
        fontWeight: '700',
        marginBottom: 6,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    priceContainer: {
        flex: 1,
    },
    oldPrice: {
        fontSize: 10, // Reduced from 12
        textDecorationLine: 'line-through',
        marginBottom: 1,
    },
    price: {
        fontWeight: '800',
        fontSize: 13, // Reduced from 16
    },
    unit: {
        fontSize: 9, // Reduced from 10
        fontWeight: 'normal',
    },
    addButton: {
        width: 28, // Reduced from 36
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
});

