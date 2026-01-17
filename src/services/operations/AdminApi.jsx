import { toast } from "react-hot-toast"
import { setLoading} from "../../Slices/authslice"
import {apiConnector} from "../apiConnector"
import {setProgress} from "../../Slices/loadingbarslice"
import { Adminendpoints } from "../api";
const {ADD_PATIENT_API,ALL_USER_API,ADD_AMBULANCE_API,ALL_AMBULANCE_API,GET_ALL_BEDS_API,ADD_BED_API,ADD_ADMIN_API,ADD_DOCTOR_API} = Adminendpoints;

export async function Add_Patient(formData,token,dispatch){
        try{
            const {firstName,lastName,age,gender,email,phone,address,emergencyContact,dob,password,confirmPassword}=formData;
            dispatch(setLoading(true));
            const response = await apiConnector("POST",ADD_PATIENT_API,{firstName,lastName,age,gender,email,phone,address,emergencyContact,dob,password,confirmPassword},{
                Authorization: `Bearer ${token}`,
            });
            dispatch(setProgress(100));

            if(response.data.success){
                toast.success("Patient Registered Successfully");
                console.log(response);
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch(error){
            console.log("Add Patient API ERROR............", error)
            toast.error(error?.response?.data?.message);
            dispatch(setProgress(100));
        }
        dispatch(setLoading(false))
}



export async function GetAll_Users(token, accountType, dispatch) {
    let result = [];
    try {
        dispatch(setLoading(true));
        
        const response = await apiConnector(
            "GET",
            ALL_USER_API,
            null, // 👈 FIX 1: Body must be NULL for GET requests
            {
                Authorization: `Bearer ${token}`,
            },
            { accountType: accountType } // 👈 FIX 2: Params go here (5th argument)
        );

        console.log("API RESPONSE:", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        result = response.data.data; 

    } catch (error) {
        console.log("API ERROR:", error);
        toast.error(error?.response?.data?.message || "Could not fetch users");
    }
    dispatch(setLoading(false));
    return result; 
}

export async function Add_Ambulance(formData, token, dispatch) {
    try {
        const { vehicleNumber, model, year, driverName, driverLicense, driverContact } = formData;
        
        dispatch(setLoading(true));
        
        const response = await apiConnector(
            "POST",
            ADD_AMBULANCE_API,
            { vehicleNumber, model, year, driverName, driverLicense, driverContact },
            {
                Authorization: `Bearer ${token}`,
            }
        );
        
        dispatch(setProgress(100));

        if (response.data.success) {
            // FIX: Use simple string for success toast
            toast.success("Ambulance Added Successfully");
            console.log("ADD_AMBULANCE_API RESPONSE:", response);
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.log("ADD_AMBULANCE_API ERROR............", error);
        // FIX: Ensure error message is a string
        toast.error(error?.response?.data?.message || "Failed to add ambulance");
        dispatch(setProgress(100));
    }
    dispatch(setLoading(false));
}



export async function GetAll_Ambulances(token, dispatch) {
    let result = [];
    try {
        dispatch(setLoading(true));
        
        const response = await apiConnector(
            "GET",
            ALL_AMBULANCE_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            },
        );

        console.log("API RESPONSE:", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        result = response.data.ambulances; 

    } catch (error) {
        console.log("API ERROR:", error);
        toast.error(error?.response?.data?.message || "Could not fetch All Ambulances");
    }
    dispatch(setLoading(false));
    return result; 
}



export async function GetAll_Beds(token, dispatch) {
    let result = [];
    dispatch(setLoading(true));
    try {
        const response = await apiConnector(
            "GET",
            GET_ALL_BEDS_API,
            null,
            { Authorization: `Bearer ${token}` }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        result = response.data.Beds; // Adjust based on backend response
    } catch (error) {
        console.log("GET_ALL_BEDS_API ERROR............", error);
        toast.error("Could not fetch beds");
    }
    dispatch(setLoading(false));
    return result;
}


export async function Add_Bed(formData, token, dispatch) {
    try {
        dispatch(setLoading(true));
        
        // Ensure keys match your backend schema exactly
        const response = await apiConnector(
            "POST",
            ADD_BED_API,
            formData,
            { Authorization: `Bearer ${token}` }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.log("ADD_BED_API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to add bed");
        throw error; // Re-throw to handle loading state in component
    } finally {
        dispatch(setLoading(false));
    }
}



export async function Add_Admin(formData, token, dispatch) {
    try {
        dispatch(setLoading(true));
        
        // 1. Destructure data to ensure clean payload (optional but good practice)
        const { 
            firstName, lastName, email, phoneno, 
            age, gender, dob, address, 
            password, confirmPassword 
        } = formData;

        const response = await apiConnector(
            "POST",
            ADD_ADMIN_API,
            { 
                firstName, lastName, email, phoneno, 
                age, gender, dob, address, 
                password, confirmPassword 
            },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        console.log("ADD_ADMIN_API RESPONSE............", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Admin Registered Successfully");

    } catch (error) {
        console.log("ADD_ADMIN_API ERROR............", error);
        toast.error(error?.response?.data?.message || "Failed to add admin");
    } finally {
        dispatch(setLoading(false));
    }
}



export async function Add_Doctor(formData, token, dispatch) {
    try {
        dispatch(setLoading(true));

        const response = await apiConnector(
            "POST",
            ADD_DOCTOR_API,
            formData,
            { Authorization: `Bearer ${token}` }
        );

        console.log("ADD_DOCTOR_API RESPONSE:", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
    } catch (error) {
        console.log("ADD_DOCTOR_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Failed to add doctor");
        throw error; // Re-throw so component handles the loading state
    } finally {
        dispatch(setLoading(false));
    }
}