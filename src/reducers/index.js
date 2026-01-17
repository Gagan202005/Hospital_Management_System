import { combineReducers } from "redux";
import authReducer from '../Slices/authslice.js'
import loadingBarReducer from "../Slices/loadingbarslice.js"
import profileReducer from "../Slices/profileslice.js"
const rootReducer=combineReducers({
    auth:authReducer,
    loadingBar: loadingBarReducer,
    profile : profileReducer,
})


export default rootReducer;