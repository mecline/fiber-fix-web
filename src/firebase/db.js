import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const db = getFirestore();

export const initializeUserFloss = async (userId) => {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists()) {
        const initialFloss = {};
        // Initialize all floss counts to 0
        const dmcData = require('../data/dmc_floss_data.json');
        dmcData.forEach(floss => {
            initialFloss[floss.floss] = 0;
        });
        
        await setDoc(userRef, { floss: initialFloss });
        return initialFloss;
    }
    
    return snapshot.data().floss;
};

export const updateFlossCount = async (userId, flossNumber, increment) => {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);
    const currentData = snapshot.data();
    const currentCount = currentData?.floss?.[flossNumber] || 0;
    const newCount = Math.max(0, currentCount + increment);

    await updateDoc(userRef, {
        [`floss.${flossNumber}`]: newCount
    });

    return newCount;
};
