import { apiConnector } from "../apiConnector";
import { toast } from "../../hooks/use-toast";
import { Doctorendpoints } from "../api";
import { setLoading, setUser } from "../../Slices/profileslice"; // Adjust path to your slice
const {
  UPDATE_DOCTOR_PROFILE_API, 
  UPDATE_DOCTOR_IMAGE_API, // Ensure this exists in your API endpoints
  GET_PUBLIC_DOCTORS_API,GET_DOCTOR_DETAILS_API,GET_DOCTOR_PATIENTS_API,
  GET_DOCTOR_APPOINTMENTS_API, 
  UPDATE_APPOINTMENT_STATUS_API, 
  BOOK_APPOINTMENT_API,
  ADD_TIME_SLOT_API, DELETE_TIME_SLOT_API,GET_DOCTOR_SLOTS_API,FETCH_TIME_SLOTS_API
} = Doctorendpoints;



// --- FETCH SLOTS ---
export const fetchTimeSlots = async (token) => {
  let result = [];
  try {
    const response = await apiConnector(
      "GET", 
      FETCH_TIME_SLOTS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch slots");
    }
    
    result = response.data;

  } catch (error) {
    console.log("FETCH_SLOTS_ERROR:", error);
    toast({
      title: "Error",
      description: "Could not load time slots.",
      variant: "destructive",
    });
  }
  return result;
};

// --- CREATE SLOT (FIXED DATE ISSUE) ---
export const createTimeSlot = async (date, startTime, endTime, token) => {
  let result = null;
  
  try {
    // FIX: Manually construct YYYY-MM-DD from local time
    // This avoids the 'toISOString' timezone shift that causes the date to go back by 1 day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // e.g., "2024-01-25"

    const payload = {
      date: formattedDate, // Send "2024-01-25" instead of ISO string
      startTime,
      endTime,
      isBooked: false
    };

    const response = await apiConnector(
      "POST", 
      ADD_TIME_SLOT_API, 
      payload,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to create slot");
    }

    result = response.data;
    toast({
      title: "Success",
      description: "Time slot added successfully.",
    });

  } catch (error) {
    console.log("CREATE_SLOT_ERROR:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to add slot.",
      variant: "destructive",
    });
  }
  return result;
};

// --- DELETE SLOT ---
export const deleteTimeSlot = async (slotId, token) => {
  let success = false;
  try {
    const response = await apiConnector(
      "DELETE", DELETE_TIME_SLOT_API,
      {slotId},
      { Authorization: `Bearer ${token}`}
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to delete slot");
    }

    success = true;
    toast({
      title: "Deleted",
      description: "Time slot removed.",
    });
  } catch (error) {
    console.log("DELETE_SLOT_ERROR:", error);
    toast({
      title: "Error",
      description: error.response?.data?.message || "Could not delete time slot.",
      variant: "destructive",
    });
  }
  return success;
};

// --- UPDATE PROFILE ---
export async function updateDoctorProfile(profile, token, dispatch, toast) {
  
  dispatch(setLoading(true));
  
  try {
    // Sanitize Data to match Schema
    const payload = {
      ...profile,
      phoneno: profile.phoneno, 
      qualification: profile.qualification
    };

    const response = await apiConnector(
      "PUT", 
      UPDATE_DOCTOR_PROFILE_API,
      payload,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // SUCCESS TOAST (Shadcn Syntax)
    toast({
      title: "Success",
      description: "Profile updated successfully.",
      variant: "default",
    });
    
    // Update Storage & Redux
    const updatedUser = response.data.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE_PROFILE_API ERROR:", error);
    
    // ERROR TOAST (Shadcn Syntax)
    toast({
      title: "Update Failed",
      description: error?.response?.data?.message || "Could not update profile.",
      variant: "destructive",
    });
  }
  
  dispatch(setLoading(false));
}

// --- UPDATE PROFILE PICTURE ---
export async function updateDoctorPfp(token, pfp, dispatch, toast) {
  try {
    const formData = new FormData();
    formData.append('pfp', pfp);

    const response = await apiConnector(
      "PUT", 
      UPDATE_DOCTOR_IMAGE_API, 
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
    console.log("UPDATE_PFP_API ERROR:", error);
    toast({
      title: "Upload Failed",
      description: error?.response?.data?.message || "Could not upload image.",
      variant: "destructive",
    });
  }
}


export const fetchPublicDoctors = async (searchQuery = "", specialty = "") => {
  let result = [];
  try {
    // Construct Query Params
    const params = {};
    if (searchQuery) params.searchQuery = searchQuery;
    if (specialty) params.specialty = specialty;

    const response = await apiConnector(
      "GET",
      GET_PUBLIC_DOCTORS_API,
      null,
      null, // No headers needed for public route usually
      params // Pass params to axios
    );
    console.log(response);
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch doctors");
    }

    result = response.data.data;
  } catch (error) {
    console.log("FETCH_PUBLIC_DOCTORS_ERROR:", error);
    // Don't toast error on search typing, just log it
  }
  return result;
};


export const fetchDoctorDetails = async (doctorId) => {
  let result = null;
  try {
    // Construct the URL with the ID
    const response = await apiConnector(
      "GET",
      `${GET_DOCTOR_DETAILS_API}/${doctorId}`,
      null,
      null
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch doctor details");
    }

    result = response.data.data;
  } catch (error) {
    console.log("FETCH_DOCTOR_DETAILS_ERROR:", error);
    // Optional: toast.error("Failed to load doctor details");
  }
  return result;
};

export const fetchDoctorPatients = async (token) => {
  let result = [];
  try {
    const response = await apiConnector(
      "GET",
      GET_DOCTOR_PATIENTS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message);
    }

    result = response.data.data;
  } catch (error) {
    console.log("FETCH_PATIENTS_ERROR:", error);
  }
  return result;
};


// --- 1. Fetch Appointments ---
export const fetchDoctorAppointments = async (token) => {
  try {
    const response = await apiConnector(
      "GET", 
      GET_DOCTOR_APPOINTMENTS_API, 
      null, 
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    console.error("FETCH_APPOINTMENTS_ERROR", error);
    return [];
  }
};

// --- 2. Update Status (Cancel/Confirm) ---
export const updateAppointmentStatus = async (token, data) => {
  try {
    const response = await apiConnector(
      "POST", 
      UPDATE_APPOINTMENT_STATUS_API, 
      data, 
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    console.error("UPDATE_STATUS_ERROR", error);
    toast.error("Failed to update status");
    throw error; 
  }
};


export const bookAppointmentApi = async (data,token,navigate) => {
  try {
    const response = await apiConnector("POST", BOOK_APPOINTMENT_API, data,{Authorization: `Bearer ${token}`});

    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }

    toast({
      title: "Success!",
      description: "Appointment booked successfully.",
    });
    
    navigate("/"); 
  } catch (error) {
    console.log("BOOK_APPOINTMENT_ERROR:", error);
    toast({
      title: "Booking Failed",
      description: error.response?.data?.message || "Could not book appointment",
      variant: "destructive"
    });
  }
};

export const fetchTimeSlotsbyDate = async (doctorId, date) => {
  let result = [];
  try {
    // Call: /appointment/slots/:doctorId?date=YYYY-MM-DD
    const response = await apiConnector(
      "GET", 
      `${GET_DOCTOR_SLOTS_API}/${doctorId}`, 
      null, 
      null, 
      { date } 
    );
    
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.log("FETCH_SLOTS_ERROR:", error);
    // Silent fail or toast depending on preference
  }
  return result;
};
