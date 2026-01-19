
const BASE_URL = process.env.REACT_APP_BASE_URL;


// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
};

export const profendpoints = {
  PATIENT_EDITPROFILE_API : BASE_URL + "/Patient/editprofile",
  PATIENT_UPDATEDISPLAYPICTURE_API : BASE_URL + "/Patient/updateDisplayPicture",
}

export const Adminendpoints = {
  ADD_PATIENT_API : BASE_URL + "/Admin/Add_Patient",
  ALL_USER_API : BASE_URL + "/Admin/getAllUser",
  ADD_AMBULANCE_API : BASE_URL + "/Admin/Add_Ambulance",
  ALL_AMBULANCE_API : BASE_URL + "/Admin/getAllAmbulance",
  GET_ALL_BEDS_API : BASE_URL + "/Admin/getAllBed",
  ADD_BED_API : BASE_URL + "/Admin/Add_Bed",
  ADD_ADMIN_API : BASE_URL + "/Admin/Add_Admin",
  ADD_DOCTOR_API: BASE_URL + "/Admin/Add_Doctor",
  UPDATE_ADMIN_PROFILE_API : BASE_URL + "/Admin/updateProfile",
  UPDATE_ADMIN_IMAGE_API : BASE_URL + "/Admin/updateImage",
}


export const Doctorendpoints = {
  ADD_TIME_SLOT_API : BASE_URL + "/Doctor/add-time-slot",
  FETCH_TIME_SLOTS_API : BASE_URL + "/Doctor/get-time-slots",
  DELETE_TIME_SLOT_API : BASE_URL + "/Doctor/delete-time-slot",
  GET_DOCTOR_PROFILE_API : BASE_URL + "/Doctor/getDoctorDetails",
  UPDATE_DOCTOR_IMAGE_API : BASE_URL + "/Doctor/updateDisplayPicture",
  UPDATE_DOCTOR_PROFILE_API : BASE_URL + "/Doctor/editprofile",
}
