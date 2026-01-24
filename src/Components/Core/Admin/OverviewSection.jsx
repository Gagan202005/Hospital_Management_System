import { useEffect, useState } from "react";
import { 
    Users, Stethoscope, Calendar, DollarSign, Activity, Clock 
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

  // --- Data Fetching ---
  useEffect(() => {
    const getStats = async () => {
      setLoading(true);
      if (token) {
        try {
            const data = await fetchAdminStats(token);
            if (data) setStats(data);
        } catch (error) {
            console.error("Failed to load admin stats", error);
        }
      }
      setLoading(false);
    };
    getStats();
  }, [token]);

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Initializing Dashboard...</div>;
  if (!stats) return <div className="p-12 text-center text-red-500">System data unavailable.</div>;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500">Real-time metrics for hospital operations.</p>
      </div>

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
            title="Total Patients" 
            value={stats.counts.patients} 
            icon={<Users className="h-5 w-5 text-blue-600" />} 
            color="border-l-blue-500"
            subtext="Registered accounts"
        />
        <StatsCard 
            title="Medical Staff" 
            value={stats.counts.doctors} 
            icon={<Stethoscope className="h-5 w-5 text-teal-600" />} 
            color="border-l-teal-500"
            subtext="Active practitioners"
        />
        <StatsCard 
            title="Total Bookings" 
            value={stats.counts.appointments} 
            icon={<Calendar className="h-5 w-5 text-purple-600" />} 
            color="border-l-purple-500"
            subtext="Lifetime appointments"
        />
        <StatsCard 
            title="Revenue Generated" 
            value={`$${stats.counts.revenue.toLocaleString()}`} 
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />} 
            color="border-l-emerald-500"
            subtext="Consultation fees collected"
        />
      </div>

      {/* 2. Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Log */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Clock className="w-5 h-5 text-slate-500" />
              Latest Appointments
            </CardTitle>
            <CardDescription>Recent bookings across all departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {stats.recentAppointments.length > 0 ? (
                    stats.recentAppointments.map((apt) => (
                        <div key={apt._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-all">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border border-white shadow-sm">
                                    <AvatarImage src={apt.patient?.image} />
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{apt.patient?.firstName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : "Unknown Patient"}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Stethoscope className="w-3 h-3"/> Dr. {apt.doctor?.lastName} ({apt.doctor?.department})
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant={getStatusBadgeVariant(apt.status)} className="mb-1">{apt.status}</Badge>
                                <p className="text-xs text-slate-400 font-medium">{new Date(apt.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-400 border border-dashed rounded-lg">No recent activity.</div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Activity className="w-5 h-5 text-slate-500" />
              Workflow Status
            </CardTitle>
            <CardDescription>Appointment lifecycle metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StatusRow label="Completed" count={stats.appointmentStats.completed} total={stats.counts.appointments} color="bg-emerald-500" />
            <StatusRow label="Scheduled" count={stats.appointmentStats.scheduled} total={stats.counts.appointments} color="bg-blue-500" />
            <StatusRow label="Cancelled" count={stats.appointmentStats.cancelled} total={stats.counts.appointments} color="bg-red-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Sub Components ---
function StatsCard({ title, value, icon, color, subtext }) {
    return (
        <Card className={`shadow-sm border-slate-200 border-l-4 ${color}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{value}</div>
            <p className="text-xs text-slate-400 mt-1">{subtext}</p>
          </CardContent>
        </Card>
    )
}

function StatusRow({ label, count, total, color }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-slate-500 font-mono">{count} ({percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

function getStatusBadgeVariant(status) {
    switch(status) {
        case "Completed": return "default"; // Black/Dark
        case "Cancelled": return "destructive"; // Red
        case "Scheduled": return "secondary"; // Gray
        default: return "outline";
    }
}