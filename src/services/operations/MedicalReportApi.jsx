import { apiConnector } from "../apiConnector";
import { toast } from "react-hot-toast"; // or your preferred toast library
import { MedicalRecordEndpoints } from "../api"; // Ensure this imports the URLs provided earlier

const { GET_REPORT_BY_ID_API,CREATE_VISIT_REPORT_API } = MedicalRecordEndpoints;



// --- 3. Create Visit Report (Mark Complete) ---
export const createVisitReport = async (token, data) => {
  const toastId = toast.loading("Saving Report...");
  try {
    const response = await apiConnector(
      "POST", 
      CREATE_VISIT_REPORT_API, 
      data, 
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Visit Completed & Report Saved");
    return response.data.data;

  } catch (error) {
    console.error("CREATE_REPORT_ERROR", error);
    toast.error(error.message || "Failed to save report");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};


export const fetchVisitReport = async (token,appointmentId) => {
  // Optional: show a loading toast if this is a standalone action
  // const toastId = toast.loading("Loading Report...");
  
  try {
    const response = await apiConnector(
      "GET", 
      GET_REPORT_BY_ID_API(appointmentId), 
      null, 
      { Authorization: `Bearer ${token}` }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // Optional: toast.dismiss(toastId);
    return response.data.data;

  } catch (error) {
    console.error("FETCH_REPORT_ERROR", error);
    // Only show error toast if it's NOT a 404 (Report not created yet is a valid state)
    if (error.response?.status !== 404) {
        toast.error("Could not load report");
    }
    return null;
  }
};