import { getDatabase, ref, set, get, child } from "firebase/database";
import { auth } from '../firebase';

const db = getDatabase();

export const initializeUserFloss = async (userId) => {
    const userRef = ref(db, `users/${userId}/floss`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
        const initialFloss = {};
        // Initialize all floss counts to 0
        const dmcData = require('../data/dmc_floss_data.json');
        dmcData.forEach(floss => {
            initialFloss[floss.floss] = 0;
        });
        
        await set(userRef, initialFloss);
        return initialFloss;
    }
    
    return snapshot.val();
};

export const updateFlossCount = async (userId, flossNumber, increment) => {
    const flossRef = ref(db, `users/${userId}/floss/${flossNumber}`);
    const snapshot = await get(flossRef);
    const currentCount = snapshot.exists() ? snapshot.val() : 0;
    const newCount = Math.max(0, currentCount + increment); // Prevent negative counts
    await set(flossRef, newCount);
    return newCount;
};
