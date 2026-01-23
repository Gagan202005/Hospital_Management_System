import { useEffect, useState } from "react";
import { 
    Users, 
    Stethoscope, 
    Calendar, 
    DollarSign, 
    Activity, 
    Clock, 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useSelector } from "react-redux";
import { fetchAdminStats } from "../../../services/operations/AdminApi";

export const OverviewSection = () => {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      setLoading(true);
      if (token) {
        const data = await fetchAdminStats(token);
        if (data) setStats(data);
      }
      setLoading(false);
    };
    getStats();
  }, [token]);

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;
  if (!stats) return <div className="p-8 text-center">Failed to load data.</div>;

  return (
    <div className="space-y-6">
      {/* 1. Top Level KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
            title="Total Patients" 
            value={stats.counts.patients} 
            icon={<Users className="h-4 w-4 text-blue-600" />} 
            borderColor="border-l-blue-500"
            subtext="Registered patients"
        />
        <StatsCard 
            title="Total Doctors" 
            value={stats.counts.doctors} 
            icon={<Stethoscope className="h-4 w-4 text-teal-600" />} 
            borderColor="border-l-teal-500"
            subtext="Active medical staff"
        />
        <StatsCard 
            title="Total Appointments" 
            value={stats.counts.appointments} 
            icon={<Calendar className="h-4 w-4 text-purple-600" />} 
            borderColor="border-l-purple-500"
            subtext="All time bookings"
        />
        <StatsCard 
            title="Total Revenue" 
            value={`$${stats.counts.revenue.toLocaleString()}`} 
            icon={<DollarSign className="h-4 w-4 text-green-600" />} 
            borderColor="border-l-green-500"
            subtext="From completed visits"
        />
      </div>

      {/* 2. Middle Section: Activity & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Appointments List */}
        <Card className="col-span-1 lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Appointments
            </CardTitle>
            <CardDescription>Latest bookings across the hospital</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {stats.recentAppointments.length > 0 ? (
                    stats.recentAppointments.map((apt) => (
                        <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                     {/* Handle Patient Image or Initials */}
                                     {apt.patient?.image ? (
                                        <img src={apt.patient.image} alt="pat" className="w-full h-full object-cover"/>
                                     ) : (
                                        <span>{apt.patient?.firstName?.[0]}</span>
                                     )}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">
                                        {/* Fallback to patientDetails snapshot if populate is empty/null */}
                                        {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : apt.patientDetails?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Dr. {apt.doctor?.firstName} {apt.doctor?.lastName} ({apt.doctor?.specialization})
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant={getStatusBadgeVariant(apt.status)} className="mb-1">
                                    {apt.status}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(apt.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-4">No recent appointments found.</p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Appointment Status Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              Status Overview
            </CardTitle>
            <CardDescription>Current appointment states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StatusRow 
                label="Completed" 
                count={stats.appointmentStats.completed} 
                total={stats.counts.appointments} 
                color="bg-green-500" 
            />
            <StatusRow 
                label="Scheduled" 
                count={stats.appointmentStats.scheduled} 
                total={stats.counts.appointments} 
                color="bg-blue-500" 
            />
            <StatusRow 
                label="Cancelled" 
                count={stats.appointmentStats.cancelled} 
                total={stats.counts.appointments} 
                color="bg-red-500" 
            />
          </CardContent>
        </Card>
      </div>

      {/* 3. Bottom Section: Active Doctors List */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-gray-500" />
            Medical Staff Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.doctorsList.map((doc, i) => (
                <div key={i} className="flex items-center p-3 border rounded-lg hover:shadow-md transition-all">
                    <Avatar className="h-10 w-10 mr-3">
                        {/* UPDATED: accessing doc.image and doc.firstName directly */}
                        <AvatarImage src={doc.image} />
                        <AvatarFallback className="bg-teal-100 text-teal-700">
                            {doc.firstName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        {/* UPDATED: accessing doc.firstName directly */}
                        <p className="text-sm font-semibold">Dr. {doc.firstName} {doc.lastName}</p>
                        <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                        <p className="text-xs font-medium text-green-600 mt-1">${doc.consultationFee} / Visit</p>
                    </div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Sub Components ---

function StatsCard({ title, value, icon, borderColor, subtext }) {
    return (
        <Card className={`bg-white/80 backdrop-blur-sm shadow-sm border-l-4 ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          </CardContent>
        </Card>
    )
}

function StatusRow({ label, count, total, color }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500">{count} ({percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} rounded-full transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function getStatusBadgeVariant(status) {
    switch(status) {
        case "Completed": return "default";
        case "Cancelled": return "destructive";
        case "Scheduled": return "secondary";
        default: return "outline";
    }
}