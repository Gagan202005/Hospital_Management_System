import { toast } from "react-hot-toast"
import { setLoading, setToken } from "../../Slices/authslice"
import { setUser } from "../../Slices/profileslice"
import { endpoints } from "../api"
import {apiConnector} from "../apiConnector"
import { useSelector } from "react-redux"
const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
  CHANGE_PASSWORD_API,
  GEMINI_CHAT_API,
  CONTACT_US_API,
} = endpoints


export function SendOtp (email,navigate) {
    return async(dispatch) =>{
        try{
            dispatch(setLoading(true));
            const response = await apiConnector("POST",SENDOTP_API,{
                    email,
            })
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

            if(response.data.success){
                toast.success("Registered Successfully")
                navigate("/login");
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch(error){
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


export async function changePassword(token, formData) {
  const toastId = toast.loading("Updating Password...");
  try {
    const response = await apiConnector(
      "POST",
      CHANGE_PASSWORD_API, // Make sure this route maps to the controller above
      formData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Password Changed Successfully");
    return true; 

  } catch (error) {
    console.log("CHANGE PASSWORD API ERROR............", error);
    toast.error(error.response?.data?.message || "Failed to change password");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};



export const contactUsApi = async (data, setLoading) => {
  const toastId = toast.loading("Sending message...");
  setLoading(true);
  
  try {
    const response = await apiConnector("POST", CONTACT_US_API, data);

    console.log("CONTACT_US_API RESPONSE:", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Message Sent Successfully!");
    
  } catch (error) {
    console.log("CONTACT_US_API ERROR:", error);
    toast.error(error.response?.data?.message || "Could not send message");
  }
  
  setLoading(false);
  toast.dismiss(toastId);
};


export const getAiResponse = async (prompt) => {
  try {
    const response = await apiConnector("POST", GEMINI_CHAT_API, { prompt });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data; // Returns the AI text string
  } catch (error) {
    console.log("AI_CHAT_API ERROR:", error);
    toast.error("Could not reach AI Assistant");
    return null;
  }
};