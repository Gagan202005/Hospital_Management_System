import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Bed, Search, Edit, Trash2, MapPin, User, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { GetAll_Beds , Add_Bed } from "../../../services/operations/AdminApi";

export const AddBedSection = () => {
  const [isLoading, setIsLoading] = useState(false); // For Add Button
  const [isFetching, setIsFetching] = useState(true); // For List Loading
  
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // 1. Form Data State
  const [formData, setFormData] = useState({
    bedNumber: "",
    ward: "",
    type: "",
    roomNumber: "",
    floorNumber: "",
    status: "Available", // Default status
  });

  // 2. Bed List State
  const [beds, setBeds] = useState([]);

  // 3. Derived Statistics
  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === "Available").length;
  const occupiedBeds = beds.filter(b => b.status === "Occupied").length;
  // Calculate occupancy percentage safely
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // 4. Fetch Function
  const fetchBeds = async () => {
    setIsFetching(true);
    try {
      const response = await GetAll_Beds(token, dispatch);
      
      if (Array.isArray(response)) {
        setBeds(response);
      } else {
        setBeds([]);
      }
    } catch (error) {
      console.error("Error fetching beds:", error);
      toast.error("Failed to load bed list");
      setBeds([]);
    } finally {
      setIsFetching(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchBeds();
  }, [token]);

  // Input Handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 5. Add Bed Function
  const handleAddBed = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic Validation
      if(!formData.ward || !formData.type || !formData.status) {
        toast.error("Please select all dropdown options");
        setIsLoading(false);
        return;
      }

      await Add_Bed(formData, token, dispatch);
      toast.success("Bed Added Successfully");
      
      // Refresh list
      fetchBeds();

      // Reset Form
      setFormData({
        bedNumber: "",
        ward: "",
        type: "",
        roomNumber: "",
        floorNumber: "",
        equipment: "",
        status: "",
      });

    } catch (error) {
      console.error("Error adding bed:", error);
      toast.error("Failed to add bed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Bed Form */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="w-5 h-5" />
              Add New Bed
            </CardTitle>
            <CardDescription>Register a new bed in the hospital system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBed} className="space-y-4">
              <div>
                <Label htmlFor="bedNumber">Bed Number</Label>
                <Input 
                  id="bedNumber" 
                  placeholder="Enter bed number (e.g., A-301)" 
                  value={formData.bedNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="ward">Ward/Department</Label>
                <Select onValueChange={(val) => handleSelectChange("ward", val)} value={formData.ward}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="icu">Intensive Care Unit</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="general">General Ward</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Bed Type</Label>
                <Select onValueChange={(val) => handleSelectChange("type", val)} value={formData.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="icu">ICU Bed</SelectItem>
                    <SelectItem value="emergency">Emergency Bed</SelectItem>
                    <SelectItem value="pediatric">Pediatric Bed</SelectItem>
                    <SelectItem value="maternity">Maternity Bed</SelectItem>
                    <SelectItem value="isolation">Isolation Bed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input 
                    id="roomNumber" 
                    placeholder="Enter room number" 
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="floorNumber">Floor</Label>
                  <Input 
                    id="floorNumber" 
                    type="number" 
                    placeholder="Floor number" 
                    value={formData.floorNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select onValueChange={(val) => handleSelectChange("status", val)} value={formData.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select initial status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="Cleaning">Cleaning Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" variant="medical" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Bed"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bed Management */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Bed Management</CardTitle>
            <CardDescription>Monitor and manage hospital bed availability</CardDescription>
            <div className="flex gap-2">
              <Input placeholder="Search beds..." className="flex-1" />
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
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {beds.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No beds found.</p>
                ) : (
                  beds.map((bed) => (
                    <div key={bed._id || bed.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{bed.bedNumber}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {bed.type} Bed
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge 
                            variant={
                              bed.status === "Available" ? "care" : 
                              bed.status === "Occupied" ? "emergency" : "secondary"
                            }
                          >
                            {bed.status}
                          </Badge>
                          <Badge variant="medical" className="flex items-center gap-1 capitalize">
                            <MapPin className="w-3 h-3" />
                            {bed.ward}
                          </Badge>
                        </div>
                        {/* Only show patient if bed is occupied and patient data exists */}
                        {bed.patient && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            {/* Adjust based on populated patient data */}
                            {bed.patient.firstName ? `${bed.patient.firstName} ${bed.patient.lastName}` : "Occupied"}
                          </div>
                        )}
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

            {/* Dynamic Bed Statistics */}
            <div className="mt-6 p-4 bg-medical-50 rounded-lg">
              <h5 className="font-medium mb-3">Bed Statistics</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Beds:</span>
                  <span className="font-medium ml-2">{totalBeds}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium ml-2 text-care-600">{availableBeds}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Occupied:</span>
                  <span className="font-medium ml-2 text-emergency-600">{occupiedBeds}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Occupancy Rate:</span>
                  <span className="font-medium ml-2">{occupancyRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};