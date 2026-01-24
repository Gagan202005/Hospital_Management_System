import { useEffect, useState } from "react";
import { 
  Calendar, Users, CheckCircle2, Clock, Plus, CalendarDays, Activity 
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchDashboardStats } from "../../../services/operations/DoctorApi";

export default function DoctorOverview() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      setLoading(true);
      if (token) {
        try {
            const data = await fetchDashboardStats(token);
            if (data) setStats(data);
        } catch (error) {
            console.error("Stats Error", error);
        }
      }
      setLoading(false);
    };
    getStats();
  }, [token]);

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading clinical data...</div>;
  if (!stats) return <div className="p-12 text-center text-red-500">Dashboard unavailable.</div>;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-blue-700">Dr. {stats.doctorName}</span>. 
            Overview for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </div>
        <div>
            <Button onClick={() => navigate("/doctor-dashboard/appointments")} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                View Schedule
            </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Load */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Today's Visits</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.todayCount}</div>
            <p className="text-xs text-slate-500 mt-1">Scheduled appointments</p>
          </CardContent>
        </Card>

        {/* Patient Base */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.totalPatients}</div>
            <p className="text-xs text-slate-500 mt-1">Unique records</p>
          </CardContent>
        </Card>

        {/* Success Metric */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completed Consultations</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.totalCompleted}</div>
            <p className="text-xs text-slate-500 mt-1">Lifetime successful visits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Actions */}
        <Card className="shadow-sm border-slate-200 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Activity className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate("/doctor-dashboard/timeslots")} 
              className="w-full justify-start h-12 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-700 hover:border-blue-200 transition-all"
              variant="ghost"
            >
              <Plus className="h-5 w-5 mr-3 text-blue-500" />
              Manage Availability Slots
            </Button>
            <Button 
              onClick={() => navigate("/doctor-dashboard/appointments")} 
              className="w-full justify-start h-12 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-700 hover:border-blue-200 transition-all"
              variant="ghost"
            >
              <CalendarDays className="h-5 w-5 mr-3 text-purple-500" />
              Review Upcoming Schedule
            </Button>
            <Button 
              onClick={() => navigate("/doctor-dashboard/patients")} 
              className="w-full justify-start h-12 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-700 hover:border-blue-200 transition-all"
              variant="ghost"
            >
              <Users className="h-5 w-5 mr-3 text-emerald-500" />
              Access Patient Directory
            </Button>
          </CardContent>
        </Card>

        {/* Up Next List */}
        <Card className="shadow-sm border-slate-200 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Clock className="w-5 h-5 text-orange-500"/> Up Next
            </CardTitle>
            <CardDescription>Upcoming appointments in your queue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((appt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 font-bold h-10 w-10 rounded-full flex items-center justify-center">
                            {appt.patientDetails?.firstName?.[0]}
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800 block">
                                {appt.patientDetails?.firstName} {appt.patientDetails?.lastName}
                            </span>
                            <span className="text-xs text-slate-500">
                                {new Date(appt.date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold">
                       <Clock className="w-3 h-3 mr-1" />
                       {appt.timeSlot}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 border border-dashed rounded-lg bg-slate-50/50">
                  <Calendar className="w-8 h-8 mb-2 opacity-30"/>
                  <span className="text-sm">No upcoming appointments.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}