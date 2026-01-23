import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Bed, Search, Edit, Trash2, User, Loader2, Save, X, Activity, CheckCircle, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { 
    GetAll_Beds, Add_Bed, Update_Bed, Delete_Bed, 
    Allocate_Bed, Discharge_Bed 
} from "../../../services/operations/AdminApi";

export const AddBedSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const token = useSelector((state) => state.auth.token);

  // States
  const [beds, setBeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Modal States
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState(null);
  const [patientIdInput, setPatientIdInput] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    bedNumber: "", ward: "", type: "", 
    roomNumber: "", floorNumber: "", dailyCharge: "", status: "Available"
  });

  // Scroll Lock
  useEffect(() => {
    if (isAllocateModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isAllocateModalOpen]);

  // Fetch Data
  const fetchBeds = async () => {
    setIsFetching(true);
    try {
      const response = await GetAll_Beds(token);
      if (Array.isArray(response)) setBeds(response);
      else setBeds([]);
    } catch (error) {
      console.error("Error fetching beds:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, [token]);

  // Handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({
      bedNumber: "", ward: "", type: "", 
      roomNumber: "", floorNumber: "", dailyCharge: "", status: "Available"
    });
    setIsEditing(false);
    setEditId(null);
  };

  // CRUD Operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if(!formData.ward || !formData.type) {
        toast.error("Please select Ward and Bed Type");
        setIsLoading(false);
        return;
      }

      if (isEditing) {
        await Update_Bed({ ...formData, _id: editId }, token);
      } else {
        await Add_Bed(formData, token);
      }
      fetchBeds();
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (bed) => {
    if (bed.status === "Occupied") {
        toast.error("Cannot edit an occupied bed. Discharge first.");
        return;
    }
    setIsEditing(true);
    setEditId(bed._id);
    setFormData({
        bedNumber: bed.bedNumber,
        ward: bed.ward,
        type: bed.type,
        roomNumber: bed.roomNumber,
        floorNumber: bed.floorNumber,
        dailyCharge: bed.dailyCharge,
        status: bed.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (bed) => {
    if (bed.status === "Occupied") {
        toast.error("Cannot delete an occupied bed.");
        return;
    }
    if(window.confirm("Are you sure?")) {
        await Delete_Bed(bed._id, token);
        fetchBeds();
    }
  };

  // Allocation Logic
  const openAllocateModal = (bedId) => {
      setSelectedBedId(bedId);
      setPatientIdInput("");
      setIsAllocateModalOpen(true);
  };

  const handleAllocateSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      const success = await Allocate_Bed({ bedId: selectedBedId, patientIdInput }, token);
      if(success) {
          setIsAllocateModalOpen(false);
          fetchBeds();
      }
      setIsLoading(false);
  };

  const handleDischarge = async (bedId) => {
      if(window.confirm("Discharge patient and make bed Available?")) {
          await Discharge_Bed(bedId, token);
          fetchBeds();
      }
  };

  // =================================================================
  // UPDATED SEARCH LOGIC
  // =================================================================
  const filteredBeds = useMemo(() => {
    if (!searchQuery) return beds;
    const query = searchQuery.toLowerCase().trim();
    
    return beds.filter(bed => {
        // 1. Bed Info
        const bedNum = bed.bedNumber.toLowerCase();
        const ward = bed.ward.toLowerCase();
        
        // 2. Custom ID (e.g. 1001)
        const customID = (bed.bedID || "").toString();

        // 3. Patient Info (if occupied)
        const patientName = bed.patient 
            ? `${bed.patient.firstName} ${bed.patient.lastName}`.toLowerCase() 
            : "";
        
        return (
            bedNum.includes(query) ||
            ward.includes(query) ||
            customID.startsWith(query) ||
            patientName.includes(query)
        );
    });
  }, [beds, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = beds.length;
    const occupied = beds.filter(b => b.status === "Occupied").length;
    const available = beds.filter(b => b.status === "Available").length;
    return { total, occupied, available };
  }, [beds]);

  return (
    <div className="space-y-6 relative">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="text-sm text-blue-600 font-medium">Total Beds</p><h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3></div>
                  <Bed className="h-8 w-8 text-blue-300" />
              </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="text-sm text-green-600 font-medium">Available</p><h3 className="text-2xl font-bold text-green-900">{stats.available}</h3></div>
                  <CheckCircle className="h-8 w-8 text-green-300" />
              </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="text-sm text-red-600 font-medium">Occupied</p><h3 className="text-2xl font-bold text-red-900">{stats.occupied}</h3></div>
                  <Activity className="h-8 w-8 text-red-300" />
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ======================= LEFT: FORM ======================= */}
        <Card className={`bg-white/80 backdrop-blur-sm h-fit transition-all ${isEditing ? "border-blue-500 ring-1 ring-blue-500" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle className="flex items-center gap-2">
                {isEditing ? <Edit className="w-5 h-5 text-blue-600" /> : <Bed className="w-5 h-5 text-indigo-600" />}
                {isEditing ? "Edit Bed Details" : "Add New Bed"}
                </CardTitle>
                <CardDescription>Manage hospital infrastructure</CardDescription>
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
                    <Label>Bed Number</Label>
                    <Input id="bedNumber" placeholder="ICU-01" value={formData.bedNumber} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label>Daily Charge (₹)</Label>
                    <Input id="dailyCharge" type="number" placeholder="2000" value={formData.dailyCharge} onChange={handleInputChange} required />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label>Ward / Department</Label>
                    <Select onValueChange={(val) => handleSelectChange("ward", val)} value={formData.ward}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Maternity">Maternity</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div>
                    <Label>Bed Type</Label>
                    <Select onValueChange={(val) => handleSelectChange("type", val)} value={formData.type}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Maternity">Maternity</SelectItem>
                        <SelectItem value="Pediatric">Pediatric</SelectItem>
                        <SelectItem value="Isolation">Isolation</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Room Number</Label>
                  <Input id="roomNumber" placeholder="104" value={formData.roomNumber} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label>Floor</Label>
                  <Input id="floorNumber" type="number" placeholder="1" value={formData.floorNumber} onChange={handleInputChange} required />
                </div>
              </div>
              <div>
                <Label>Maintenance Status</Label>
                <Select onValueChange={(val) => handleSelectChange("status", val)} value={formData.status}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className={`w-full text-white ${isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 hover:bg-indigo-700"}`} disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? "Updating..." : "Adding..."}</> : <>{isEditing ? <><Save className="w-4 h-4 mr-2"/> Update Bed</> : "Add Bed"}</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ======================= RIGHT: BED LIST ======================= */}
        <Card className="bg-white/80 backdrop-blur-sm h-[800px] flex flex-col">
          <CardHeader>
            <CardTitle>Bed Management</CardTitle>
            <CardDescription>Allocate and monitor beds</CardDescription>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by ID (101), Ward, or Patient Name..." 
                    className="pl-8" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
            ) : (
              <div className="space-y-4">
                {filteredBeds.length === 0 ? <p className="text-center text-gray-500">No beds found.</p> : (
                  filteredBeds.map((bed) => (
                    <div key={bed._id} className={`flex flex-col p-4 border rounded-xl shadow-sm transition-all ${bed.status === 'Available' ? 'bg-green-50/50 border-green-100' : bed.status === 'Occupied' ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
                      {/* Info Row */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{bed.bedNumber}</h4>
                              <Badge variant="outline" className="text-[10px] h-5">ID: {bed.bedID}</Badge>
                              <Badge variant={bed.status === "Available" ? "outline" : "secondary"} className={
                                  bed.status === "Available" ? "text-green-600 border-green-200 bg-green-50" : 
                                  bed.status === "Occupied" ? "text-red-600 bg-red-50 border-red-200" : "text-gray-600 bg-gray-100"
                              }>
                                  {bed.status}
                              </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                             {bed.type} • {bed.ward} • Room {bed.roomNumber}
                          </p>
                          {bed.patient && (
                              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded w-fit">
                                  <User className="w-3 h-3" />
                                  {bed.patient.firstName} {bed.patient.lastName} (PID: {bed.patient.patientID})
                              </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={bed.status === "Occupied"}
                            className={bed.status === "Occupied" ? "opacity-30 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"} 
                            onClick={() => handleEditClick(bed)}
                            title={bed.status === "Occupied" ? "Cannot edit occupied bed" : "Edit Bed"}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={bed.status === "Occupied"}
                            className={bed.status === "Occupied" ? "opacity-30 cursor-not-allowed" : "text-red-500 hover:bg-red-50"} 
                            onClick={() => handleDelete(bed)}
                            title={bed.status === "Occupied" ? "Cannot delete occupied bed" : "Delete Bed"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-dashed flex justify-end">
                          {bed.status === "Available" && (
                              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => openAllocateModal(bed._id)}>
                                  Allocate Bed
                              </Button>
                          )}
                          {bed.status === "Occupied" && (
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDischarge(bed._id)}>
                                  <LogOut className="w-4 h-4 mr-2" /> Discharge
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

      {/* ===================== ALLOCATE MODAL (PORTAL) ===================== */}
      {isAllocateModalOpen && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative border border-gray-200">
                  <div className="px-6 py-4 border-b flex justify-between items-center bg-indigo-50">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-700">
                          <User className="w-5 h-5" /> Admit Patient
                      </h3>
                      <button onClick={() => setIsAllocateModalOpen(false)} className="text-gray-500 hover:text-red-600"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6">
                      <form onSubmit={handleAllocateSubmit} className="space-y-4">
                          <div className="space-y-2">
                              <Label>Patient ID</Label>
                              <Input 
                                  placeholder="Enter numeric Patient ID (e.g. 101)" 
                                  value={patientIdInput}
                                  onChange={(e) => setPatientIdInput(e.target.value)}
                                  required
                                  autoFocus
                              />
                              <p className="text-xs text-muted-foreground">System will verify eligibility and availability.</p>
                          </div>
                          <div className="flex gap-3 mt-4">
                              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAllocateModalOpen(false)}>Cancel</Button>
                              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Allocation"}
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