import {login} from "../services/operations/authApi"
import { use, useState } from "react"
import banner from "../img/banner.png"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom";
import { Button } from "../Components/Common/Button";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card";
import { Alert, AlertDescription } from "../Components/ui/alert";
import { Eye, EyeOff, Heart, ArrowLeft } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType,setaccount] = useState("Patient");
  const handleonSubmit = (e) =>{
        e.preventDefault();
       
        setIsLoading(true);
        dispatch(login(email,password,accountType,navigate));
        setIsLoading(false);
        setEmail("");
        setaccount("Patient");
        setPassword("");
       
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary-light/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-medical border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary-light">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your MediCare account
            </CardDescription>
          </CardHeader>
            <div className="flex flex-row items-center justify-center w-full text-md font-md font-sans mb-5">
                     <button
                     type="reset"
                     onClick={()=>(setaccount("Patient"))}
                     className={`${accountType === "Patient" ? "border-[1px] border-blue-500 text-blue-500" : " border-[1px] border-gray-300"} rounded-tl-lg rounded-bl-lg border-r-0 px-2 py-[1px]`}
                     >patient
                     </button>
                     <button
                     type="reset"
                      onClick={()=>(setaccount("Doctor"))}
                     className={`${accountType === "Doctor" ? "border-[1px] border-blue-500 text-blue-500" : `${accountType==="Patient" ? "border-l-blue-500 border-[1px] border-gray-300" : "border-r-blue-500 border-[1px] border-gray-300"}`} px-2 py-[1px]`}
                     >Doctor</button>
                     <button
                     type="reset"
                      onClick={()=>(setaccount("Admin"))}
                     className={`${accountType === "Admin" ? "border-[1px] border-blue-500 text-blue-500" : " border-[1px] border-gray-300"} rounded-tr-lg rounded-br-lg border-l-0 px-2 py-[1px]`}
                     >Admin</button>
                 </div>
          <CardContent>
            <form onSubmit={handleonSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                   required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={"pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="text-primary hover:text-primary-soft transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="medical"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:text-primary-soft transition-colors font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;