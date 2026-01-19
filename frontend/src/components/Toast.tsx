import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, View, Animated } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { SHADOWS, SPACING } from '../utils/theme';

interface ToastProps {
    visible: boolean;
    message: string;
    onHide: () => void;
    type?: 'success' | 'error';
}

export default function Toast({ visible, message, onHide, type = 'success' }: ToastProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 15
                })
            ]).start();

            // Auto hide timer
            const timer = setTimeout(() => {
                hide();
            }, 2000);

            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -20,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            if (visible) onHide();
        });
    };

    if (!visible) return null;

    const backgroundColor = type === 'success' ? '#10B981' : '#EF4444';
    const Icon = type === 'success' ? Check : X;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor,
                    opacity,
                    transform: [{ translateY }]
                }
            ]}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon color="#FFFFFF" size={20} />
                </View>
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Safe area top + spacing
        left: SPACING.m,
        right: SPACING.m,
        padding: SPACING.m,
        borderRadius: 16,
        zIndex: 1000,
        ...SHADOWS.medium,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
});
