
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
  DOCTOR_UPDATEDISPLAYPICTURE_API : BASE_URL + "/Doctor/updateDisplayPicture",
  ADMIN_UPDATEDISPLAYPICTURE_API : BASE_URL + "/Admin/updateDisplayPicture",
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
}
