import { toast } from "react-hot-toast"
import { setLoading, setToken } from "../../Slices/authslice"
import { setUser } from "../../Slices/profileslice"
import { profendpoints } from "../api"
import {apiConnector} from "../apiConnector"
import {setProgress} from "../../Slices/loadingbarslice"

const {
  PATIENT_EDITPROFILE_API,
  PATIENT_UPDATEDISPLAYPICTURE_API,
} = profendpoints

export async function updateprofile(profile,token,dispatch){
        try{
            const {firstName,lastName,phoneno}=profile;
            let DOB = (((profile.DOB === "ADD DOB") || (profile.DOB === "N/A") || !profile.DOB ) ? null : profile.DOB) ;
            let gender = (profile.gender === "ADD GENDER" ? null : profile.gender) ;
            let address = (profile.address === "ADD ADDRESS" ? "" : profile.address) ;
            let bloodgroup = (profile.bloodgroup === "ADD BLOODGROUP" ? null : profile.bloodgroup) ;
            let emergencyContactName = (profile.emergencyContactName === "ADD NAME" ? "" : profile.emergencyContactName) ;
            let emergencyContactPhone = (profile.emergencyContactPhone === "ADD CONTACT NUMBER" ? "" : profile.emergencyContactPhone) ;


            dispatch(setLoading(true));
            const response = await apiConnector("POST",PATIENT_EDITPROFILE_API,{firstName,lastName,DOB,gender,phoneno,address,bloodgroup,emergencyContactName,emergencyContactPhone},{
                Authorization: `Bearer ${token}`,
            });
            dispatch(setProgress(100));

            if(response.data.success){
                toast.success("Profile Updated Successfully");
                console.log(response);
                localStorage.setItem("user",JSON.stringify(response.data.profile));
                dispatch(setUser(response.data.profile));
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch(error){
            console.log("editprofile API ERROR............", error)
            toast.error(error?.response?.data?.message || "Profile update failed");
            dispatch(setProgress(100));
        }
        dispatch(setLoading(false))
}

//updateProfilePicture
export async function UpdatePfp(token,pfp,accountType,dispatch){
  const toastId = toast.loading("Uploading...");
  try {
    const formData = new FormData();
    console.log("pfp",pfp)
    formData.append('pfp',pfp);
    const response = await apiConnector("POST", PATIENT_UPDATEDISPLAYPICTURE_API, formData, {
      Authorization: `Bearer ${token}`
    });
    console.log("UPDATE_DISPLAY_PICTURE_API API RESPONSE............", response)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Profile Picture Updated Successfully");
    const imageUrl = response.data.data.image;
    localStorage.setItem("user",JSON.stringify({...JSON.parse(localStorage.getItem("user")),image:imageUrl}));
    dispatch(setUser({...JSON.parse(localStorage.getItem("user")),image:imageUrl}));
    console.log(JSON.parse(localStorage.getItem("user")).image);
  } catch (error) {
    console.log("UPDATE_DISPLAY_PICTURE_API API ERROR............", error)
    toast.error(error?.response?.data?.message || "Profile picture update failed");
  }
  toast.dismiss(toastId);
}
