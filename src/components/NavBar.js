import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function NavBar({ user }) {
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
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">Fiber Fix</Link>
            </div>
            <div className="nav-links">
                <Link to="/embroidery">Embroidery</Link>
                <Link to="/knitting">Knitting</Link>
                <Link to="/crochet">Crochet</Link>
            </div>
            <div className="nav-auth">
                {user ? (
                    <>
                        <div className="user-profile">
                            <span>{user.email}</span>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default NavBar;
