import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { getColors, SPACING, SHADOWS } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

interface Props {
    category: Category;
    isSelected: boolean;
    onPress: () => void;
}

import { Grid, TrendingUp, Percent } from 'lucide-react-native';

export default function CategoryItem({ category, isSelected, onPress }: Props) {
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);

    const getIcon = (iconName: string) => {
        const size = 24;
        const color = isSelected ? COLORS.warning : COLORS.primary;
        switch (iconName) {
            case 'grid': return <Grid size={size} color={color} />;
            case 'trending-up': return <TrendingUp size={size} color={color} />;
            case 'percent': return <Percent size={size} color={color} />;
            default: return null;
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[
                styles.imageContainer,
                {
                    backgroundColor: COLORS.surface,
                    borderColor: isSelected ? COLORS.warning : COLORS.surfaceElevated
                }
            ]}>
                {category.image ? (
                    <Image source={{ uri: category.image }} style={styles.image} resizeMode="cover" />
                ) : category.icon ? (
                    getIcon(category.icon)
                ) : (
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.primary }}>
                        {category.name.substring(0, 2).toUpperCase()}
                    </Text>
                )}
            </View>
            <Text
                numberOfLines={2}
                style={[
                    styles.text,
                    { color: isSelected ? COLORS.warning : COLORS.text }
                ]}
            >
                {category.name}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
        width: 75,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 2,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    text: {
        fontWeight: '500',
        fontSize: 12,
        textAlign: 'center',
    },
});
