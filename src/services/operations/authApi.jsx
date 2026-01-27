import { setLoading, setToken } from "../../Slices/authslice"
import { setUser } from "../../Slices/profileslice"
import { endpoints } from "../api"
import { apiConnector } from "../apiConnector"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  CHANGE_PASSWORD_API,
  GEMINI_CHAT_API,
  CONTACT_US_API,
} = endpoints


export function SendOtp (email, navigate) {
    return async(dispatch) =>{
        dispatch(setLoading(true));
        try{
            const response = await apiConnector("POST", SENDOTP_API, {
                    email,
            })
            if(response.data.success){
                navigate("/verify-email");
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch(error){
            console.log("SENDOTP API ERROR............", error)
            throw error; // Rethrow for component handling
        }
        finally {
            dispatch(setLoading(false))
        }
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
            const response = await apiConnector("POST", SIGNUP_API, {
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
                navigate("/login");
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch(error){
            console.log("SIGNUP API ERROR............", error)
            navigate("/signup")
            throw error;
        }
        finally {
            dispatch(setLoading(false))
        }
    }
}

export function login(email, password, accountType, navigate){
    return async (dispatch) => {
        dispatch(setLoading(true));
        try{
            const response = await apiConnector("POST", LOGIN_API, {
                email, password, accountType
            })
            
            if(!response.data.success){
                throw new Error(response.data.message);
            }
            else{
                localStorage.setItem("token", JSON.stringify(response.data.token));
                localStorage.setItem("user", JSON.stringify(response.data.user));
                
                // Assuming your slice actions accept payload
                dispatch(setUser(response.data.user));
                dispatch(setToken(response.data.token));
                navigate("/");
            }
        }
        catch(error){
            console.log("LOGIN API ERROR............", error);
            // navigate("/login"); // Optional: stay on page to retry
            throw error;
        }
        finally {
            dispatch(setLoading(false));
        }
    }
}

export function logout(navigate){
    return (dispatch) =>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch(setUser(null));
        dispatch(setToken(null));
        navigate("/");
    }
}


export async function changePassword(token, formData) {
  try {
    const response = await apiConnector(
      "POST",
      CHANGE_PASSWORD_API, 
      formData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return true; 

  } catch (error) {
    console.log("CHANGE PASSWORD API ERROR............", error);
    throw error;
  }
};

export const contactUsApi = async (data) => {
  try {
    const response = await apiConnector("POST", CONTACT_US_API, data);
    console.log("CONTACT_US_API RESPONSE:", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return true;
    
  } catch (error) {
    console.log("CONTACT_US_API ERROR:", error);
    throw error;
  }
};


export const getAiResponse = async (prompt) => {
  try {
    const response = await apiConnector("POST", GEMINI_CHAT_API, { prompt });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data; 
  } catch (error) {
    console.log("AI_CHAT_API ERROR:", error);
    return null; 
  }
};