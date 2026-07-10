import {
    USER_INFO,
    ERROR,
    UPDATE_USER,
} from '../../constants/auth.constants';
import {
    START_LOADING,
    END_LOADING
} from '../../constants/loading.constants';
import { BOOKMARK_POST } from '../../constants/post.constants';
import { fetchUserProfile } from '../../utils/storage';

const initialState = {
    authData: null,
    clientData: null,
    isLoading: false,
    loadingCount: 0,
    errorMessage: null
}

const userReducer = (state = initialState, action) => {

    switch (action.type) {

        case USER_INFO:
            return {
                ...state,
                clientData: action.payload
            };

        case UPDATE_USER: {
            const updatedAuthData = action.payload;
            const existingProfile = fetchUserProfile();

            const updatedProfile = {
                ...existingProfile,
                ...updatedAuthData,
            };
            localStorage.setItem("profile", JSON.stringify(updatedProfile));

            return {
                ...state,
                clientData: {
                    ...state.clientData,
                    ...updatedAuthData,
                },
                errorMessage: ''
            };
        }

        case BOOKMARK_POST:
            return {
                ...state,
                clientData: {
                    ...state.clientData,
                    bookmarks: action.payload.bookmarks,
                },
            };

        case ERROR:
            return {
                ...state,
                errorMessage: action.payload
            };

        case START_LOADING: {
            if (action.payload !== 'user') return state;
            const loadingCount = (state.loadingCount || 0) + 1;
            return { ...state, loadingCount, isLoading: loadingCount > 0 };
        }

        case END_LOADING: {
            if (action.payload !== 'user') return state;
            const loadingCount = Math.max(0, (state.loadingCount || 0) - 1);
            return { ...state, loadingCount, isLoading: loadingCount > 0 };
        }

        default:
            return state;
    }
};

export default userReducer;
