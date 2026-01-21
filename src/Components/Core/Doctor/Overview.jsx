import { useEffect, useState } from "react";
import { 
  Calendar, 
  Users, 
  CheckCircle, // Replaced UserCheck/Rating
  Clock,
  Plus,
  CalendarDays
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchDashboardStats } from "../../../services/operations/DoctorApi";

export default function DoctorOverview() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState({
    doctorName: "",
    todayCount: 0,
    totalPatients: 0,
    totalCompleted: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      setLoading(true);
      if (token) {
        const data = await fetchDashboardStats(token);
        if (data) {
          setStats(data);
        }
      }
      setLoading(false);
    };
    getStats();
  }, [token]);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, Dr. {stats.doctorName}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        {/* Total Patients */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Total patients treated</p>
          </CardContent>
        </Card>

        {/* Total Completed */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Visits</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
            <p className="text-xs text-muted-foreground">Lifetime successful visits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/doctor-dashboard/timeslots")} 
              className="w-full justify-start"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Time Slots
            </Button>
            <Button 
              onClick={() => navigate("/doctor-dashboard/appointments")} 
              className="w-full justify-start"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Appointments
            </Button>
            <Button 
              onClick={() => navigate("/doctor-dashboard/patients")} 
              className="w-full justify-start"
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Patient Records
            </Button>
          </CardContent>
        </Card>

        {/* Up Next / Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Up Next</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((appt, index) => (
                  <div key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium block">
                        {appt.patientDetails?.firstName} {appt.patientDetails?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(appt.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">
                       <Clock className="w-3 h-3 mr-1" />
                       {appt.timeSlot}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No upcoming appointments scheduled.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}