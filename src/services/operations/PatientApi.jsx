import { toast } from "react-hot-toast"
import { setLoading, setToken } from "../../Slices/authslice"
import { setUser } from "../../Slices/profileslice"
import { profendpoints } from "../api"
import {apiConnector} from "../apiConnector"
import {setProgress} from "../../Slices/loadingbarslice"

const {
  PATIENT_EDITPROFILE_API,
  PATIENT_UPDATEDISPLAYPICTURE_API,PATIENT_APPOINTMENTS_API,GET_PATIENT_DASHBOARD_API
} = profendpoints

// =============================================
// UPDATE PROFILE TEXT DATA
// =============================================
export async function updateprofile(profile, token, dispatch) {
  dispatch(setLoading(true));
  try {
    // 1. Destructure all fields from the profile object passed from the component
    const { 
      firstName, 
      lastName, 
      email, 
      phoneno 
    } = profile;

    // 2. Data Cleaning: Convert "ADD..." placeholders or missing values to null/empty string
    // This ensures we don't save "ADD ADDRESS" into the database
    const DOB = (profile.DOB === "ADD DOB" || !profile.DOB) ? null : profile.DOB;
    const gender = (profile.gender === "ADD GENDER") ? null : profile.gender;
    const address = (profile.address === "ADD ADDRESS") ? "" : profile.address;
    const bloodgroup = (profile.bloodgroup === "ADD BLOODGROUP") ? null : profile.bloodgroup;
    const emergencyContactName = (profile.emergencyContactName === "ADD NAME") ? "" : profile.emergencyContactName;
    const emergencyContactPhone = (profile.emergencyContactPhone === "ADD CONTACT NUMBER") ? "" : profile.emergencyContactPhone;

    // 3. API Call
    const response = await apiConnector(
      "POST",
      PATIENT_EDITPROFILE_API,
      {
        firstName,
        lastName,
        email, // Added Email
        phoneno,
        DOB,
        gender,
        address,
        bloodgroup,
        emergencyContactName,
        emergencyContactPhone
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    // 4. Handle Success
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Profile Updated Successfully");
    
    // 5. Update Local Storage & Redux
    // We update the user in storage so a refresh keeps the new data
    const userImage = JSON.parse(localStorage.getItem("user"))?.image;
    const updatedUser = { ...response.data.profile, image: userImage }; // Ensure image persists if backend didn't return it
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE PROFILE API ERROR............", error);
    toast.error(error?.response?.data?.message || "Profile update failed");
  }
  dispatch(setLoading(false));
}

// =============================================
// UPDATE PROFILE PICTURE
// =============================================
export async function UpdatePfp(token, pfpFile, accountType, dispatch) {
  const toastId = toast.loading("Uploading...");
  try {
    const formData = new FormData();
    formData.append('pfp', pfpFile);

    const response = await apiConnector(
      "POST", 
      PATIENT_UPDATEDISPLAYPICTURE_API, 
      formData, 
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Profile Picture Updated");
    
    // Update Image URL in Redux/Local Storage
    const imageUrl = response.data.data.image;
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...currentUser, image: imageUrl };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE PFP API ERROR............", error);
    toast.error(error?.response?.data?.message || "Could not update image");
  }
  toast.dismiss(toastId);
}


export const fetchPatientAppointments = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      PATIENT_APPOINTMENTS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    console.error("FETCH_PATIENT_APPT_ERROR", error);
    toast.error("Could not load appointments");
    return [];
  }
};


export const fetchPatientDashboardStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_PATIENT_DASHBOARD_API, // Ensure this URL is defined
      null,
      { Authorization: `Bearer ${token}` }
    );
    console.log(response);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    console.error("FETCH_DASHBOARD_ERROR", error);
    toast.error("Could not load dashboard");
    return null;
  }
};