import { apiConnector } from "../apiConnector";
import { toast } from "react-hot-toast";
import { MedicalRecordEndpoints } from "../api"; 

const { GET_REPORT_BY_ID_API, CREATE_VISIT_REPORT_API, UPDATE_VISIT_REPORT_API } = MedicalRecordEndpoints;

export const createVisitReport = async (token, data) => {
  const toastId = toast.loading("Saving Report...");
  try {
    const response = await apiConnector("POST", CREATE_VISIT_REPORT_API, data, { Authorization: `Bearer ${token}` });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Report Saved");
    return response.data.data;
  } catch (error) {
    console.error("CREATE_REPORT_ERROR", error);
    toast.error(error.message || "Failed to save");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const updateVisitReport = async (token, data) => {
  const toastId = toast.loading("Updating Report...");
  try {
    const response = await apiConnector("PUT", UPDATE_VISIT_REPORT_API, data, { Authorization: `Bearer ${token}` });
    if (!response.data.success) throw new Error(response.data.message);
    toast.success("Report Updated");
    return response.data.data;
  } catch (error) {
    console.error("UPDATE_REPORT_ERROR", error);
    toast.error("Failed to update");
    throw error;
  } finally {
    toast.dismiss(toastId);
  }
};

export const fetchVisitReport = async (token, appointmentId) => {
  try {
    const response = await apiConnector("GET", GET_REPORT_BY_ID_API(appointmentId), null, { Authorization: `Bearer ${token}` });
    if (!response.data.success) throw new Error(response.data.message);
    return response.data.data;
  } catch (error) {
    if (error.response?.status !== 404) toast.error("Could not load report");
    return null;
  }
};