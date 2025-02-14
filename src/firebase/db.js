import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, deleteDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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

const storage = getStorage();

export const createKnittingProject = async (userId, projectData, patternFile = null) => {
    const projectRef = doc(collection(db, "users", userId, "knittingProjects"));
    const projectId = projectRef.id;

    let patternUrl = null;
    if (patternFile) {
        const storageRef = ref(storage, `users/${userId}/patterns/${projectId}/${patternFile.name}`);
        await uploadBytes(storageRef, patternFile);
        patternUrl = await getDownloadURL(storageRef);
    }

    await setDoc(projectRef, {
        ...projectData,
        patternUrl,
        patternFileName: patternFile?.name || null,
        rowCount: 0,
        rowTarget: 0,
        repeatPattern: false,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    
    return projectId;
};

export const updateKnittingProject = async (userId, projectId, projectData, patternFile = null) => {
    const projectRef = doc(db, "users", userId, "knittingProjects", projectId);
    const currentData = (await getDoc(projectRef)).data();

    const updateData = { ...projectData, updatedAt: new Date() };

    if (patternFile) {
        // Delete old pattern file if it exists
        if (currentData.patternUrl) {
            const oldStorageRef = ref(storage, `users/${userId}/patterns/${projectId}/${currentData.patternFileName}`);
            try {
                await deleteObject(oldStorageRef);
            } catch (error) {
                console.log('No existing file to delete or error deleting:', error);
            }
        }

        // Upload new pattern file
        const storageRef = ref(storage, `users/${userId}/patterns/${projectId}/${patternFile.name}`);
        await uploadBytes(storageRef, patternFile);
        updateData.patternUrl = await getDownloadURL(storageRef);
        updateData.patternFileName = patternFile.name;
    } else {
        // Keep existing pattern data if no new file
        updateData.patternUrl = currentData.patternUrl || null;
        updateData.patternFileName = currentData.patternFileName || null;
    }

    await updateDoc(projectRef, updateData);
};

export const updateRowCounter = async (userId, projectId, count, target, repeat) => {
    const projectRef = doc(db, "users", userId, "knittingProjects", projectId);
    await updateDoc(projectRef, {
        rowCount: count,
        rowTarget: target,
        repeatPattern: repeat,
        updatedAt: new Date()
    });
};

export const deleteKnittingProject = async (userId, projectId) => {
    const projectRef = doc(db, "users", userId, "knittingProjects", projectId);
    
    // Get the project data to check for pattern file
    const projectDoc = await getDoc(projectRef);
    const projectData = projectDoc.data();
    
    // Delete pattern file if it exists
    if (projectData?.patternFileName) {
        const storageRef = ref(storage, `users/${userId}/patterns/${projectId}/${projectData.patternFileName}`);
        try {
            await deleteObject(storageRef);
        } catch (error) {
            console.log('Error deleting pattern file:', error);
        }
    }
    
    // Delete the project document
    await deleteDoc(projectRef);
};

export const getKnittingProjects = async (userId) => {
    const projectsRef = collection(db, "users", userId, "knittingProjects");
    const snapshot = await getDocs(projectsRef);
    
    // Get all projects with their data
    const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Update pattern URLs if they exist
    for (let project of projects) {
        if (project.patternFileName) {
            try {
                const storageRef = ref(storage, `users/${userId}/patterns/${project.id}/${project.patternFileName}`);
                project.patternUrl = await getDownloadURL(storageRef);
            } catch (error) {
                console.log('Error getting pattern URL:', error);
                project.patternUrl = null;
            }
        }
    }

    return projects;
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
