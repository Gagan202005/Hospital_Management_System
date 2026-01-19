import { useState } from "react";
import { Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { useToast } from "../../../hooks/use-toast";

export function DoctorStatusManager() {
  const [currentStatus, setCurrentStatus] = useState("Active");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [reason, setReason] = useState("");
  const [statusHistory, setStatusHistory] = useState([
    {
      id: "1",
      status: "Active",
      changedAt: new Date(2024, 0, 1),
    }
  ]);
  const { toast } = useToast();

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "On Leave":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Resigned":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Active":
        return "default";
      case "On Leave":
        return "secondary";
      case "Resigned":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleStatusChange = () => {
    if (selectedStatus === currentStatus) {
      toast({
        title: "No Change",
        description: "Status is already set to " + currentStatus,
        variant: "destructive",
      });
      return;
    }

    const historyEntry = {
      id: Date.now().toString(),
      status: selectedStatus,
      reason: reason || undefined,
      changedAt: new Date(),
    };

    setStatusHistory([historyEntry, ...statusHistory]);
    setCurrentStatus(selectedStatus);
    setReason("");

    toast({
      title: "Status Updated",
      description: `Your status has been changed to ${selectedStatus}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Status Management</h1>
        <Badge variant={getStatusBadgeVariant(currentStatus)} className="text-sm px-3 py-1">
          {getStatusIcon(currentStatus)}
          <span className="ml-2">{currentStatus}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Update Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="Active" id="active" />
                <Label htmlFor="active" className="flex items-center gap-3 cursor-pointer flex-1">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Active</p>
                    <p className="text-sm text-muted-foreground">Available for appointments and consultations</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="On Leave" id="onleave" />
                <Label htmlFor="onleave" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">On Leave</p>
                    <p className="text-sm text-muted-foreground">Temporarily unavailable for new appointments</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="Resigned" id="resigned" />
                <Label htmlFor="resigned" className="flex items-center gap-3 cursor-pointer flex-1">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Resigned</p>
                    <p className="text-sm text-muted-foreground">No longer practicing at this facility</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for status change..."
                rows={3}
              />
            </div>

            <Button onClick={handleStatusChange} className="w-full">
              Update Status
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusHistory.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-start gap-4 p-4 border border-border rounded-lg ${
                    index === 0 ? "bg-accent/30" : ""
                  }`}
                >
                  {getStatusIcon(entry.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.changedAt.toLocaleDateString()}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-muted-foreground mt-2">{entry.reason}</p>
                    )}
                    {index === 0 && (
                      <Badge variant="outline" className="mt-2">Current</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}