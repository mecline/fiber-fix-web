import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, deleteDoc, getDocs } from "firebase/firestore";

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

export const createKnittingProject = async (userId, projectData) => {
    const projectRef = doc(collection(db, "users", userId, "knittingProjects"));
    await setDoc(projectRef, {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return projectRef.id;
};

export const updateKnittingProject = async (userId, projectId, projectData) => {
    const projectRef = doc(db, "users", userId, "knittingProjects", projectId);
    await updateDoc(projectRef, {
        ...projectData,
        updatedAt: new Date()
    });
};

export const deleteKnittingProject = async (userId, projectId) => {
    const projectRef = doc(db, "users", userId, "knittingProjects", projectId);
    await deleteDoc(projectRef);
};

export const getKnittingProjects = async (userId) => {
    const projectsRef = collection(db, "users", userId, "knittingProjects");
    const snapshot = await getDocs(projectsRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
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
