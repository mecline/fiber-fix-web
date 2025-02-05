// Calculate color difference using Delta E (CIE76)
export function calculateColorDifference(hex1, hex2) {
    // Convert hex to RGB
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    
    // Calculate difference
    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;
    
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

export function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

export function isValidHex(hex) {
    const regex = /^#?[0-9A-Fa-f]{6}$/;
    return regex.test(hex);
}
