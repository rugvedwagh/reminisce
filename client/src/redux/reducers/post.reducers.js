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
    isLoading: false,
    loadingCount: 0,
    posts: [],
};

const postsReducer = (state = initialState, action) => {
    switch (action.type) {
        
        case START_LOADING: {
            if (action.payload !== 'posts') return state;
            const loadingCount = (state.loadingCount || 0) + 1;
            return { ...state, loadingCount, isLoading: loadingCount > 0 };
        }

        case END_LOADING: {
            if (action.payload !== 'posts') return state;
            const loadingCount = Math.max(0, (state.loadingCount || 0) - 1);
            return { ...state, loadingCount, isLoading: loadingCount > 0 };
        }

        case FETCH_ALL:
            const updatedPosts = action.payload.currentPage === 1
                ? action.payload.data
                : [...state.posts, ...action.payload.data.filter(
                    (newPost) => !state.posts.some((post) => post._id === newPost._id)
                )];

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
            return {
                ...state,
                posts: state.posts.map((post) => (post._id === action.payload._id ? action.payload : post)),
            };

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
