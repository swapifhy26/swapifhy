/**
 * Swapifhy Mobile Haptics Engine
 * Provides subtle tactile feedback on iOS & Android devices.
 */

export const haptic = {
    // Subtle 8ms tap for clicking chips, buttons, filters
    light: () => {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            try {
                navigator.vibrate(8);
            } catch (_) {}
        }
    },

    // 15ms medium tap for tabs and primary actions
    medium: () => {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            try {
                navigator.vibrate(15);
            } catch (_) {}
        }
    },

    // Double rhythm for successful actions (e.g. swap sent, follow)
    success: () => {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            try {
                navigator.vibrate([10, 30, 15]);
            } catch (_) {}
        }
    },

    // Warning pulse for errors or cancellations
    warning: () => {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            try {
                navigator.vibrate([20, 40, 20]);
            } catch (_) {}
        }
    },

    // Crisp micro-selection for scrolling lists or sliders
    selection: () => {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            try {
                navigator.vibrate(4);
            } catch (_) {}
        }
    }
};
