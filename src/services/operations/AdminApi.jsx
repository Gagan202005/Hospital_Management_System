import { toast as hotToast } from "react-hot-toast";
import { setLoading } from "../../Slices/authslice";
import { apiConnector } from "../apiConnector";
import { Adminendpoints } from "../api";
import { setUser } from "../../Slices/profileslice"; 

const {
  ADD_ADMIN_API,
  ADD_DOCTOR_API,
  UPDATE_ADMIN_PROFILE_API,
  UPDATE_ADMIN_IMAGE_API,
  GET_ADMIN_STATS_API,
  UPDATE_PATIENT_API, 
  DELETE_PATIENT_API,
  GET_ALL_USERS_API,
  ADD_PATIENT_API,
  DELETE_DOCTOR_API,
  UPDATE_DOCTOR_API,
  ADD_AMBULANCE_API,       
  GET_ALL_AMBULANCES_API,  
  UPDATE_AMBULANCE_API,
  DELETE_AMBULANCE_API,
  BOOK_AMBULANCE_API,      
  COMPLETE_TRIP_API,
  GET_ALL_BEDS_API,     
  UPDATE_BED_API,       
  DELETE_BED_API,       
  ALLOCATE_BED_API,     
  DISCHARGE_BED_API,     
  ADD_BED_API,   
  FIX_APPOINTMENT_API,
} = Adminendpoints;

// --- 2. UPDATE ADMIN PROFILE ---
export async function updateAdminProfile(profile, token, dispatch) {
  // Removed 'toast' argument, using hotToast directly
  const toastId = hotToast.loading("Updating Profile...");
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

    hotToast.success("Admin profile updated successfully.");
    
    // Update Storage & Redux
    const updatedUser = response.data.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE_ADMIN_PROFILE_API ERROR:", error);
    hotToast.error(error?.response?.data?.message || "Could not update profile.");
  }
  
  dispatch(setLoading(false));
  hotToast.dismiss(toastId);
}

// --- 3. UPDATE ADMIN PFP ---
export async function updateAdminPfp(token, pfp, dispatch) {
  const toastId = hotToast.loading("Uploading image...");
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

    hotToast.success("Profile picture updated.");
    
    const imageUrl = response.data.data.image; 
    const user = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...user, image: imageUrl };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE_ADMIN_PFP_API ERROR:", error);
    hotToast.error(error?.response?.data?.message || "Could not upload image.");
  } finally {
    hotToast.dismiss(toastId);
  }
}


