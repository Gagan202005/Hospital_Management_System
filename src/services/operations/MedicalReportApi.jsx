import { apiConnector } from "../apiConnector";
import { MedicalRecordEndpoints } from "../api";

const { GET_REPORT_BY_ID_API, CREATE_VISIT_REPORT_API, UPDATE_VISIT_REPORT_API } =
  MedicalRecordEndpoints;

export const createVisitReport = async (token, formData) => {
  try {
    const response = await apiConnector("POST", CREATE_VISIT_REPORT_API, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    });

    if (!response.data.success) throw new Error(response.data.message);

    return response.data.data;
  } catch (error) {
    console.error("CREATE_REPORT_ERROR", error);
    throw error;
  }
};

export const updateVisitReport = async (token, formData) => {
  try {
    const response = await apiConnector("PUT", UPDATE_VISIT_REPORT_API, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    });

    if (!response.data.success) throw new Error(response.data.message);

    return response.data.data;
  } catch (error) {
    console.error("UPDATE_REPORT_ERROR", error);
    throw error;
  }
};

export const fetchVisitReport = async (token, appointmentId) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_REPORT_BY_ID_API(appointmentId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) throw new Error(response.data.message);

    return response.data.data;
  } catch (error) {
    console.error("FETCH_REPORT_ERROR", error);
    // Returning null for 404s (no report found) is usually desired behavior 
    // so the UI knows to show a "Create" form instead of an "Edit" form.
    return null;
  }
};