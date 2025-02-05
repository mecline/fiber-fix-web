import React from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div>
            <h1>Welcome to Fiber Artists Hub</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Home;
