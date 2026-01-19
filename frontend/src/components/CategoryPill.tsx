import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { getColors, SPACING, SHADOWS } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

interface Props {
    category: Category;
    isSelected: boolean;
    onPress: () => void;
}

export default function CategoryPill({ category, isSelected, onPress }: Props) {
    const { isDark } = useTheme();
    const COLORS = getColors(isDark);

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: COLORS.surfaceLight, borderColor: COLORS.glassBorder },
                isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
            ]}
            onPress={onPress}
        >
            <Image source={{ uri: category.image }} style={styles.image} />
            <Text style={[
                styles.text,
                { color: COLORS.textSecondary },
                isSelected && { color: '#FFFFFF' }
            ]}>
                {category.name}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderRadius: 20,
        marginRight: SPACING.s,
        borderWidth: 1,
        ...SHADOWS.small,
    },
    image: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: SPACING.s,
        backgroundColor: '#ccc',
    },
    text: {
        fontWeight: '600',
        fontSize: 14,
    },
});

