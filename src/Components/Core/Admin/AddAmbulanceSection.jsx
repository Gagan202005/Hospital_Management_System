import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { 
    Truck, Search, Edit, Trash2, Phone, Loader2, 
    X, Save, IndianRupee, Siren, CheckCircle, Activity 
} from "lucide-react";
import { useSelector } from "react-redux";
import { 
    Add_Ambulance, GetAll_Ambulances, Delete_Ambulance, 
    Update_Ambulance, Book_Ambulance, Complete_Trip 
} from "../../../services/operations/AdminApi";

export const AddAmbulanceSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const token = useSelector((state) => state.auth.token);

  // States
  const [ambulances, setAmbulances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAmbId, setSelectedAmbId] = useState(null);
  
  // Forms
  const [formData, setFormData] = useState({
    vehicleNumber: "", model: "", year: "",
    driverName: "", driverLicense: "", driverContact: "",
    pricePerHour: ""
  });

  const [bookingData, setBookingData] = useState({
    patientIdInput: "",
    address: "",
    reason: ""
  });

  // --- Scroll Lock ---
  useEffect(() => {
    if (isBookModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isBookModalOpen]);

  // --- Functions ---
  const fetchAmbulances = async () => {
    setIsFetching(true);
    try {
      const response = await GetAll_Ambulances(token);
      if (Array.isArray(response)) setAmbulances(response);
      else setAmbulances([]);
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, [token]);

  // =================================================================
  // STATISTICS CALCULATION
  // =================================================================
  const stats = useMemo(() => {
    const total = ambulances.length;
    const available = ambulances.filter(a => a.isAvailable).length;
    const onDuty = total - available;
    return { total, available, onDuty };
  }, [ambulances]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: "", model: "", year: "",
      driverName: "", driverLicense: "", driverContact: "", pricePerHour: ""
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await Update_Ambulance({ ...formData, _id: editId }, token);
      } else {
        await Add_Ambulance(formData, token);
      }
      fetchAmbulances();
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (amb) => {
    setIsEditing(true);
    setEditId(amb._id);
    setFormData({
        vehicleNumber: amb.vehicleNumber,
        model: amb.model,
        year: amb.year,
        driverName: amb.driverName,
        driverLicense: amb.driverLicense,
        driverContact: amb.driverContact,
        pricePerHour: amb.pricePerHour
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
      if(window.confirm("Are you sure?")) {
          await Delete_Ambulance(id, token);
          fetchAmbulances();
      }
  };

  // --- Booking Handlers ---
  const openBookingModal = (ambId) => {
      setSelectedAmbId(ambId);
      setBookingData({ patientIdInput: "", address: "", reason: "" });
      setIsBookModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      const success = await Book_Ambulance({ ...bookingData, ambulanceId: selectedAmbId }, token);
      if(success) {
          setIsBookModalOpen(false);
          fetchAmbulances();
      }
      setIsLoading(false);
  };

  const handleCompleteTrip = async (ambId) => {
      if(window.confirm("Mark trip as completed?")) {
          await Complete_Trip(ambId, token);
          fetchAmbulances();
      }
  };

  // --- Search Logic ---
  const filteredAmbulances = useMemo(() => {
      if (!searchQuery) return ambulances;
      const query = searchQuery.toLowerCase().trim();
      
      return ambulances.filter(amb => {
          const vehicle = amb.vehicleNumber.toLowerCase();
          const driver = amb.driverName.toLowerCase();
          const id = (amb.ambulanceID || "").toString();

          return (
              vehicle.includes(query) || 
              driver.includes(query) || 
              id.startsWith(query) 
          );
      });
  }, [ambulances, searchQuery]);

  return (
    <div className="space-y-6 relative">
      
      {/* ======================= STATS OVERVIEW ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-blue-600 font-medium">Total Fleet</p>
                      <h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3>
                  </div>
                  <Truck className="h-8 w-8 text-blue-300" />
              </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-green-600 font-medium">Available</p>
                      <h3 className="text-2xl font-bold text-green-900">{stats.available}</h3>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-300" />
              </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-red-600 font-medium">On Duty</p>
                      <h3 className="text-2xl font-bold text-red-900">{stats.onDuty}</h3>
                  </div>
                  <Activity className="h-8 w-8 text-red-300" />
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: FORM */}
        <Card className={`bg-white/80 backdrop-blur-sm h-fit transition-all ${isEditing ? "border-blue-500 ring-1 ring-blue-500" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle className="flex items-center gap-2">
                    {isEditing ? <Edit className="w-5 h-5 text-blue-600"/> : <Truck className="w-5 h-5 text-red-600" />}
                    {isEditing ? "Edit Ambulance" : "Add New Ambulance"}
                </CardTitle>
                <CardDescription>Manage fleet details and pricing</CardDescription>
            </div>
            {isEditing && (
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-red-500 hover:bg-red-50">
                    <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input id="vehicleNumber" placeholder="AMB-101" value={formData.vehicleNumber} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="pricePerHour">Price / Hour (₹)</Label>
                    <Input id="pricePerHour" type="number" placeholder="500" value={formData.pricePerHour} onChange={handleInputChange} required />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input id="model" placeholder="Force Traveller" value={formData.model} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="2024" value={formData.year} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driverName">Driver Name</Label>
                  <Input id="driverName" placeholder="Full name" value={formData.driverName} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="driverContact">Driver Contact</Label>
                  <Input id="driverContact" placeholder="9876543210" value={formData.driverContact} onChange={handleInputChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="driverLicense">Driver License Number</Label>
                <Input id="driverLicense" placeholder="DL-XYZ-1234" value={formData.driverLicense} onChange={handleInputChange} required />
              </div>

              <Button type="submit" className={`w-full text-white ${isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`} disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? "Updating..." : "Adding..."}</> : <>{isEditing ? <><Save className="w-4 h-4 mr-2"/> Update Ambulance</> : "Add Ambulance"}</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RIGHT: LIST */}
        <Card className="bg-white/80 backdrop-blur-sm h-[800px] flex flex-col">
          <CardHeader>
            <CardTitle>Ambulance Fleet</CardTitle>
            <CardDescription>Dispatch and manage availability</CardDescription>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search Vehicle, Driver, or ID..." 
                    className="pl-8" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAmbulances.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                      <Truck className="h-10 w-10 mb-2 opacity-20"/>
                      <p>No ambulances found.</p>
                  </div>
                ) : (
                  filteredAmbulances.map((amb) => (
                    <div key={amb._id} className={`flex flex-col p-4 border rounded-xl shadow-sm transition-all ${amb.isAvailable ? 'bg-white border-green-100' : 'bg-red-50 border-red-200'}`}>
                      {/* Top Row: Info */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{amb.vehicleNumber}</h4>
                              <Badge variant={amb.isAvailable ? "outline" : "destructive"} className={amb.isAvailable ? "text-green-600 bg-green-50 border-green-200" : ""}>
                                  {amb.isAvailable ? "Available" : "On Duty"}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px]">ID: {amb.ambulanceID}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {amb.model} ({amb.year}) • Driver: {amb.driverName}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium text-gray-600">
                             <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {amb.driverContact}</span>
                             <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3"/> {amb.pricePerHour}/hr</span>
                          </div>
                        </div>
                        
                        {/* Edit/Delete Actions */}
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(amb)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(amb._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Bottom Row: Dispatch Actions */}
                      <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center">
                          {!amb.isAvailable ? (
                              <div className="flex-1">
                                  <p className="text-xs text-red-600 font-semibold mb-1">
                                      Active Trip: {amb.currentTrip?.patientId?.firstName || "Unknown"} (PID: {amb.currentTrip?.patientId?.patientID})
                                  </p>
                                  <p className="text-[10px] text-gray-500 truncate max-w-[200px]">
                                      To: {amb.currentTrip?.address}
                                  </p>
                              </div>
                          ) : (
                              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3"/> Ready for dispatch
                              </div>
                          )}

                          {amb.isAvailable ? (
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => openBookingModal(amb._id)}>
                                  <Siren className="w-4 h-4 mr-2" /> Dispatch
                              </Button>
                          ) : (
                              <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleCompleteTrip(amb._id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> Complete Trip
                              </Button>
                          )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===================== BOOKING MODAL (PORTAL) ===================== */}
      {isBookModalOpen && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-200">
                  
                  {/* Header */}
                  <div className="px-6 py-4 border-b flex justify-between items-center bg-red-50">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-red-700">
                          <Siren className="w-5 h-5" /> Dispatch Ambulance
                      </h3>
                      <button onClick={() => setIsBookModalOpen(false)} className="text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full p-1 transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  {/* Body */}
                  <div className="p-6">
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                          <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Patient ID</Label>
                              <Input 
                                  placeholder="e.g. 101" 
                                  value={bookingData.patientIdInput}
                                  onChange={(e) => setBookingData({...bookingData, patientIdInput: e.target.value})}
                                  required
                                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                              />
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" /> 
                                  System will verify ID instantly
                              </p>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Destination Address</Label>
                              <Textarea 
                                  placeholder="House No, Street, Landmark..." 
                                  value={bookingData.address}
                                  onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                                  required
                                  className="min-h-[80px] border-gray-300 focus:border-red-500 focus:ring-red-500"
                              />
                          </div>
                          <div className="space-y-2">
                              <Label className="text-gray-700 font-medium">Reason / Emergency Type</Label>
                              <Input 
                                  placeholder="e.g. Cardiac, Accident, Transfer..." 
                                  value={bookingData.reason}
                                  onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                              />
                          </div>
                          
                          {/* Footer */}
                          <div className="flex gap-3 mt-6 pt-2 border-t border-dashed">
                              <Button type="button" variant="outline" className="flex-1 hover:bg-gray-50" onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
                              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200" disabled={isLoading}>
                                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Dispatching...</> : "Confirm Dispatch"}
                              </Button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>,
          document.body 
      )}
    </div>
  );
};