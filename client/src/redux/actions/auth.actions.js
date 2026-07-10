import {
    AUTH,
    CLEAR_ERROR,
    CLEAR_SUCCESS,
    ERROR,
    LOGOUT,
    REFRESH_TOKEN,
    SUCCESS_MESSAGE,
} from '../../constants/auth.constants';
import {
    END_LOADING,
    START_LOADING
} from '../../constants/loading.constants';

import {
    refreshTokenApi,
    registerApi,
    logInApi,
    logoutApi,
} from '../../api/auth.api';

const logIn = (formData, navigate) => async (dispatch) => {
    dispatch({ type: START_LOADING, payload: 'auth' });

    try {
        const { data } = await logInApi(formData);
        const { csrfToken, sessionId } = data;

        localStorage.setItem('profile', JSON.stringify(data.result));
        localStorage.setItem('csrfToken', csrfToken);
        localStorage.setItem('sessionId', sessionId);

        dispatch({ type: AUTH, payload: data });
        navigate('/posts');
    } catch (error) {
        const message = error?.response?.data?.message;
        dispatch({ type: ERROR, payload: message });
        console.error(error);
    } finally {
        dispatch({ type: END_LOADING, payload: 'auth' });
    }
};

const register = (formData, navigate) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING, payload: 'auth' });

        const { data } = await registerApi(formData);
        const { csrfToken, sessionId } = data;

        localStorage.setItem('profile', JSON.stringify(data.result));
        localStorage.setItem('csrfToken', csrfToken);
        localStorage.setItem('sessionId', sessionId);

        dispatch({ type: AUTH, payload: data });
        navigate('/posts');
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    } finally {
        dispatch({ type: END_LOADING, payload: 'auth' });
    }
};

const Logout = () => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING, payload: 'auth' });
        await logoutApi();
        localStorage.removeItem('profile');
        localStorage.removeItem('csrfToken');
        localStorage.removeItem('sessionId');
        dispatch({ type: LOGOUT });
        // dispatch({ type: SUCCESS_MESSAGE, payload: "Logged out successfully" })
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    } finally {
        dispatch({ type: END_LOADING, payload: 'auth' });
    }
};

const refreshToken = () => async (dispatch) => {
    try {
        const { data } = await refreshTokenApi();
        dispatch({ type: REFRESH_TOKEN, payload: data.accessToken });
    } catch (error) {
        console.error("Error in Refresh Token:", error.response?.data || error);
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
    }
};

const clearError = () => ({
    type: CLEAR_ERROR
});

const clearSuccess = () => ({
    type: CLEAR_SUCCESS
})

export {
    logIn,
    register,
    Logout,
    clearError,
    clearSuccess,
    refreshToken,
}
