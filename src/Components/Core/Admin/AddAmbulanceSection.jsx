import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Truck, Search, Edit, Trash2, Phone, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Add_Ambulance, GetAll_Ambulances } from "../../../services/operations/AdminApi";
import { toast } from "react-hot-toast"; // Using react-hot-toast

export const AddAmbulanceSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    model: "",
    year: "",
    driverName: "",
    driverLicense: "",
    driverContact: "",
  });

  // Ensure initial state is an empty array
  const [ambulances, setAmbulances] = useState([]);

  const fetchAmbulances = async () => {
    setIsFetching(true);
    try {
      const response = await GetAll_Ambulances(token, dispatch);

      // Check if response is a valid array
      if (Array.isArray(response)) {
          setAmbulances(response);
      } else {
          setAmbulances([]); 
      }
    } catch (error) {
      console.error("Error fetching ambulances:", error);
      // FIX: Changed to simple string toast
      toast.error("Failed to load ambulance fleet");
      setAmbulances([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, [token]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddAmbulance = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await Add_Ambulance(formData, token, dispatch);

      fetchAmbulances();

      // Reset Form
      setFormData({
        vehicleNumber: "",
        model: "",
        year: "",
        driverName: "",
        driverLicense: "",
        driverContact: "",
        type: "",
        location: "",
      });

    } catch (error) {
      console.error("Error adding ambulance:", error);
      // Error Toast
      toast.error("Failed to register ambulance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Ambulance Form */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Add New Ambulance
            </CardTitle>
            <CardDescription>Register a new ambulance in the fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAmbulance} className="space-y-4">
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input id="vehicleNumber" placeholder="AMB-004" value={formData.vehicleNumber} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input id="model" placeholder="Model" value={formData.model} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="Year" value={formData.year} onChange={handleInputChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="driverName">Driver Name</Label>
                <Input id="driverName" placeholder="Full name" value={formData.driverName} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="driverLicense">Driver License Number</Label>
                <Input id="driverLicense" placeholder="License number" value={formData.driverLicense} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="driverContact">Driver Contact</Label>
                <Input id="driverContact" placeholder="Phone number" value={formData.driverContact} onChange={handleInputChange} required />
              </div>

              <Button type="submit" variant="emergency" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : "Add Ambulance"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ambulance List */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Ambulance Fleet</CardTitle>
            <CardDescription>Manage ambulance fleet and dispatch</CardDescription>
            <div className="flex gap-2">
              <Input placeholder="Search ambulances..." className="flex-1" />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {ambulances.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No ambulances found.</p>
                ) : (
                  ambulances.map((ambulance) => (
                    <div key={ambulance._id || ambulance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{ambulance.vehicleNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          Driver: {ambulance.driverName}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {ambulance.driverContact}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};