import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Users, Stethoscope, Bed, Truck, Activity, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress"; // Assuming you have a progress component, or use standard HTML

export const OverviewSection = () => {
  return (
    <div className="space-y-6">
      {/* 1. Top Level KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">1,284</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">↑ 12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Doctors On Duty</CardTitle>
            <Stethoscope className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">42</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of 67 total staff
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Critical Beds</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">18/20</div>
            <p className="text-xs text-red-600 font-medium mt-1">
              ICU is 90% Full
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Ambulance Status</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">3 Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              5 Available at base
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Middle Section: Capacity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Ward Capacity (Visual) */}
        <Card className="col-span-1 lg:col-span-2 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-gray-500" />
              Ward Capacity Status
            </CardTitle>
            <CardDescription>Live occupancy tracking across departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: "General Ward", current: 45, max: 60, color: "bg-blue-500" },
              { name: "Emergency (ER)", current: 12, max: 15, color: "bg-red-500" },
              { name: "ICU", current: 18, max: 20, color: "bg-red-600" },
              { name: "Maternity", current: 8, max: 20, color: "bg-pink-500" },
              { name: "Pediatrics", current: 15, max: 30, color: "bg-yellow-500" },
            ].map((ward, i) => {
               const percentage = Math.round((ward.current / ward.max) * 100);
               return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{ward.name}</span>
                    <span className="text-gray-500">{ward.current}/{ward.max} Beds ({percentage}%)</span>
                  </div>
                  {/* Custom Progress Bar Implementation */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${ward.color} rounded-full transition-all duration-500`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
               )
            })}
          </CardContent>
        </Card>

        {/* Right: Urgent Action Items */}
        <Card className="bg-white/80 backdrop-blur-sm border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Urgent Alerts
            </CardTitle>
            <CardDescription>Requires immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Low Oxygen Supply</p>
                  <p className="text-xs text-red-700">ICU Block B oxygen tank below 15%</p>
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs border-red-200 text-red-700 hover:bg-red-100">Notify Staff</Button>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-orange-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-900">Ambulance Maintenance</p>
                  <p className="text-xs text-orange-700">Vehicle AMB-04 due for service today</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">New Staff Review</p>
                  <p className="text-xs text-blue-700">2 Nurse applications pending approval</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Bottom Section: On-Call Doctors Summary */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Current Shift - Doctors On Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
                { name: "Dr. Sarah Wilson", dept: "Cardiology", status: "In Surgery", time: "08:00 - 16:00" },
                { name: "Dr. James Chen", dept: "Emergency", status: "Available", time: "12:00 - 20:00" },
                { name: "Dr. Emily Parker", dept: "Pediatrics", status: "On Rounds", time: "09:00 - 17:00" },
            ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {doc.name.charAt(4)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.dept}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="text-xs mb-1">{doc.status}</Badge>
                        <p className="text-[10px] text-gray-500">{doc.time}</p>
                    </div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};