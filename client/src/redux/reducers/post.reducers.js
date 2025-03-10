import {
    FETCH_ALL,
    FETCH_POST,
    LIKE,
    CREATE,
    UPDATE,
    DELETE,
    FETCH_BY_SEARCH,
    COMMENT,
    LIKED_POSTS,
    USER_POSTS
} from "../../constants/post.constants";
import {
    START_LOADING,
    END_LOADING
} from "../../constants/loading.constants";

const initialState = {
    isLoading: true,
    posts: JSON.parse(localStorage.getItem("cachedPosts")) || [],
    currentPage: 1,
    numberOfPages: 1
};

const postsReducer = (state = initialState, action) => {
    switch (action.type) {
        case START_LOADING:
            return { ...state, isLoading: true };

        case END_LOADING:
            return { ...state, isLoading: false };

        case FETCH_ALL:
            const updatedPosts = action.payload.currentPage === 1
                ? action.payload.data
                : [...state.posts, ...action.payload.data.filter(
                    (newPost) => !state.posts.some((post) => post._id === newPost._id)
                )];

            localStorage.setItem("cachedPosts", JSON.stringify(updatedPosts));

            return {
                ...state,
                posts: updatedPosts,
                currentPage: action.payload.currentPage,
                numberOfPages: action.payload.numberOfPages,
            };


        case FETCH_POST:
            return { ...state, post: action.payload };

        case CREATE:
            return { ...state, posts: [action.payload, ...state.posts] };

        case UPDATE:
        case LIKE:
            return {
                ...state,
                posts: state.posts.map((post) => (post._id === action.payload._id ? action.payload : post)),
            };

        case DELETE:
            return {
                ...state,
                posts: state.posts.filter((post) => post._id !== action.payload),
            };

        case FETCH_BY_SEARCH:
            return { ...state, posts: action.payload };

        case COMMENT:
            return {
                ...state,
                posts: state.posts.map((post) =>
                    post._id === action.payload._id ? action.payload : post
                ),
            };

        case LIKED_POSTS:
            return {
                ...state,
                posts: state.posts?.filter((post) => post.likes.includes(action.payload))
            }

        case USER_POSTS:
            return {
                ...state,
                posts: state.posts?.filter((post) => post.creator === action.payload)
            }


        default:
            return state;
    }
};

export default postsReducer;
