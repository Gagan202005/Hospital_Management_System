import { createSlice } from "@reduxjs/toolkit";

const initialstate = {
    user : localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    loading : false,
}

const profileslice = createSlice({
    name : "profile",
    initialState:initialstate,
    reducers:{
        setUser(state){
            state.user=localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
        },
        setLoading(state,value){
            state.loading=value.payload
        },
    }
});

export const {setUser,setLoading}=profileslice.actions;
export default profileslice.reducer;