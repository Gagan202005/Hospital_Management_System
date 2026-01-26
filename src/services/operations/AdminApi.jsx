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
    
    // Update Storage & Redux
    const updatedUser = response.data.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));

    dispatch(setLoading(false));
    return response.data;

  } catch (error) {
    dispatch(setLoading(false));
    console.log("UPDATE_ADMIN_PROFILE_API ERROR:", error);
    throw error; // Throwing error so component can handle the toast
  }
}

// --- 3. UPDATE ADMIN PFP ---
export async function updateAdminPfp(token, pfp, dispatch) {
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
    
    const imageUrl = response.data.data.image; 
    const user = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...user, image: imageUrl };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch(setUser(updatedUser));
    
    return response.data;

  } catch (error) {
    console.log("UPDATE_ADMIN_PFP_API ERROR:", error);
    throw error;
  }
}


export const Add_Admin = async (data, token) => {
    try {
        const response = await apiConnector("POST", ADD_ADMIN_API, data, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        return response.data;

    } catch (error) {
        console.log("ADD_ADMIN_API ERROR:", error);
        throw error;
    }
};

// =================================================================
// 1. ADD DOCTOR
// =================================================================
export const Add_Doctor = async (data, token) => {
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
        throw error; 
    }
};

// =================================================================
// 2. DELETE DOCTOR
// =================================================================
export const Delete_Doctor = async (id, token) => {
    try {
        const response = await apiConnector("DELETE", DELETE_DOCTOR_API, { id }, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    } catch (error) {
        console.log("DELETE_DOCTOR_API ERROR:", error);
        throw error;
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
    throw error;
  }
};

// =================================================================
// 1. GET ALL USERS (Common Function)
// =================================================================
export const getAllUsers = async (token, type) => {
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

    return response.data.data;

  } catch (error) {
    console.log(`GET ALL ${type.toUpperCase()} ERROR:`, error);
    throw error;
  }
};

// =================================================================
// 2. ADD PATIENT
// =================================================================
export const Add_Patient = async (data, token) => {
  try {
    const response = await apiConnector("POST", ADD_PATIENT_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data;

  } catch (error) {
    console.log("ADD PATIENT ERROR:", error);
    throw error;
  }
};

// =================================================================
// 3. UPDATE PATIENT
// =================================================================
export const Update_Patient = async (data, token) => {
  try {
    const response = await apiConnector("PUT", UPDATE_PATIENT_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data;

  } catch (error) {
    console.log("UPDATE PATIENT ERROR:", error);
    throw error;
  }
};

// =================================================================
// 4. DELETE PATIENT
// =================================================================
export const Delete_Patient = async (patientId, token) => {
  try {
    const response = await apiConnector("DELETE", DELETE_PATIENT_API, { _id: patientId }, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data;

  } catch (error) {
    console.log("DELETE PATIENT ERROR:", error);
    throw error;
  }
};

export const Update_Doctor = async (data, token) => {
    try {
        const response = await apiConnector("PUT", UPDATE_DOCTOR_API, data, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;

    } catch (error) {
        console.log("UPDATE_DOCTOR_API ERROR:", error);
        throw error;
    }
};

export const Add_Ambulance = async (data, token) => {
    try {
        const response = await apiConnector("POST", ADD_AMBULANCE_API, data, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data;
    } catch (error) {
        console.log("ADD AMBULANCE ERROR:", error);
        throw error;
    }
};

export const Update_Ambulance = async (data, token) => {
    try {
        const response = await apiConnector("PUT", UPDATE_AMBULANCE_API, data, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data;
    } catch (error) {
        console.log("UPDATE AMBULANCE ERROR:", error);
        throw error;
    }
};

export const Delete_Ambulance = async (id, token) => {
    try {
        const response = await apiConnector("DELETE", DELETE_AMBULANCE_API, { id }, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data;
    } catch (error) {
        console.log("DELETE AMBULANCE ERROR:", error);
        throw error;
    }
};

export const GetAll_Ambulances = async (token) => {
    try {
        const response = await apiConnector("GET", GET_ALL_AMBULANCES_API, null, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data.data;
    } catch (error) {
        console.log("GET ALL AMBULANCES ERROR:", error);
        throw error;
    }
};

export const Book_Ambulance = async (data, token) => {
    try {
        const response = await apiConnector("POST", BOOK_AMBULANCE_API, data, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data; 
    } catch (error) {
        console.log("BOOK AMBULANCE ERROR:", error);
        throw error;
    }
};

export const Complete_Trip = async (ambulanceId, token) => {
    try {
        const response = await apiConnector("PUT", COMPLETE_TRIP_API, { ambulanceId }, {
            Authorization: `Bearer ${token}`,
        });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data;
    } catch (error) {
        console.log("COMPLETE TRIP ERROR:", error);
        throw error;
    }
};

// --- CRUD ---
export const Add_Bed = async (data, token) => {
    try {
        const response = await apiConnector("POST", ADD_BED_API, data, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data;
    } catch (error) {
        console.log("ADD BED ERROR:", error);
        throw error;
    }
};

export const Update_Bed = async (data, token) => {
    try {
        const response = await apiConnector("PUT", UPDATE_BED_API, data, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data;
    } catch (error) {
        console.log("UPDATE BED ERROR:", error);
        throw error;
    }
};

export const Delete_Bed = async (id, token) => {
    try {
        const response = await apiConnector("DELETE", DELETE_BED_API, { id }, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data;
    } catch (error) {
        console.log("DELETE BED ERROR:", error);
        throw error;
    }
};

export const GetAll_Beds = async (token) => {
    try {
        const response = await apiConnector("GET", GET_ALL_BEDS_API, null, { Authorization: `Bearer ${token}` });
        return response.data.data;
    } catch (error) {
        console.error("GET BEDS ERROR", error);
        throw error;
    }
};

// --- OPERATIONS ---
export const Allocate_Bed = async (data, token) => {
    try {
        const response = await apiConnector("POST", ALLOCATE_BED_API, data, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data; 
    } catch (error) {
        console.log("ALLOCATE BED ERROR:", error);
        throw error;
    }
};

export const Discharge_Bed = async (bedId, token) => {
    try {
        const response = await apiConnector("PUT", DISCHARGE_BED_API, { bedId }, { Authorization: `Bearer ${token}` });
        if (!response.data.success) throw new Error(response.data.message);
        return response.data;
    } catch (error) {
        console.log("DISCHARGE BED ERROR:", error);
        throw error;
    }
};


export const fixAppointment = async (data, token) => {
    try {
        const response = await apiConnector("POST", FIX_APPOINTMENT_API, data, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) throw new Error(response.data.message);
        
        return response.data; 

    } catch (error) {
        console.error("BOOKING ERROR:", error);
        throw error;
    }
};