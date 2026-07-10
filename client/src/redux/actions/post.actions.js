import {
    FETCH_ALL,
    CREATE,
    UPDATE,
    LIKE,
    DELETE,
    FETCH_BY_SEARCH,
    FETCH_POST,
    COMMENT,
    LIKED_POSTS,
    USER_POSTS,
    BOOKMARK_POST
} from '../../constants/post.constants';
import {
    fetchPostApi,
    deletePostApi,
    fetchPostsBySearchApi,
    addCommentApi,
    fetchPostsApi,
    createPostApi,
    likePostApi,
    updatePostApi,
    bookmarkPostApi
} from '../../api/post.api';
import {
    START_LOADING,
    END_LOADING
} from '../../constants/loading.constants';
import { ERROR, SUCCESS_MESSAGE } from '../../constants/auth.constants';

const fetchPost = (slug, id) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data } = await fetchPostApi(slug, id);
        dispatch({ type: FETCH_POST, payload: data });
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
    } finally {
        dispatch({ type: END_LOADING });
    }
};

const fetchPosts = (page) => async (dispatch, getState) => {
    try {
        dispatch({ type: START_LOADING });
        const cachedPosts = JSON.parse(localStorage.getItem('cachedPosts')) || {
            posts: [],
            pages: {},
            numberOfPages: 0
        };

        if (cachedPosts.pages[page]) {
            dispatch({
                type: FETCH_ALL,
                payload: {
                    data: cachedPosts.posts,
                    currentPage: page,
                    numberOfPages: cachedPosts.numberOfPages,
                }
            });
        }
        else {
            const {
                data: {
                    data,
                    currentPage,
                    numberOfPages
                }
            } = await fetchPostsApi(page);

            const updatedPosts = [...cachedPosts.posts, ...data];
            const updatedPages = { ...cachedPosts.pages, [page]: true };

            localStorage.setItem(
                'cachedPosts',
                JSON.stringify({
                    posts: updatedPosts,
                    pages: updatedPages,
                    numberOfPages,
                })
            );

            dispatch({
                type: FETCH_ALL,
                payload: {
                    data: updatedPosts,
                    currentPage,
                    numberOfPages
                }
            });
        }
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
    } finally {
        dispatch({ type: END_LOADING });
    }
};

const fetchPostsBySearch = (searchQuery) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data: { data } } = await fetchPostsBySearchApi(searchQuery);
        dispatch({ type: FETCH_BY_SEARCH, payload: data });
        dispatch({ type: SUCCESS_MESSAGE, payload: "Found some posts matching your query" })
    } catch (error) {
        // The API responds with 404 when a valid search has no matching posts.
        // Keep the empty state quiet rather than showing an error toast.
        if (error?.response?.status === 404) {
            dispatch({ type: FETCH_BY_SEARCH, payload: [] });
        } else {
            dispatch({ type: ERROR, payload: error?.response?.data?.message });
            console.error(error);
        }
    } finally {
        dispatch({ type: END_LOADING });
    }
};

const createPost = (post) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data } = await createPostApi(post);

        localStorage.removeItem('cachedPosts');

        dispatch({ type: CREATE, payload: data });
        dispatch({ type: SUCCESS_MESSAGE, payload: "Post created successfully" })
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    } finally {
        dispatch({ type: END_LOADING });
    }
};

const updatePost = (id, post) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data } = await updatePostApi(id, post);

        localStorage.removeItem('cachedPosts');

        dispatch({ type: UPDATE, payload: data });
        dispatch({ type: SUCCESS_MESSAGE, payload: "Post updated successfully" })
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    } finally {
        dispatch({ type: END_LOADING });
    }
};

const deletePost = (id) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        await deletePostApi(id);
        dispatch({ type: DELETE, payload: id });
        dispatch({ type: SUCCESS_MESSAGE, payload: "Post deleted successfully" })
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    } finally {
        dispatch({ type: END_LOADING });
    }
};

const likePost = (id) => async (dispatch) => {
    try {
        const { data } = await likePostApi(id);
        dispatch({ type: LIKE, payload: data });
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    }
};

const addComment = (value, id) => async (dispatch) => {
    try {
        dispatch({ type: START_LOADING });
        const { data } = await addCommentApi(value, id);
        dispatch({ type: COMMENT, payload: data });
        return data.comments;
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    }
    finally {
        dispatch({ type: END_LOADING });
    }
};

const bookmarkPost = (postId, userId) => async (dispatch) => {
    try {
        const { data } = await bookmarkPostApi(postId, userId);
        dispatch({ type: BOOKMARK_POST, payload: data });
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    }
};

const likedPosts = (data) => async (dispatch) => {
    try {
        dispatch({ type: LIKED_POSTS, payload: data });
        dispatch({ type: SUCCESS_MESSAGE, payload: "Showing posts liked by you" })
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    }
};


const userPosts = (data) => async (dispatch) => {
    try {
        dispatch({ type: USER_POSTS, payload: data });
        dispatch({ type: SUCCESS_MESSAGE, payload: "Showing your posts" })
    } catch (error) {
        dispatch({ type: ERROR, payload: error?.response?.data?.message });
        console.error(error);
    }
};

export {
    fetchPost,
    fetchPosts,
    fetchPostsBySearch,
    createPost,
    updatePost,
    deletePost,
    userPosts,
    likePost,
    likedPosts,
    addComment,
    bookmarkPost
};
