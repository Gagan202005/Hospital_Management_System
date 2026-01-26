import { useEffect, useState } from "react";
import { 
    Users, Stethoscope, Calendar, IndianRupee, Activity, Clock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useSelector } from "react-redux";
import { fetchAdminStats } from "../../../services/operations/AdminApi";

// --- CHANGED: Added 'Sector' for the custom active shape ---
import { 
    PieChart, Pie, Sector, Cell, ResponsiveContainer 
} from "recharts";

export const OverviewSection = () => {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for Chart Interactivity
  const [activeIndex, setActiveIndex] = useState(0);

  // --- Data Fetching ---
  useEffect(() => {
    const getStats = async () => {
      setLoading(true);
      if (token) {
        try {
            const data = await fetchAdminStats(token);
            if (data) setStats(data);
        } catch (error) {
            console.error("STATS ERROR:", error);
            // Since this is just loading stats, we might not want to toast error on load,
            // but we log the specific backend message for debugging.
            const message = error.response?.data?.message || error.message;
            console.log("Details:", message);
        }
      }
      setLoading(false);
    };
    getStats();
  }, [token]);

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Initializing Dashboard...</div>;
  if (!stats) return <div className="p-12 text-center text-red-500">System data unavailable.</div>;

  // --- PREPARE DATA ---
  const chartData = [
    { name: "Completed", value: stats.appointmentStats.completed, color: "#10b981" }, // Emerald
    { name: "Scheduled", value: stats.appointmentStats.scheduled, color: "#3b82f6" }, // Blue
    { name: "Cancelled", value: stats.appointmentStats.cancelled, color: "#ef4444" }, // Red
  ];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // --- CUSTOM ACTIVE SHAPE (The "Grow" Effect) ---
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
      <g>
        {/* Center Text */}
        <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#334155" className="text-sm font-semibold">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#94a3b8" className="text-xs">
          {`${(percent * 100).toFixed(1)}%`}
        </text>

        {/* The Active Slice (Slightly larger) */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6} // Makes it pop out
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          cornerRadius={6} // Rounded edges
        />
        {/* The Outer Glow Ring */}
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 12}
          fill={fill}
          opacity={0.3} // Faded ring
          cornerRadius={10}
        />
      </g>
    );
  };

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
            value={`₹${stats.counts.revenue.toLocaleString()}`} 
            icon={<IndianRupee className="h-5 w-5 text-emerald-600" />} 
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

        {/* --- INTERACTIVE DONUT CHART SECTION --- */}
        <Card className="shadow-sm border-slate-200 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Activity className="w-5 h-5 text-slate-500" />
              Workflow Status
            </CardTitle>
            <CardDescription>Hover over segments for details.</CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
            {chartData.every(d => d.value === 0) ? (
                <div className="text-slate-400 text-sm">No appointment data available yet.</div>
            ) : (
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape} // Uses the custom shape defined above
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65} // Donut style
                                outerRadius={85}
                                paddingAngle={4} // Gap between slices
                                dataKey="value"
                                onMouseEnter={onPieEnter} // Triggers the animation
                                cornerRadius={6} // Rounded edges
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Manual Legend for clarity */}
                    <div className="flex justify-center gap-6 mt-2">
                        {chartData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
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

function getStatusBadgeVariant(status) {
    switch(status) {
        case "Completed": return "default"; // Black/Dark
        case "Cancelled": return "destructive"; // Red
        case "Scheduled": return "secondary"; // Gray
        default: return "outline";
    }
}