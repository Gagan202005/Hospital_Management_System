import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Truck, Search, Edit, Trash2, Phone, Loader2, X, Save, IndianRupee, Siren, CheckCircle, Activity } from "lucide-react";
import { useSelector } from "react-redux";
import { Add_Ambulance, GetAll_Ambulances, Delete_Ambulance, Update_Ambulance, Book_Ambulance, Complete_Trip } from "../../../services/operations/AdminApi";

export const AddAmbulanceSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const token = useSelector((state) => state.auth.token);

  const [ambulances, setAmbulances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAmbId, setSelectedAmbId] = useState(null);
  
  const [formData, setFormData] = useState({ vehicleNumber: "", model: "", year: "", driverName: "", driverLicense: "", driverContact: "", pricePerHour: "" });
  const [bookingData, setBookingData] = useState({ patientIdInput: "", address: "", reason: "" });

  useEffect(() => {
    if (isBookModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isBookModalOpen]);

  const fetchAmbulances = async () => {
    setIsFetching(true);
    try {
      const response = await GetAll_Ambulances(token);
      if (Array.isArray(response)) setAmbulances(response);
    } catch (error) { console.error(error); } 
    finally { setIsFetching(false); }
  };

  useEffect(() => { fetchAmbulances(); }, [token]);

  const stats = useMemo(() => {
    const total = ambulances.length;
    const available = ambulances.filter(a => a.isAvailable).length;
    return { total, available, onDuty: total - available };
  }, [ambulances]);

  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.id]: e.target.value }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) await Update_Ambulance({ ...formData, _id: editId }, token);
      else await Add_Ambulance(formData, token);
      fetchAmbulances();
      setFormData({ vehicleNumber: "", model: "", year: "", driverName: "", driverLicense: "", driverContact: "", pricePerHour: "" });
      setIsEditing(false); setEditId(null);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleEditClick = (amb) => {
    setIsEditing(true); setEditId(amb._id);
    setFormData({ vehicleNumber: amb.vehicleNumber, model: amb.model, year: amb.year, driverName: amb.driverName, driverLicense: amb.driverLicense, driverContact: amb.driverContact, pricePerHour: amb.pricePerHour });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => { if(window.confirm("Remove vehicle?")) { await Delete_Ambulance(id, token); fetchAmbulances(); } };

  const handleBookingSubmit = async (e) => {
      e.preventDefault(); setIsLoading(true);
      const success = await Book_Ambulance({ ...bookingData, ambulanceId: selectedAmbId }, token);
      if(success) { setIsBookModalOpen(false); fetchAmbulances(); }
      setIsLoading(false);
  };

  const handleCompleteTrip = async (id) => { if(window.confirm("Trip completed?")) { await Complete_Trip(id, token); fetchAmbulances(); } };

  const filtered = useMemo(() => {
      if (!searchQuery) return ambulances;
      const q = searchQuery.toLowerCase();
      return ambulances.filter(a => a.vehicleNumber.toLowerCase().includes(q) || a.driverName.toLowerCase().includes(q));
  }, [ambulances, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-100 shadow-sm"><CardContent className="p-4 flex justify-between"><div><p className="text-blue-600 text-sm font-medium">Fleet Size</p><h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3></div><Truck className="h-8 w-8 text-blue-300"/></CardContent></Card>
          <Card className="bg-green-50 border-green-100 shadow-sm"><CardContent className="p-4 flex justify-between"><div><p className="text-green-600 text-sm font-medium">Available</p><h3 className="text-2xl font-bold text-green-900">{stats.available}</h3></div><CheckCircle className="h-8 w-8 text-green-300"/></CardContent></Card>
          <Card className="bg-red-50 border-red-100 shadow-sm"><CardContent className="p-4 flex justify-between"><div><p className="text-red-600 text-sm font-medium">On Mission</p><h3 className="text-2xl font-bold text-red-900">{stats.onDuty}</h3></div><Siren className="h-8 w-8 text-red-300"/></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`h-fit ${isEditing ? "border-red-500 shadow-md" : "border-slate-200"}`}>
          <CardHeader>
            <div className="flex justify-between">
                <CardTitle className="flex items-center gap-2">{isEditing ? <Edit className="w-5 h-5 text-red-600"/> : <Truck className="w-5 h-5 text-red-600"/>} {isEditing ? "Modify Vehicle" : "Add Vehicle"}</CardTitle>
                {isEditing && <Button variant="ghost" size="sm" onClick={()=>{setIsEditing(false); setEditId(null); setFormData({vehicleNumber:"", model:"", year:"", driverName:"", driverLicense:"", driverContact:"", pricePerHour:""})}} className="text-slate-500"><X className="w-4 h-4 mr-1"/> Cancel</Button>}
            </div>
            <CardDescription>Manage ambulance fleet details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Vehicle No.</Label><Input id="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} required /></div>
                  <div className="space-y-1"><Label>Rate (₹/hr)</Label><Input id="pricePerHour" type="number" value={formData.pricePerHour} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Model</Label><Input id="model" value={formData.model} onChange={handleInputChange} required /></div>
                <div className="space-y-1"><Label>Year</Label><Input id="year" type="number" value={formData.year} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Driver Name</Label><Input id="driverName" value={formData.driverName} onChange={handleInputChange} required /></div>
                <div className="space-y-1"><Label>Driver Phone</Label><Input id="driverContact" value={formData.driverContact} onChange={handleInputChange} required /></div>
              </div>
              <div className="space-y-1"><Label>License No.</Label><Input id="driverLicense" value={formData.driverLicense} onChange={handleInputChange} required /></div>
              <Button type="submit" className={`w-full ${isEditing ? "bg-blue-600" : "bg-red-600 hover:bg-red-700"}`} disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : isEditing ? "Save Changes" : "Add Vehicle"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-[800px] flex flex-col border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Fleet Status</CardTitle><div className="relative mt-2"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/><Input placeholder="Search fleet..." className="pl-9" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/></div></CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-red-600"/></div> : (
              <div className="space-y-3">
                {filtered.map(amb => (
                    <div key={amb._id} className={`flex flex-col p-4 border rounded-xl shadow-sm bg-white ${amb.isAvailable ? 'border-green-200' : 'border-red-200 bg-red-50/20'}`}>
                        <div className="flex justify-between">
                            <div>
                                <div className="flex items-center gap-2"><h4 className="font-bold text-slate-900">{amb.vehicleNumber}</h4><Badge className={amb.isAvailable ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>{amb.isAvailable ? "Available" : "On Duty"}</Badge></div>
                                <p className="text-xs text-slate-500 mt-1">{amb.model} • {amb.driverName} ({amb.driverContact})</p>
                            </div>
                            
                            {/* --- MODIFIED BUTTONS START --- */}
                            <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={()=>handleEditClick(amb)} 
                                  disabled={!amb.isAvailable}
                                  title={!amb.isAvailable ? "Cannot modify while On Duty" : "Edit Details"}
                                  className={`h-7 w-7 ${!amb.isAvailable ? "text-slate-300 cursor-not-allowed" : "text-blue-600"}`}
                                >
                                  <Edit className="w-3 h-3"/>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={()=>handleDelete(amb._id)} 
                                  disabled={!amb.isAvailable}
                                  title={!amb.isAvailable ? "Cannot delete while On Duty" : "Delete Vehicle"}
                                  className={`h-7 w-7 ${!amb.isAvailable ? "text-slate-300 cursor-not-allowed" : "text-red-500"}`}
                                >
                                  <Trash2 className="w-3 h-3"/>
                                </Button>
                            </div>
                            {/* --- MODIFIED BUTTONS END --- */}

                        </div>
                        <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                            {!amb.isAvailable ? <div className="text-xs text-red-600 font-medium">To: {amb.currentTrip?.address}</div> : <div className="text-xs text-green-600">Ready for dispatch</div>}
                            {amb.isAvailable ? <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8 text-xs" onClick={()=>{setSelectedAmbId(amb._id); setIsBookModalOpen(true);}}><Siren className="w-3 h-3 mr-1"/> Dispatch</Button> : <Button size="sm" variant="outline" className="border-green-200 text-green-700 h-8 text-xs" onClick={()=>handleCompleteTrip(amb._id)}><CheckCircle className="w-3 h-3 mr-1"/> Complete</Button>}
                        </div>
                    </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Modal */}
      {isBookModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex justify-between items-center"><h3 className="font-bold text-red-800 flex gap-2"><Siren className="w-5 h-5"/> Emergency Dispatch</h3><button onClick={()=>setIsBookModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-red-500"/></button></div>
                  <div className="p-6">
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                          <div className="space-y-1"><Label>Patient ID</Label><Input placeholder="e.g. 1024" value={bookingData.patientIdInput} onChange={(e)=>setBookingData({...bookingData, patientIdInput: e.target.value})} required/></div>
                          <div className="space-y-1"><Label>Destination</Label><Textarea placeholder="Address..." value={bookingData.address} onChange={(e)=>setBookingData({...bookingData, address: e.target.value})} required/></div>
                          <div className="space-y-1"><Label>Emergency Reason</Label><Input placeholder="e.g. Cardiac Arrest" value={bookingData.reason} onChange={(e)=>setBookingData({...bookingData, reason: e.target.value})}/></div>
                          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 mt-2" disabled={isLoading}>{isLoading ? "Processing..." : "Confirm Dispatch"}</Button>
                      </form>
                  </div>
              </div>
          </div>, document.body
      )}
    </div>
  );
};