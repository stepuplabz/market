import { wp, hp, fp, ms, RESPONSIVE_SPACING, RESPONSIVE_FONTS, RADIUS, ICON_SIZES, BUTTON_HEIGHTS } from './responsive';

// Light theme colors (DEFAULT)
// Light theme colors (DEFAULT)
const LIGHT_COLORS = {
    // Primary palette - Vibrant Orange
    primary: '#F97316', 
    primaryLight: '#FDBA74',
    primaryDark: '#C2410C',

    // Secondary accent - Navy Blue
    secondary: '#1E3A5F', 
    secondaryLight: '#334E68',

    // Backgrounds - White Dominant
    background: '#FFFFFF', // Pure White
    surface: '#F8FAFC', // Off-White / Very Light Slate
    surfaceLight: '#F1F5F9', 
    surfaceElevated: '#E2E8F0', 

    // Text - Dark Navy for contrast
    text: '#0F172A', 
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    // Status colors
    success: '#10B981',
    successLight: '#34D399',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#EF4444',
    errorLight: '#F87171',
    info: '#3B82F6',

    // Base
    white: '#FFFFFF',
    black: '#000000',

    // Glass effect (optimized for light mode)
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(226, 232, 240, 0.6)', 
    glassLight: 'rgba(255, 255, 255, 0.5)',

    // Overlay
    overlay: 'rgba(15, 23, 42, 0.3)',
    overlayDark: 'rgba(15, 23, 42, 0.7)',

    // Navigation Bar
    navBar: '#FFFFFF', 
    navBarText: '#1E3A5F',
};

// Dark theme colors (Adjusted for consistency but keeping dark aesthetic)
const DARK_COLORS = {
    // Primary palette - Vibrant Orange
    primary: '#F97316', 
    primaryLight: '#FB923C',
    primaryDark: '#EA580C',

    // Secondary accent - Lighter Navy
    secondary: '#3B82F6', 
    secondaryLight: '#60A5FA',

    // Backgrounds
    background: '#0F172A', // Dark Navy
    surface: '#1E293B', 
    surfaceLight: '#334155', 
    surfaceElevated: '#475569', 

    // Text
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Status colors
    success: '#10B981',
    successLight: '#34D399',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    error: '#EF4444',
    errorLight: '#F87171',
    info: '#3B82F6',

    // Base
    white: '#FFFFFF',
    black: '#000000',

    // Glass effect
    glass: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassLight: 'rgba(255, 255, 255, 0.05)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayDark: 'rgba(0, 0, 0, 0.85)',

    // Navigation Bar
    navBar: '#1E293B', 
    navBarText: '#F8FAFC',
};

// Function to get colors based on theme
export const getColors = (isDark: boolean) => isDark ? DARK_COLORS : LIGHT_COLORS;

// Default export for backward compatibility
export const COLORS = LIGHT_COLORS; // Changed default to Light since that's the focus

// Responsive spacing
export const SPACING = RESPONSIVE_SPACING;

// Responsive font sizes
export const FONTS = {
    // Size scale
    xs: RESPONSIVE_FONTS.xs,
    sm: RESPONSIVE_FONTS.sm,
    md: RESPONSIVE_FONTS.md,
    lg: RESPONSIVE_FONTS.lg,
    xl: RESPONSIVE_FONTS.xl,
    xxl: RESPONSIVE_FONTS.xxl,
    h3: RESPONSIVE_FONTS.h3,
    h2: RESPONSIVE_FONTS.h2,
    h1: RESPONSIVE_FONTS.h1,
    hero: RESPONSIVE_FONTS.hero,

    // Font weights
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

// Responsive shadows
export const SHADOWS = {
    none: {},
    small: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: hp(1) },
        shadowOpacity: 0.05,
        shadowRadius: wp(3),
        elevation: 2,
    },
    medium: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: hp(4) },
        shadowOpacity: 0.1,
        shadowRadius: wp(12),
        elevation: 4,
    },
    large: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: hp(10) },
        shadowOpacity: 0.15,
        shadowRadius: wp(20),
        elevation: 10,
    },
    // New Premium Soft Shadow
    soft: {  
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: hp(8) },
        shadowOpacity: 0.08,
        shadowRadius: wp(24),
        elevation: 6,
    },
    glow: {
        shadowColor: LIGHT_COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: wp(16),
        elevation: 8,
    },
};

// Export responsive utilities
export const RADIUS_SIZES = RADIUS;
export const ICONS = ICON_SIZES;
export const BUTTONS = BUTTON_HEIGHTS;

// Re-export responsive functions for convenience
export { wp, hp, fp, ms } from './responsive';
