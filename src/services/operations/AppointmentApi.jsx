import { apiConnector } from "../apiConnector";
import { toast } from "../../hooks/use-toast";
import { AppointmentEndpoints } from "../api"; // Assuming you have endpoints defined

const { GET_DOCTOR_SLOTS_API, BOOK_APPOINTMENT_API } = AppointmentEndpoints;

export const fetchTimeSlots = async (doctorId, date) => {
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