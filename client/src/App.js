import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { isAccessTokenExpired } from './utils/check-token-expiry';
import { handleScroll, scrollToTop } from './utils/scroll';
import { Logout, clearError, clearSuccess, refreshToken } from './redux/actions/auth.actions';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Collapse, Container, Alert } from '@mui/material';
import { getAccessToken } from './utils/get-tokens';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { useTheme } from './context/themeContext';
import { fetchUserProfile } from './utils/storage';
import { store } from './redux/store';

import './App.css';

const Home = lazy(() => import('./pages/Home/Home'));
const Auth = lazy(() => import('./pages/Auth/Auth'));
const PostDetails = lazy(() => import('./pages/PostDetails/PostDetails'));
const NotFound = lazy(() => import('./pages/Notfound/NotFound'));
const Userinfo = lazy(() => import('./pages/Userinfo/Userinfo'));

const App = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const darkMode = useTheme();
    const profile = fetchUserProfile();
    const welcomeRef = useRef(false);

    const { accessToken } = useSelector((state) => state.authReducer);
    const { errorMessage, successMessage } = useSelector((state) => state.authReducer);

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [show, setShow] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    // Session and CSRF details are implementation-specific and actionable only
    // to developers, so do not expose them in the user-facing error toast.
    const isTechnicalSessionError = /session\s*id|csrf\s*token/i.test(errorMessage || '');
    const isValidErrorAlertCondition = Boolean(errorMessage && show && !isTechnicalSessionError);

    const isValidSuccessMessage =
        successMessage &&
        showSuccess;    
    // --- Show alerts ---
    useEffect(() => {
        let errorTimer, successTimer;

        if (errorMessage) {
            setShow(true);
            errorTimer = setTimeout(() => {
                setShow(false);
                dispatch(clearError());
            }, 3000);
        }

        if (successMessage) {
            setShowSuccess(true);
            successTimer = setTimeout(() => {
                setShowSuccess(false);
                dispatch(clearSuccess());
            }, 3000);
        }

        return () => {
            if (errorTimer) clearTimeout(errorTimer);
            if (successTimer) clearTimeout(successTimer);
        };
    }, [errorMessage, successMessage, dispatch]);

    // Remove the legacy post cache now that Redux Persist owns post persistence.
    useEffect(() => {
        localStorage.removeItem('cachedPosts');
    }, []);

    // --- Refresh access token if missing or expired ---
    useEffect(() => {
        const refreshAccessTokenIfNeeded = async () => {
            if (isAccessTokenExpired(accessToken)) {
                await dispatch(refreshToken());

                setTimeout(() => {
                    const updatedToken = getAccessToken(store.getState());
                    if (!updatedToken || isAccessTokenExpired(updatedToken)) {
                        dispatch(Logout());
                    }
                }, 0);
            }
        };

        refreshAccessTokenIfNeeded();
    }, [accessToken, dispatch, navigate]);

    // --- Scroll-to-top button logic ---
    useEffect(() => {
        const onScroll = handleScroll(setShowScrollButton);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // --- Welcome message only once per session ---
    useEffect(() => {
        const hasShownWelcome = sessionStorage.getItem('welcomeShown');

        if (!hasShownWelcome && profile?.name) {
            setShowWelcome(true);
            sessionStorage.setItem('welcomeShown', 'true');
            welcomeRef.current = true;

            const timer = setTimeout(() => setShowWelcome(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [profile?.name]);

    return (
        <div className={`root-bg ${darkMode ? 'dark' : ''}`}>
            {/* Success Message */}
            <Collapse in={isValidSuccessMessage}>
                <Alert variant="filled" severity="success" style={{ textAlign: 'center' }}>
                    {successMessage}
                </Alert>
            </Collapse>

            {/* Error Message */}
            <Collapse in={isValidErrorAlertCondition}>
                <Alert variant="filled" severity="error" style={{ textAlign: 'center' }}>
                    {errorMessage}
                </Alert>
            </Collapse>

            {/* Welcome Message */}
            <Collapse in={showWelcome}>
                <Alert variant="filled" icon={false} severity="success">
                    Welcome back, <strong>
                        {profile?.name?.charAt(0).toUpperCase() + profile?.name?.slice(1).toLowerCase()}
                    </strong>
                </Alert>
            </Collapse>

            <Container maxWidth="lg">
                {/* Scroll to Top Button */}
                <KeyboardArrowUpIcon
                    className={showScrollButton ? 'scrollup show' : 'scrollup hide'}
                    onClick={scrollToTop}
                />

                {/* Navigation */}
                <Navbar />

                {/* Routes */}
                <Suspense fallback={<div className="loading-screen">loading...</div>}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/posts" />} />
                        <Route path="/posts/search" element={<Home />} />
                        <Route path="/posts/:slugId" element={<PostDetails />} />
                        <Route path="/posts" element={<Home />} />
                        <Route path="/auth" element={!accessToken ? <Auth /> : <Navigate to="/posts" />} />
                        <Route path="/user/account/:username?" element={<Userinfo />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>

                <Footer />
            </Container>
        </div>
    );
};

export default App;
