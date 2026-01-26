import { setLoading } from "../../Slices/authslice"
import { setUser } from "../../Slices/profileslice"
import { profendpoints } from "../api"
import { apiConnector } from "../apiConnector"

const {
  PATIENT_EDITPROFILE_API,
  PATIENT_UPDATEDISPLAYPICTURE_API,
  PATIENT_APPOINTMENTS_API,
  GET_PATIENT_DASHBOARD_API
} = profendpoints

// =============================================
// UPDATE PROFILE TEXT DATA
// =============================================
export async function updateprofile(profile, token, dispatch) {
  dispatch(setLoading(true));
  try {
    // 1. Destructure fields
    const { 
      firstName, 
      lastName, 
      email, 
      phoneno 
    } = profile;

    // 2. Data Cleaning
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
        email, 
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

    // 5. Update Local Storage & Redux
    const userImage = JSON.parse(localStorage.getItem("user"))?.image;
    // Ensure image persists if backend didn't return it
    const updatedUser = { ...response.data.profile, image: userImage }; 
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE PROFILE API ERROR............", error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
}

// =============================================
// UPDATE PROFILE PICTURE
// =============================================
export async function UpdatePfp(token, pfpFile, accountType, dispatch) {
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

    // Update Image URL in Redux/Local Storage
    const imageUrl = response.data.data.image;
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...currentUser, image: imageUrl };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE PFP API ERROR............", error);
    throw error;
  }
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
    throw error;
  }
};


export const fetchPatientDashboardStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_PATIENT_DASHBOARD_API, 
      null,
      { Authorization: `Bearer ${token}` }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    console.error("FETCH_DASHBOARD_ERROR", error);
    throw error;
  }
};