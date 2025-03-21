import { isAccessTokenExpired, isRefreshTokenExpired } from './utils/checkTokenExpiry';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getAccessToken, getRefreshToken } from './utils/getTokens';
import PostDetails from '../src/pages/PostDetails/PostDetails';
import { Logout, refreshToken } from './redux/actions/auth.actions';
import { handleScroll, scrollToTop } from './utils/scroll';
import NotFound from '../src/pages/Notfound/NotFound';
import Userinfo from '../src/pages/Userinfo/Userinfo';
import React, { useEffect, useState } from 'react';
import { useTheme } from './context/themeContext';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import { useDispatch } from 'react-redux';
import { Container } from '@mui/material';
import Home from '../src/pages/Home/Home';
import Auth from '../src/pages/Auth/Auth';
import './App.css';

const App = () => {

    const dispatch = useDispatch();
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [userLoggedOut, setUserLoggedOut] = useState(false);

    const darkMode = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const refreshTokenFromCookies = getRefreshToken();
    const accessToken = getAccessToken();

    useEffect(() => {
        const checkAuth = () => {
            if ((!accessToken || isAccessTokenExpired(accessToken)) && refreshTokenFromCookies) {
                dispatch(refreshToken(refreshTokenFromCookies));
            } 
            else if (!refreshTokenFromCookies && !userLoggedOut) {
                dispatch(Logout(navigate));
                setUserLoggedOut(true);
            } 
            else if (refreshTokenFromCookies && isRefreshTokenExpired(refreshTokenFromCookies)) {
                dispatch(Logout(navigate));
            }
        };

        checkAuth();

        const interval = setInterval(checkAuth, 10 * 60 * 1000);

        return () => clearInterval(interval); 
    }, [accessToken, refreshTokenFromCookies, dispatch, navigate, userLoggedOut]);

    useEffect(() => {
        const onScroll = handleScroll(setShowScrollButton);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className={`root-bg ${darkMode ? 'dark' : ''}`}>
            <Container maxWidth="lg">

                <KeyboardArrowUpIcon
                    className={showScrollButton ? 'scrollup show' : 'scrollup hide'}
                    onClick={scrollToTop}
                />

                <Navbar />
                <Routes>
                    <Route path="/" element={<Navigate to="/posts" />} />
                    <Route path="/posts/search" element={<Home />} />
                    <Route path="/posts/:id" element={<PostDetails />} />
                    <Route path="/posts" element={<Home />} />
                    <Route path="/auth" element={isRefreshTokenExpired(refreshTokenFromCookies) ? <Auth /> : <Navigate to="/posts" />} />
                    <Route path="user/i" element={<Userinfo />} />;
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />

            </Container>
        </div>
    );
};

export default App;
