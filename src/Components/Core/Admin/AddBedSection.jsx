import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Bed, Search, Edit, Trash2, User, Loader2, Save, X, Activity, CheckCircle, LogOut, LayoutGrid } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { GetAll_Beds, Add_Bed, Update_Bed, Delete_Bed, Allocate_Bed, Discharge_Bed } from "../../../services/operations/AdminApi";

export const AddBedSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const token = useSelector((state) => state.auth.token);

  const [beds, setBeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState(null);
  const [patientIdInput, setPatientIdInput] = useState("");

  const [formData, setFormData] = useState({ bedNumber: "", ward: "", type: "", roomNumber: "", floorNumber: "", dailyCharge: "", status: "Available" });

  useEffect(() => {
    if (isAllocateModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isAllocateModalOpen]);

  const fetchBeds = async () => {
    setIsFetching(true);
    try {
      const response = await GetAll_Beds(token);
      if (Array.isArray(response)) setBeds(response);
    } catch (error) { console.error(error); } 
    finally { setIsFetching(false); }
  };

  useEffect(() => { fetchBeds(); }, [token]);

  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.id]: e.target.value }));
  const handleSelectChange = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if(!formData.ward || !formData.type) { toast.error("Select Ward/Type"); setIsLoading(false); return; }
      if (isEditing) await Update_Bed({ ...formData, _id: editId }, token);
      else await Add_Bed(formData, token);
      fetchBeds();
      setFormData({ bedNumber: "", ward: "", type: "", roomNumber: "", floorNumber: "", dailyCharge: "", status: "Available" });
      setIsEditing(false); setEditId(null);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleEditClick = (bed) => {
    if (bed.status === "Occupied") return toast.error("Discharge patient first.");
    setIsEditing(true); setEditId(bed._id);
    setFormData({ bedNumber: bed.bedNumber, ward: bed.ward, type: bed.type, roomNumber: bed.roomNumber, floorNumber: bed.floorNumber, dailyCharge: bed.dailyCharge, status: bed.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (bed) => {
    if (bed.status === "Occupied") return toast.error("Cannot delete occupied bed.");
    if(window.confirm("Delete bed?")) { await Delete_Bed(bed._id, token); fetchBeds(); }
  };

  const handleAllocateSubmit = async (e) => {
      e.preventDefault(); setIsLoading(true);
      const success = await Allocate_Bed({ bedId: selectedBedId, patientIdInput }, token);
      if(success) { setIsAllocateModalOpen(false); fetchBeds(); }
      setIsLoading(false);
  };

  const handleDischarge = async (id) => { if(window.confirm("Discharge patient?")) { await Discharge_Bed(id, token); fetchBeds(); } };

  const filtered = useMemo(() => {
    if (!searchQuery) return beds;
    const q = searchQuery.toLowerCase();
    return beds.filter(b => b.bedNumber.toLowerCase().includes(q) || b.ward.toLowerCase().includes(q) || b.patient?.firstName?.toLowerCase().includes(q));
  }, [beds, searchQuery]);

  const stats = useMemo(() => ({
    total: beds.length,
    occupied: beds.filter(b => b.status === "Occupied").length,
    available: beds.filter(b => b.status === "Available").length
  }), [beds]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-100 shadow-sm"><CardContent className="p-4 flex justify-between"><div><p className="text-blue-600 text-sm font-medium">Capacity</p><h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3></div><Bed className="h-8 w-8 text-blue-300"/></CardContent></Card>
          <Card className="bg-green-50 border-green-100 shadow-sm"><CardContent className="p-4 flex justify-between"><div><p className="text-green-600 text-sm font-medium">Available</p><h3 className="text-2xl font-bold text-green-900">{stats.available}</h3></div><CheckCircle className="h-8 w-8 text-green-300"/></CardContent></Card>
          <Card className="bg-red-50 border-red-100 shadow-sm"><CardContent className="p-4 flex justify-between"><div><p className="text-red-600 text-sm font-medium">Occupied</p><h3 className="text-2xl font-bold text-red-900">{stats.occupied}</h3></div><Activity className="h-8 w-8 text-red-300"/></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={`h-fit ${isEditing ? "border-indigo-500 shadow-md" : "border-slate-200"}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">{isEditing ? <Edit className="w-5 h-5 text-indigo-600"/> : <LayoutGrid className="w-5 h-5 text-indigo-600"/>} {isEditing ? "Modify Bed" : "Add Bed"}</CardTitle>
                {isEditing && <Button variant="ghost" size="sm" onClick={()=>{setIsEditing(false); setEditId(null); setFormData({bedNumber:"", ward:"", type:"", roomNumber:"", floorNumber:"", dailyCharge:"", status:"Available"})}} className="text-slate-500"><X className="w-4 h-4 mr-1"/> Cancel</Button>}
            </div>
            <CardDescription>Manage ward infrastructure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Bed No.</Label><Input id="bedNumber" placeholder="ICU-01" value={formData.bedNumber} onChange={handleInputChange} required /></div>
                  <div className="space-y-1"><Label>Charge (₹)</Label><Input id="dailyCharge" type="number" value={formData.dailyCharge} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><Label>Ward</Label><Select onValueChange={(v)=>handleSelectChange("ward", v)} value={formData.ward}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Emergency", "ICU", "General", "Maternity", "Pediatrics"].map(w=><SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>
                 <div className="space-y-1"><Label>Type</Label><Select onValueChange={(v)=>handleSelectChange("type", v)} value={formData.type}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Standard", "ICU", "Ventilator", "Isolation"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Room</Label><Input id="roomNumber" value={formData.roomNumber} onChange={handleInputChange} required /></div>
                <div className="space-y-1"><Label>Floor</Label><Input id="floorNumber" type="number" value={formData.floorNumber} onChange={handleInputChange} required /></div>
              </div>
              <div className="space-y-1"><Label>Maintenance</Label><Select onValueChange={(v)=>handleSelectChange("status", v)} value={formData.status}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="Available">Active</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem></SelectContent></Select></div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : isEditing ? "Save" : "Add Bed"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-[800px] flex flex-col border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Ward Status</CardTitle><div className="relative mt-2"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/><Input placeholder="Search..." className="pl-9" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/></div></CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div> : (
              <div className="space-y-3">
                {filtered.map(bed => (
                    <div key={bed._id} className={`p-4 border rounded-xl shadow-sm bg-white ${bed.status === 'Occupied' ? 'border-red-200 bg-red-50/20' : 'border-green-200 bg-green-50/20'}`}>
                        <div className="flex justify-between">
                            <div>
                                <div className="flex items-center gap-2"><h4 className="font-bold text-slate-900">{bed.bedNumber}</h4><Badge className={bed.status==="Occupied"?"bg-red-100 text-red-700 hover:bg-red-100":"bg-green-100 text-green-700 hover:bg-green-100"}>{bed.status}</Badge></div>
                                <p className="text-xs text-slate-500 mt-1">{bed.ward} • {bed.type}</p>
                                {bed.patient && <div className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-700"><User className="w-3 h-3"/> {bed.patient.firstName} {bed.patient.lastName}</div>}
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" disabled={bed.status==="Occupied"} onClick={()=>handleEditClick(bed)} className="h-7 w-7 text-blue-600"><Edit className="w-3 h-3"/></Button>
                                <Button variant="ghost" size="icon" disabled={bed.status==="Occupied"} onClick={()=>handleDelete(bed)} className="h-7 w-7 text-red-500"><Trash2 className="w-3 h-3"/></Button>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex justify-end">
                            {bed.status === "Available" ? <Button size="sm" className="bg-indigo-600 h-8 text-xs" onClick={()=>{setSelectedBedId(bed._id); setIsAllocateModalOpen(true);}}>Admit Patient</Button> : <Button size="sm" variant="outline" className="border-red-200 text-red-600 h-8 text-xs hover:bg-red-50" onClick={()=>handleDischarge(bed._id)}><LogOut className="w-3 h-3 mr-1"/> Discharge</Button>}
                        </div>
                    </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Allocate Modal */}
      {isAllocateModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center"><h3 className="font-bold text-indigo-800 flex gap-2"><User className="w-5 h-5"/> Admit Patient</h3><button onClick={()=>setIsAllocateModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-indigo-600"/></button></div>
                  <div className="p-6 space-y-4">
                      <div className="space-y-1"><Label>Patient ID</Label><Input placeholder="e.g. 105" value={patientIdInput} onChange={(e)=>setPatientIdInput(e.target.value)} autoFocus required/></div>
                      <Button onClick={handleAllocateSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>{isLoading ? "Admitting..." : "Confirm Admission"}</Button>
                  </div>
              </div>
          </div>, document.body
      )}
    </div>
  );
};