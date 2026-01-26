import { apiConnector } from "../apiConnector";
import { Doctorendpoints } from "../api";
import { setUser } from "../../Slices/profileslice"; 

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
    
    return response.data;

  } catch (error) {
    console.log("FETCH_SLOTS_ERROR:", error);
    throw error;
  }
};

// --- CREATE SLOT ---
export const createTimeSlot = async (date, startTime, endTime, token) => {
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

    return response.data;

  } catch (error) {
    console.log("CREATE_SLOT_ERROR:", error);
    throw error;
  }
};

// --- DELETE SLOT ---
export const deleteTimeSlot = async (slotId, token) => {
  try {
    const response = await apiConnector(
      "DELETE", DELETE_TIME_SLOT_API,
      {slotId},
      { Authorization: `Bearer ${token}`}
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to delete slot");
    }

    return true;
  } catch (error) {
    console.log("DELETE_SLOT_ERROR:", error);
    throw error;
  }
};

// --- UPDATE PROFILE ---
export async function updateDoctorProfile(data, token, dispatch) {
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

    // Update Redux State 
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...currentUser, ...response.data.data };
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));
    
    return response.data;

  } catch (error) {
    console.log("UPDATE_DOCTOR_PROFILE API ERROR............", error);
    throw error;
  }
}

// --- UPDATE PROFILE PICTURE ---
export async function updateDoctorPfp(token, pfp, dispatch) {
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

    const imageUrl = response.data.data.image; 
    const user = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...user, image: imageUrl };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));
    
    return response.data;

  } catch (error) {
    console.log("UPDATE_PFP_API ERROR:", error);
    throw error;
  }
}

export const fetchPublicDoctors = async (searchQuery = "", specialty = "") => {
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

    return response.data.data;
  } catch (error) {
    console.log("FETCH_PUBLIC_DOCTORS_ERROR:", error);
    throw error;
  }
};

export const fetchDoctorDetails = async (doctorId) => {
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

    return response.data.data;
  } catch (error) {
    console.log("FETCH_DOCTOR_DETAILS_ERROR:", error);
    throw error;
  }
};

export const fetchDoctorPatients = async (token) => {
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

    return response.data.data;
  } catch (error) {
    console.log("FETCH_PATIENTS_ERROR:", error);
    throw error;
  }
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
    throw error;
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
    throw error; 
  }
};

// --- BOOK APPOINTMENT ---
export const bookAppointmentApi = async (data, token, navigate) => {
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

    navigate("/patient-dashboard/appointments"); 
    return response.data;
    
  } catch (error) {
    console.log("BOOK_APPOINTMENT_ERROR:", error);
    throw error;
  }
};

// --- FETCH SLOTS BY DATE ---
export const fetchTimeSlotsbyDate = async (doctorId, date) => {
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
    return response.data.data;
  } catch (error) {
    console.log("FETCH_SLOTS_ERROR:", error);
    throw error;
  }
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
    throw error;
  }
};