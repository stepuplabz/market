import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro - common design base)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
const scale = Math.min(widthScale, heightScale);

/**
 * Responsive width - scales based on screen width
 * Use for horizontal dimensions (margins, paddings, widths)
 */
export const wp = (size: number): number => {
    return Math.round(size * widthScale);
};

/**
 * Responsive height - scales based on screen height
 * Use for vertical dimensions (heights, vertical margins)
 */
export const hp = (size: number): number => {
    return Math.round(size * heightScale);
};

/**
 * Responsive font size - scales proportionally with moderate scaling
 * Prevents fonts from becoming too large on tablets
 */
export const fp = (size: number): number => {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Moderate scale - for elements that shouldn't scale too aggressively
 * Good for icons, buttons, spacing
 */
export const ms = (size: number, factor: number = 0.5): number => {
    return Math.round(size + (size * scale - size) * factor);
};

/**
 * Responsive spacing values
 */
export const RESPONSIVE_SPACING = {
    xs: wp(4),
    s: wp(8),
    m: wp(16),
    l: wp(24),
    xl: wp(32),
    xxl: wp(40),
};

/**
 * Responsive font sizes
 */
export const RESPONSIVE_FONTS = {
    xs: fp(10),
    sm: fp(12),
    md: fp(14),
    lg: fp(16),
    xl: fp(18),
    xxl: fp(20),
    h3: fp(24),
    h2: fp(28),
    h1: fp(32),
    hero: fp(48),
};

/**
 * Screen size breakpoints
 */
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;
export const isTablet = SCREEN_WIDTH >= 768;

/**
 * Device info
 */
export const DEVICE = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmall: isSmallDevice,
    isMedium: isMediumDevice,
    isLarge: isLargeDevice,
    isTablet: isTablet,
};

/**
 * Responsive icon sizes
 */
export const ICON_SIZES = {
    xs: ms(16),
    sm: ms(20),
    md: ms(24),
    lg: ms(28),
    xl: ms(32),
    xxl: ms(40),
};

/**
 * Responsive button heights
 */
export const BUTTON_HEIGHTS = {
    sm: hp(40),
    md: hp(50),
    lg: hp(56),
    xl: hp(64),
};

/**
 * Responsive border radius
 */
export const RADIUS = {
    xs: wp(4),
    sm: wp(8),
    md: wp(12),
    lg: wp(16),
    xl: wp(20),
    xxl: wp(24),
    round: wp(100),
};
