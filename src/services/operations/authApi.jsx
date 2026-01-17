import { toast } from "react-hot-toast"
import { setLoading, setToken } from "../../Slices/authslice"
import { setUser } from "../../Slices/profileslice"
import { endpoints } from "../api"
import {apiConnector} from "../apiConnector"
import {setProgress} from "../../Slices/loadingbarslice"
import { useSelector } from "react-redux"
const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints


export function SendOtp (email,navigate) {
    return async(dispatch) =>{
        try{
            dispatch(setLoading(true));
            const response = await apiConnector("POST",SENDOTP_API,{
                    email,
            })
            dispatch(setProgress(100));
            if(response.data.success){
                toast.success("OTP Sent Successfully")
                navigate("/verify-email");
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch(error){
            console.log("SENDOTP API ERROR............", error)
            toast.error(error.response.data.message);
            dispatch(setProgress(100));
        }
        dispatch(setLoading(false))
    }
}

export function Signup(
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                otp,
                phone,
                navigate){
    return async (dispatch) => {
        dispatch(setLoading(true));
        try{
            const response = await apiConnector("POST",SIGNUP_API,{
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                otp,
                phone
            })
            console.log("SIGNUP API RESPONSE............", response)

            dispatch(setProgress(100));
            if(response.data.success){
                toast.success("Registered Successfully")
                navigate("/login");
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch(error){
            dispatch(setProgress(100));
            console.log("SIGNUP API ERROR............", error)
            toast.error("Signup Failed")
            navigate("/signup")
        }
        dispatch(setLoading(false))
    }
}

export function login(email,password,accountType,navigate){
    return async (dispatch) => {
        try{
            setLoading(true);
            const response = await apiConnector("POST",LOGIN_API,{
            email,password,accountType
        })
        console.log(response);
        dispatch(setProgress(100));
        if(!response.data.success){
            throw new Error(response.data.message);
        }
        else{
            toast.success("logged in successfully");
            //console.log(response);
            localStorage.setItem("token",JSON.stringify(response.data.token));
            localStorage.setItem("user",JSON.stringify(response.data.user));
            dispatch(setUser());
            dispatch(setToken());
            navigate("/");
        }
        setLoading(false);
    }
    catch(error){
        dispatch(setProgress(100));
        toast.error(error.response.data.message);
        setLoading(false);
        navigate("/login");
    }
    }
}

export function logout(navigate){
    return (dispatch) =>{
        localStorage.setItem("token",null);
        localStorage.setItem("user",null);
        dispatch(setUser());
        dispatch(setToken());
        toast.success("logged out successfully")
        navigate("/");
    }
}
