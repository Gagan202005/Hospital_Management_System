import { apiConnector } from "../apiConnector";
import { toast } from "react-hot-toast";
import { Doctorendpoints } from "../api";
import { setUser } from "../../Slices/profileslice"; // Adjust path to your slice

const {
  UPDATE_DOCTOR_PROFILE_API, 
  UPDATE_DOCTOR_IMAGE_API, 
  GET_PUBLIC_DOCTORS_API,
  GET_DOCTOR_DETAILS_API,
  GET_DOCTOR_PATIENTS_API,
  GET_DOCTOR_APPOINTMENTS_API, 
  UPDATE_APPOINTMENT_STATUS_API, 
  BOOK_APPOINTMENT_API,
  ADD_TIME_SLOT_API, 
  DELETE_TIME_SLOT_API,
  GET_DOCTOR_SLOTS_API,
  FETCH_TIME_SLOTS_API,
  GET_DASHBOARD_STATS_API
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
    toast.error("Could not load time slots.");
  }
  return result;
};

// --- CREATE SLOT ---
export const createTimeSlot = async (date, startTime, endTime, token) => {
  let result = null;
  
  try {
    // FIX: Manually construct YYYY-MM-DD from local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; 

    const payload = {
      date: formattedDate, 
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
    toast.success("Time slot added successfully.");

  } catch (error) {
    console.log("CREATE_SLOT_ERROR:", error);
    toast.error(error.response?.data?.message || "Failed to add slot.");
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
    toast.success("Time slot removed.");
  } catch (error) {
    console.log("DELETE_SLOT_ERROR:", error);
    toast.error(error.response?.data?.message || "Could not delete time slot.");
  }
  return success;
};

// --- UPDATE PROFILE ---
export async function updateDoctorProfile(data, token, dispatch) {
  const toastId = toast.loading("Updating Profile...");
  try {
    const response = await apiConnector(
      "PUT",
      UPDATE_DOCTOR_PROFILE_API,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneno: data.phoneno,
        address: data.address,
        dob: data.dob,
        age: data.age,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        department: data.department,
        specialization: data.specialization,
        qualification: data.qualification,
        experience: data.experience,
        consultationFee: data.consultationFee,
        about: data.about,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Profile Updated Successfully");

    // Update Redux State 
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...currentUser, ...response.data.data };
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE_DOCTOR_PROFILE API ERROR............", error);
    toast.error(error?.response?.data?.message || "Could not update profile");
  }
  toast.dismiss(toastId);
}

// --- UPDATE PROFILE PICTURE ---
export async function updateDoctorPfp(token, pfp, dispatch) {
  // Removed 'toast' from params as we import it directly
  const toastId = toast.loading("Uploading image...");
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

    toast.success("Profile picture updated.");
    
    const imageUrl = response.data.data.image; 
    const user = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...user, image: imageUrl };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

  } catch (error) {
    console.log("UPDATE_PFP_API ERROR:", error);
    toast.error(error?.response?.data?.message || "Could not upload image.");
  } finally {
    toast.dismiss(toastId);
  }
}

export const fetchPublicDoctors = async (searchQuery = "", specialty = "") => {
  let result = [];
  try {
    const params = {};
    if (searchQuery) params.searchQuery = searchQuery;
    if (specialty) params.specialty = specialty;

    const response = await apiConnector(
      "GET",
      GET_PUBLIC_DOCTORS_API,
      null,
      null,
      params 
    );
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch doctors");
    }

    result = response.data.data;
  } catch (error) {
    console.log("FETCH_PUBLIC_DOCTORS_ERROR:", error);
  }
  return result;
};

export const fetchDoctorDetails = async (doctorId) => {
  let result = null;
  try {
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

// --- FETCH APPOINTMENTS ---
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

// --- UPDATE STATUS ---
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

// --- BOOK APPOINTMENT ---
export const bookAppointmentApi = async (data, token, navigate) => {
  const toastId = toast.loading("Processing request...");
  try {
    const response = await apiConnector(
      "POST", 
      BOOK_APPOINTMENT_API, 
      data,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }

    toast.success("Request Sent! Check your email.");
    navigate("/patient-dashboard/appointments"); 
    
  } catch (error) {
    console.log("BOOK_APPOINTMENT_ERROR:", error);
    toast.error(error.response?.data?.message || "Could not book appointment");
  } finally {
    toast.dismiss(toastId);
  }
};

// --- FETCH SLOTS BY DATE ---
export const fetchTimeSlotsbyDate = async (doctorId, date) => {
  let result = [];
  try {
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
  }
  return result;
};

// --- DASHBOARD STATS ---
export const fetchDashboardStats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_DASHBOARD_STATS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error) {
    console.error("FETCH_STATS_ERROR", error);
    toast.error("Could not load dashboard data");
    return null;
  }
};