import { combineReducers } from "redux";
import authReducer from '../Slices/authslice.js'
import profileReducer from "../Slices/profileslice.js"
const rootReducer=combineReducers({
    auth:authReducer,
    profile : profileReducer,
})


export default rootReducer;