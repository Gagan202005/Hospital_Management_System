
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
  PATIENT_APPOINTMENTS_API: BASE_URL + "/patient/appointments",
  GET_PATIENT_DASHBOARD_API : BASE_URL + "/patient/dashboard-stats",
}

export const Adminendpoints = {
  ADD_AMBULANCE_API : BASE_URL + "/Admin/add-ambulance",
  GET_ALL_AMBULANCES_API : BASE_URL + "/Admin/get-all-ambulances",
  UPDATE_AMBULANCE_API : BASE_URL + "/Admin/update-ambulance",
  DELETE_AMBULANCE_API : BASE_URL + "/Admin/delete-ambulance",
  BOOK_AMBULANCE_API : BASE_URL + "/Admin/book-ambulance",
  COMPLETE_TRIP_API : BASE_URL + "/Admin/complete-ambulance-trip",
  ADD_ADMIN_API : BASE_URL + "/Admin/add-admin",
  ADD_DOCTOR_API: BASE_URL + "/Admin/add-doctor",
  UPDATE_ADMIN_PROFILE_API : BASE_URL + "/Admin/updateProfile",
  UPDATE_ADMIN_IMAGE_API : BASE_URL + "/Admin/updateImage",
  GET_ADMIN_STATS_API : BASE_URL + "/Admin/dashboard-stats",
  ADD_PATIENT_API: BASE_URL + "/Admin/add-patient",
  UPDATE_PATIENT_API: BASE_URL + "/Admin/update-patient",
  DELETE_PATIENT_API: BASE_URL + "/Admin/delete-patient",
  GET_ALL_USERS_API: BASE_URL + "/Admin/get-all-users",
  DELETE_DOCTOR_API : BASE_URL + "/Admin/delete-doctor",
  UPDATE_DOCTOR_API: BASE_URL + "/Admin/update-doctor",
  ADD_BED_API : BASE_URL + "/Admin/add-bed",
  GET_ALL_BEDS_API : BASE_URL + "/Admin/get-all-beds",
  UPDATE_BED_API : BASE_URL + "/Admin/update-bed",
  DELETE_BED_API : BASE_URL + "/Admin/delete-bed",
  ALLOCATE_BED_API : BASE_URL + "/Admin/allocate-bed",
  DISCHARGE_BED_API : BASE_URL + "/Admin/discharge-bed",
  FIX_APPOINTMENT_API : BASE_URL + "/Admin/fix-appointment",
}


export const Doctorendpoints = {
  ADD_TIME_SLOT_API : BASE_URL + "/Doctor/add-time-slot",
  FETCH_TIME_SLOTS_API : BASE_URL + "/Doctor/get-time-slots",
  DELETE_TIME_SLOT_API : BASE_URL + "/Doctor/delete-time-slot",
  GET_DOCTOR_PROFILE_API : BASE_URL + "/Doctor/getDoctorDetails",
  UPDATE_DOCTOR_IMAGE_API : BASE_URL + "/Doctor/updateDisplayPicture",
  UPDATE_DOCTOR_PROFILE_API : BASE_URL + "/Doctor/editprofile",
  GET_PUBLIC_DOCTORS_API : BASE_URL + "/Doctor/public/search",
  GET_DOCTOR_DETAILS_API : BASE_URL + "/doctor/public/profile",
  GET_DOCTOR_PATIENTS_API : BASE_URL + "/doctor/patients", 
  GET_DOCTOR_APPOINTMENTS_API: BASE_URL + "/doctor/appointments",
  UPDATE_APPOINTMENT_STATUS_API: BASE_URL + "/doctor/update-status",
  GET_DOCTOR_SLOTS_API : BASE_URL + "/doctor/slots",
  BOOK_APPOINTMENT_API : BASE_URL + "/doctor/book",
  GET_DASHBOARD_STATS_API: BASE_URL + "/doctor/dashboard-stats",
}

export const MedicalRecordEndpoints = {
  CREATE_VISIT_REPORT_API: BASE_URL + "/medical-record/create",
  UPDATE_VISIT_REPORT_API: BASE_URL + "/medical-record/update",
  GET_REPORT_BY_ID_API: (appointmentId) => BASE_URL + `/medical-record/get/${appointmentId}`,
}