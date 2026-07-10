import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

import authReducer from "./auth.reducers";
import postsReducer from "./post.reducers";
import themeReducer from "./theme.reducers";
import userReducer from "./user.reducers";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["postsReducer"],
};

const rootReducer = combineReducers({
    postsReducer,  
    authReducer,    
    themeReducer,
    userReducer,
});

export default persistReducer(persistConfig, rootReducer);
