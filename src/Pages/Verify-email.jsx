import { useState } from "react"
import OTPInput from "react-otp-input"
import { Signup } from "../services/operations/authApi";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
const Verify_email = () =>{
    const [otp,setOtp] = useState("");
    const navigate = useNavigate();
    const dispatch=useDispatch();
    const {loading,signupData}= useSelector((state)=>state.auth);
    useEffect(() => {

        if(!signupData){
            navigate('/signup');
        }},[])

        
    const handleonSubmit = (e) =>{
        e.preventDefault();
        const{
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                phone,
            } = signupData;

        dispatch(Signup(
                firstName,
                lastName,
                email,
                password,
                confirmPassword,otp,phone,navigate));
        setOtp("");

    }
    return(
        <div className="w-full h-[100vh] items-center flex flex-col justify-center bg-[#f7f7ff] overflow-hidden">
            <form onSubmit={handleonSubmit} className="w-fit h-fit items-center flex flex-col justify-center gap-5 bg-white p-11 rounded-xl shadow-2xl">
            <p className="text-3xl text-gray-700 font-semibold">Verify Email</p>
            <p className="text-gray-500">A verification code has been sent to you. Enter the code below</p>
            <OTPInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span>-</span>}
                    inputStyle="w-[20px] rounded-[8px] border-[1px] border-blue-300 text-[3rem] text-center"
                    isInputNum={true}
                    shouldAutoFocus={true}
                    containerStyle="flex justify-between gap-4"
                    renderInput={(props) => <input {...props} />}
                    
                    />
                    <button type="submit" className="text-2xl text-white w-[100%] p-2 bg-blue-400 rounded-lg">Verify</button>
        </form>
        </div>
        
    )
}

export default Verify_email