export const Add_Admin = async (data, token) => {
    const toastId = hotToast.loading("Creating Admin...");
    try {
        const response = await apiConnector("POST", ADD_ADMIN_API, data, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        hotToast.success("Admin Added Successfully");
        return response.data;

    } catch (error) {
        console.log("ADD_ADMIN_API ERROR:", error);
        hotToast.error(error.response?.data?.message || "Failed to add admin");
    } finally {
        hotToast.dismiss(toastId);
    }
};

// =================================================================
// 1. ADD DOCTOR
// =================================================================
export const Add_Doctor = async (data, token, dispatch) => {
    const toastId = hotToast.loading("Adding Doctor...");
    try {
        const response = await apiConnector("POST", ADD_DOCTOR_API, data, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        return response.data;

    } catch (error) {
        console.log("ADD_DOCTOR_API ERROR:", error);
        hotToast.error(error?.response?.data?.message || "Failed to add doctor");
        throw error; 
    } finally {
        hotToast.dismiss(toastId);
    }
};

// =================================================================
// 2. DELETE DOCTOR
// =================================================================
export const Delete_Doctor = async (id, token) => {
    const toastId = hotToast.loading("Deleting Doctor...");
    try {
        const response = await apiConnector("DELETE", DELETE_DOCTOR_API, { id }, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        hotToast.success("Doctor Deleted Successfully");
    } catch (error) {
        console.log("DELETE_DOCTOR_API ERROR:", error);
        hotToast.error("Could not delete doctor");
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const fetchAdminStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_ADMIN_STATS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    console.error("FETCH_ADMIN_STATS_ERROR", error);
    hotToast.error("Could not load dashboard data");
    return null;
  }
};

// =================================================================
// 1. GET ALL USERS (Common Function)
// =================================================================
export const getAllUsers = async (token, type) => {
  let result = [];
  try {
    const response = await apiConnector(
      "GET", 
      `${GET_ALL_USERS_API}?type=${type}`, 
      null, 
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    result = response.data.data;

  } catch (error) {
    console.log(`GET ALL ${type.toUpperCase()} ERROR:`, error);
    hotToast.error(`Could not fetch ${type} list`);
  }
  return result;
};

// =================================================================
// 2. ADD PATIENT
// =================================================================
export const Add_Patient = async (data, token) => {
  const toastId = hotToast.loading("Creating Account...");
  let result = null;

  try {
    const response = await apiConnector("POST", ADD_PATIENT_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    result = response.data;

  } catch (error) {
    console.log("ADD PATIENT ERROR:", error);
    hotToast.error(error.response?.data?.message || "Could not add patient");
  }
  
  hotToast.dismiss(toastId);
  return result;
};

// =================================================================
// 3. UPDATE PATIENT
// =================================================================
export const Update_Patient = async (data, token) => {
  const toastId = hotToast.loading("Updating Record...");
  try {
    const response = await apiConnector("PUT", UPDATE_PATIENT_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    hotToast.success("Patient Updated Successfully");

  } catch (error) {
    console.log("UPDATE PATIENT ERROR:", error);
    hotToast.error("Could not update patient");
  }
  hotToast.dismiss(toastId);
};

// =================================================================
// 4. DELETE PATIENT
// =================================================================
export const Delete_Patient = async (patientId, token) => {
  const toastId = hotToast.loading("Deleting Record...");
  try {
    const response = await apiConnector("DELETE", DELETE_PATIENT_API, { _id: patientId }, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    hotToast.success("Patient Deleted Successfully");

  } catch (error) {
    console.log("DELETE PATIENT ERROR:", error);
    hotToast.error("Could not delete patient");
  }
  hotToast.dismiss(toastId);
};

export const Update_Doctor = async (data, token) => {
    const toastId = hotToast.loading("Updating Doctor...");
    try {
        const response = await apiConnector("PUT", UPDATE_DOCTOR_API, data, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        hotToast.success("Doctor Updated Successfully");

    } catch (error) {
        console.log("UPDATE_DOCTOR_API ERROR:", error);
        hotToast.error(error?.response?.data?.message || "Failed to update doctor");
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const Add_Ambulance = async (data, token) => {
    const toastId = hotToast.loading("Adding Ambulance...");
    try {
        const response = await apiConnector("POST", ADD_AMBULANCE_API, data, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success("Ambulance Added Successfully");
    } catch (error) {
        console.log("ADD AMBULANCE ERROR:", error);
        hotToast.error(error.response?.data?.message || "Failed to add");
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const Update_Ambulance = async (data, token) => {
    const toastId = hotToast.loading("Updating Ambulance...");
    try {
        const response = await apiConnector("PUT", UPDATE_AMBULANCE_API, data, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success("Ambulance Updated");
    } catch (error) {
        hotToast.error("Failed to update");
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const Delete_Ambulance = async (id, token) => {
    const toastId = hotToast.loading("Deleting...");
    try {
        const response = await apiConnector("DELETE", DELETE_AMBULANCE_API, { id }, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success("Ambulance Deleted");
    } catch (error) {
        hotToast.error("Failed to delete");
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const GetAll_Ambulances = async (token) => {
    let result = [];
    try {
        const response = await apiConnector("GET", GET_ALL_AMBULANCES_API, null, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        result = response.data.data;
    } catch (error) {
        console.log("GET ALL ERROR:", error);
    }
    return result;
};

export const Book_Ambulance = async (data, token) => {
    const toastId = hotToast.loading("Dispatching...");
    try {
        const response = await apiConnector("POST", BOOK_AMBULANCE_API, data, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success(response.data.message);
        return true; 
    } catch (error) {
        hotToast.error(error.response?.data?.message || "Booking Failed");
        return false;
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const Complete_Trip = async (ambulanceId, token) => {
    const toastId = hotToast.loading("Completing Trip...");
    try {
        const response = await apiConnector("PUT", COMPLETE_TRIP_API, { ambulanceId }, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success("Trip Completed");
    } catch (error) {
        hotToast.error("Failed to complete trip");
    } finally {
        hotToast.dismiss(toastId);
    }
};

// --- CRUD ---
export const Add_Bed = async (data, token) => {
    const toastId = hotToast.loading("Adding Bed...");
    try {
        const response = await apiConnector("POST", ADD_BED_API, data, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success("Bed Added Successfully");
    } catch (error) {
        hotToast.error(error.response?.data?.message || "Failed to add bed");
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const Update_Bed = async (data, token) => {
    const toastId = hotToast.loading("Updating Bed...");
    try {
        const response = await apiConnector("PUT", UPDATE_BED_API, data, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success("Bed Updated");
    } catch (error) {
        hotToast.error("Failed to update");
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const Delete_Bed = async (id, token) => {
    const toastId = hotToast.loading("Deleting...");
    try {
        const response = await apiConnector("DELETE", DELETE_BED_API, { id }, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success("Bed Deleted");
    } catch (error) {
        hotToast.error("Failed to delete");
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const GetAll_Beds = async (token) => {
    try {
        const response = await apiConnector("GET", GET_ALL_BEDS_API, null, { Authorization: `Bearer ${token}` });
        return response.data.data;
    } catch (error) {
        console.error("GET BEDS ERROR", error);
        return [];
    }
};

// --- OPERATIONS ---
export const Allocate_Bed = async (data, token) => {
    const toastId = hotToast.loading("Allocating...");
    try {
        const response = await apiConnector("POST", ALLOCATE_BED_API, data, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success(response.data.message);
        return true; 
    } catch (error) {
        hotToast.error(error.response?.data?.message || "Allocation Failed");
        return false;
    } finally {
        hotToast.dismiss(toastId);
    }
};

export const Discharge_Bed = async (bedId, token) => {
    const toastId = hotToast.loading("Discharging...");
    try {
        const response = await apiConnector("PUT", DISCHARGE_BED_API, { bedId }, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        hotToast.success("Patient Discharged");
        return true;
    } catch (error) {
        hotToast.error("Discharge Failed");
        return false;
    } finally {
        hotToast.dismiss(toastId);
    }
};


export const fixAppointment = async (data, token) => {
    const toastId = hotToast.loading("Scheduling...");
    try {
        const response = await apiConnector("POST", FIX_APPOINTMENT_API, data, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) throw new Error(response.data.message);
        
        hotToast.success("Appointment Scheduled!");
        return response.data; 

    } catch (error) {
        console.error("BOOKING ERROR:", error);
        hotToast.error(error.response?.data?.message || "Booking Failed");
        return null;
    } finally {
        hotToast.dismiss(toastId);
    }
};