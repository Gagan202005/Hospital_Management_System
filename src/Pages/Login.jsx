import { login } from "../services/operations/authApi"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom";
import { Button } from "../Components/Common/Button";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card";
import { Eye, EyeOff, Heart, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setaccount] = useState("Patient");

  const handleonSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(login(email, password, accountType, navigate));
      setEmail("");
      setaccount("Patient");
      setPassword("");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Helper to fill demo data
  const fillDemoCredentials = (type) => {
    setEmail("gagansinghal2005@gmail.com");
    setPassword("Gagan123_-");
    setaccount(type);
    toast.success(`${type} demo credentials filled!`);
  };

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
          
          {/* UPDATED: Modern Segmented Control for Account Type */}
          <div className="px-6 mb-6">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {["Patient", "Doctor", "Admin"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setaccount(type)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    accountType === type
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <CardContent>
            {/* DEMO CREDENTIALS SECTION */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <KeyRound className="w-3 h-3" /> Quick Demo Login
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                  onClick={() => fillDemoCredentials("Patient")}
                >
                  Patient
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 bg-white border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                  onClick={() => fillDemoCredentials("Doctor")}
                >
                  Doctor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                  onClick={() => fillDemoCredentials("Admin")}
                >
                  Admin
                </Button>
              </div>
            </div>

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