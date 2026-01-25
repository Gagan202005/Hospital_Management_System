import { useState, useEffect } from "react";
import OTPInput from "react-otp-input";
import { Signup, SendOtp } from "../services/operations/authApi"; 
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MailCheck, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../Components/ui/button";

const Verify_email = () => {
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(60); 
    const [canResend, setCanResend] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, signupData } = useSelector((state) => state.auth);

    // 1. Protection: Redirect if no signup data
    useEffect(() => {
        if (!signupData) {
            navigate('/signup');
        }
    }, [signupData, navigate]);

    // 2. Timer Logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleonSubmit = (e) => {
        e.preventDefault();
        const { firstName, lastName, email, password, confirmPassword, phone } = signupData;
        
        dispatch(Signup(
            firstName, lastName, email, password, confirmPassword, otp, phone, navigate
        ));
    };

    const handleResend = () => {
        if (signupData?.email) {
            dispatch(SendOtp(signupData.email, navigate));
            setTimer(60); 
            setCanResend(false);
            setOtp(""); 
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
            
            {/* Vibrant Background Blurs */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-lg p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 z-10 mx-4">
                
                {/* Icon Header */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                        <MailCheck className="w-10 h-10 text-white" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Verify Your Email</h1>
                    <p className="text-slate-500 text-base leading-relaxed">
                        Please enter the 6-digit code sent to <br/>
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {signupData?.email || "your email"}
                        </span>
                    </p>
                </div>

                <form onSubmit={handleonSubmit} className="flex flex-col gap-8">
                    
                    {/* OTP Input */}
                    <div className="flex justify-center w-full">
                        <OTPInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            renderSeparator={<span className="w-2 md:w-4"></span>}
                            renderInput={(props) => (
                                <input
                                    {...props}
                                    placeholder=""
                                    className="!w-10 !h-12 sm:!w-12 sm:!h-14 border-2 border-slate-200 rounded-xl text-2xl text-center font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all bg-white shadow-sm hover:border-indigo-300"
                                />
                            )}
                        />
                    </div>

                    {/* Vibrant Gradient Button */}
                    <Button 
                        type="submit" 
                        disabled={loading || otp.length < 6}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Verify & Continue"}
                    </Button>
                </form>

                {/* Footer / Resend */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Didn't receive code?</span>
                        
                        {canResend ? (
                            <button 
                                onClick={handleResend}
                                className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" /> Resend Code
                            </button>
                        ) : (
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                                Resend in <span className="text-indigo-600 font-mono w-6 text-center bg-indigo-50 rounded px-1">{timer}s</span>
                            </span>
                        )}
                    </div>

                    <Link to="/signup" className="flex items-center text-slate-400 hover:text-indigo-600 text-sm font-medium transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
                        Back to Signup
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Verify_email;