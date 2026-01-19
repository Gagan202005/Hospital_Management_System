import { toast as hotToast } from "react-hot-toast" // Renamed to avoid conflict with argument
import { setLoading } from "../../Slices/authslice"
import { apiConnector } from "../apiConnector"
import { setProgress } from "../../Slices/loadingbarslice"
import { Adminendpoints } from "../api";
import { setUser } from "../../Slices/profileslice"; 

const {
  ADD_PATIENT_API,
  ALL_USER_API,
  ADD_AMBULANCE_API,
  ALL_AMBULANCE_API,
  GET_ALL_BEDS_API,
  ADD_BED_API,
  ADD_ADMIN_API,
  ADD_DOCTOR_API,
  UPDATE_ADMIN_PROFILE_API,
  UPDATE_ADMIN_IMAGE_API,
} = Adminendpoints;

// --- 2. UPDATE ADMIN PROFILE ---
export async function updateAdminProfile(profile, token, dispatch, toast) {
  // Note: 'toast' here is the Shadcn function passed from the component
  dispatch(setLoading(true));
  
  try {
    const payload = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneno: profile.phoneno,
      dob: profile.dob,
      age: profile.age,
      gender: profile.gender,
      address: profile.address,
      about: profile.about
    };

    const response = await apiConnector(
      "PUT", 
      UPDATE_ADMIN_PROFILE_API,
      payload,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // Use Shadcn Toast
    toast({
      title: "Success",
      description: "Admin profile updated successfully.",
      variant: "default",
    });
    
    // Update Storage & Redux
    const updatedUser = response.data.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE_ADMIN_PROFILE_API ERROR:", error);
    toast({
      title: "Update Failed",
      description: error?.response?.data?.message || "Could not update profile.",
      variant: "destructive",
    });
  }
  dispatch(setLoading(false));
}

// --- 3. UPDATE ADMIN PFP ---
export async function updateAdminPfp(token, pfp, dispatch, toast) {
  try {
    const formData = new FormData();
    formData.append('pfp', pfp); 

    const response = await apiConnector(
      "PUT", 
      UPDATE_ADMIN_IMAGE_API, 
      formData, 
      { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data" 
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast({
      title: "Success",
      description: "Profile picture updated.",
    });
    
    const imageUrl = response.data.data.image; 
    const user = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...user, image: imageUrl };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE_ADMIN_PFP_API ERROR:", error);
    toast({
      title: "Upload Failed",
      description: error?.response?.data?.message || "Could not upload image.",
      variant: "destructive",
    });
  }
}

// --- LEGACY FUNCTIONS (Using react-hot-toast) ---

export async function Add_Patient(formData,token,dispatch){
    try{
        const {firstName,lastName,age,gender,email,phone,address,emergencyContact,dob,password,confirmPassword}=formData;
        dispatch(setLoading(true));
        const response = await apiConnector("POST",ADD_PATIENT_API,{firstName,lastName,age,gender,email,phone,address,emergencyContact,dob,password,confirmPassword},{
            Authorization: `Bearer ${token}`,
        });
        dispatch(setProgress(100));

        if(response.data.success){
            hotToast.success("Patient Registered Successfully");
            console.log(response);
        }
        else{
            throw new Error(response.data.message)
        }
    }
    catch(error){
        console.log("Add Patient API ERROR............", error)
        hotToast.error(error?.response?.data?.message);
        dispatch(setProgress(100));
    }
    dispatch(setLoading(false))
}

export async function GetAll_Users(token, accountType, dispatch) {
    let result = [];
    try {
        dispatch(setLoading(true));
        
        const response = await apiConnector(
            "GET",
            ALL_USER_API,
            null,
            { Authorization: `Bearer ${token}` },
            { accountType: accountType }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        result = response.data.data; 
    } catch (error) {
        console.log("API ERROR:", error);
        hotToast.error(error?.response?.data?.message || "Could not fetch users");
    }
    dispatch(setLoading(false));
    return result; 
}

export async function Add_Ambulance(formData, token, dispatch) {
    try {
        const { vehicleNumber, model, year, driverName, driverLicense, driverContact } = formData;
        dispatch(setLoading(true));
        
        const response = await apiConnector(
            "POST",
            ADD_AMBULANCE_API,
            { vehicleNumber, model, year, driverName, driverLicense, driverContact },
            { Authorization: `Bearer ${token}` }
        );
        dispatch(setProgress(100));

        if (response.data.success) {
            hotToast.success("Ambulance Added Successfully");
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.log("ADD_AMBULANCE_API ERROR............", error);
        hotToast.error(error?.response?.data?.message || "Failed to add ambulance");
        dispatch(setProgress(100));
    }
    dispatch(setLoading(false));
}

export async function GetAll_Ambulances(token, dispatch) {
    let result = [];
    try {
        dispatch(setLoading(true));
        const response = await apiConnector(
            "GET",
            ALL_AMBULANCE_API,
            null,
            { Authorization: `Bearer ${token}` },
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        result = response.data.ambulances; 
    } catch (error) {
        console.log("API ERROR:", error);
        hotToast.error(error?.response?.data?.message || "Could not fetch All Ambulances");
    }
    dispatch(setLoading(false));
    return result; 
}

export async function GetAll_Beds(token, dispatch) {
    let result = [];
    dispatch(setLoading(true));
    try {
        const response = await apiConnector(
            "GET",
            GET_ALL_BEDS_API,
            null,
            { Authorization: `Bearer ${token}` }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        result = response.data.Beds; 
    } catch (error) {
        console.log("GET_ALL_BEDS_API ERROR............", error);
        hotToast.error("Could not fetch beds");
    }
    dispatch(setLoading(false));
    return result;
}

export async function Add_Bed(formData, token, dispatch) {
    try {
        dispatch(setLoading(true));
        const response = await apiConnector(
            "POST",
            ADD_BED_API,
            formData,
            { Authorization: `Bearer ${token}` }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.log("ADD_BED_API ERROR............", error);
        hotToast.error(error?.response?.data?.message || "Failed to add bed");
        throw error; 
    } finally {
        dispatch(setLoading(false));
    }
}

export async function Add_Admin(formData, token, dispatch) {
    try {
        dispatch(setLoading(true));
        const { firstName, lastName, email, phoneno, age, gender, dob, address, password, confirmPassword } = formData;

        const response = await apiConnector(
            "POST",
            ADD_ADMIN_API,
            { firstName, lastName, email, phoneno, age, gender, dob, address, password, confirmPassword },
            { Authorization: `Bearer ${token}` }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        hotToast.success("Admin Registered Successfully");

    } catch (error) {
        console.log("ADD_ADMIN_API ERROR............", error);
        hotToast.error(error?.response?.data?.message || "Failed to add admin");
    } finally {
        dispatch(setLoading(false));
    }
}

export async function Add_Doctor(formData, token, dispatch) {
    try {
        dispatch(setLoading(true));
        const response = await apiConnector(
            "POST",
            ADD_DOCTOR_API,
            formData,
            { Authorization: `Bearer ${token}` }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
    } catch (error) {
        console.log("ADD_DOCTOR_API ERROR:", error);
        hotToast.error(error?.response?.data?.message || "Failed to add doctor");
        throw error; 
    } finally {
        dispatch(setLoading(false));
    }
}