import {
    ERROR,
    USER_INFO,
    UPDATE_USER,
    SUCCESS_MESSAGE,
} from '../../constants/auth.constants';
import {
    END_LOADING,
    START_LOADING
} from '../../constants/loading.constants';
import {
    userInfoApi,
    updateUserDetailsApi
} from '../../api/user.api';

const fetchUserData = (id) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING, payload: 'user' });

        const { data } = await userInfoApi(id);
        dispatch({ type: USER_INFO, payload: data });
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    } finally {
        dispatch({ type: END_LOADING, payload: 'user' });
    }
};

const updateUserDetails = (id, updatedData) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING, payload: 'user' });

        const { data } = await updateUserDetailsApi(id, updatedData);
        const { password, __v, ...filteredData } = data;

        dispatch({ type: SUCCESS_MESSAGE, payload : 'User updated successfully' })
        dispatch({ type: UPDATE_USER, payload: filteredData });
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    } finally {
        dispatch({ type: END_LOADING, payload: 'user' });
    }
};

export {
    updateUserDetails,
    fetchUserData,
}
