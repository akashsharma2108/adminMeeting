import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent, CardFooter } from "../ui/card";
import {
  Building2,
  Edit,
  Trash2,
  IdCard,
  Presentation,
  Clock9,
  CalendarCheck,
  Send,
  Ban,
  CalendarX2,
  ClockAlert,
  CalendarOff,
} from "lucide-react";
import { Search } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert"

interface Meeting {
  id: number;
  SelId: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  Selection: {
    Investor: {
      InvName: string;
      InvCompany: string;
    };
    PortfolioCompany: {
      PFCompany: string;
      PFName: string;
      PFTimezone: string;
    };
  };
}

interface UnscheduledMeeting {
  id: number;
  SelId: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  Selection: {
    Investor: {
      InvName: string;
      InvCompany: string;
      InvTimezone: string;
    };
    PortfolioCompany: {
      PFName: string;
      PFCompany: string;
      PFTimezone: string;
    };
  };
}

interface Selection {
  SelId: number;
  InvId: number;
  PFId: number;
  Investor: {
    InvName: string;
    InvCompany: string;
  };
  PortfolioCompany: {
    PFName: string;
    PFCompany: string;
  };
}
const api = import.meta.env.VITE_APIURL
export default function MeetingTab() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bisLoading, setbisLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [meetType, setMeetType] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [unscheduledMeetings, setUnscheduledMeetings] = useState<
    UnscheduledMeeting[]
  >([]);
  const [slotdMeetings, setslotdMeetings] = useState<Selection[]>([]);
  const [meetFilter, setMeetFilter] = useState<Meeting[]>([]);
  const [unmeetFilter, setUnmeetFilter] = useState<UnscheduledMeeting[]>([]);
  const [slotFilter, setSlotFilter] = useState<Selection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMeeting, setNewMeeting] = useState({
    SelId: "",
    date: "",
    startTime: "",
    endTime: "",
    duration: 60,
  });
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    invName: "",
    PFName: "",
    InvEMAIL: "",
    PFEMAIL: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (!isLoading && meetings.length > 0 && unscheduledMeetings.length > 0 && slotdMeetings.length > 0) {
      if (meetType === "Conflicts") {
        const filtered = unscheduledMeetings.filter(
          (value) =>
            value.Selection.Investor.InvName.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
            value.Selection.PortfolioCompany.PFName.toLowerCase().includes(
              searchTerm.toLowerCase()
            )
        );
        setUnmeetFilter(filtered);
      } else if (meetType === "No-Slots") {
        const filtered = slotdMeetings.filter(
          (value) =>
            value.Investor.InvName.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
            value.PortfolioCompany.PFName.toLowerCase().includes(
              searchTerm.toLowerCase()
            )
        );
        setSlotFilter(filtered);
      } else {
        const filtered = meetings.filter(
          (value) =>
            value.Selection.Investor.InvName.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
            value.Selection.PortfolioCompany.PFName.toLowerCase().includes(
              searchTerm.toLowerCase()
            )
        );
        setMeetFilter(filtered);}
        
    }
    
  }, [meetings, unscheduledMeetings, slotdMeetings , searchTerm, meetType]);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${api}api/meetings`);
      const unmeetresponse = await fetch(
        `${api}api/nonmeeting`
      );
      const noslotresponse = await fetch(
        `${api}api/meetings/unscheduled`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }
      const data = await response.json();
      const undata = await unmeetresponse.json();
      const slotdata = await noslotresponse.json();
      setMeetings(data);
      setUnscheduledMeetings(undata);
      setslotdMeetings(slotdata);
    } catch (err) {
      setError("Error fetching meetings. Please try again.");
      console.error("Error fetching meetings:", err);
      toast({
        title: "Error",
        description: "Failed to fetch meetings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlemail = (meeting: any) => {
    setEmailData({
      invName: meeting.Selection.Investor.InvName,
      PFName: meeting.Selection.PortfolioCompany.PFName,
      InvEMAIL: "testmail@gmail.com",
      PFEMAIL: "testmail1@gmail.com",
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
    });
    setIsEmailDialogOpen(true);
  }

  const handleSendMail = async () => {
    setbisLoading(true);
    try {
      const response = await fetch(`${api}api/mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email sent successfully.",
        });
        setIsEmailDialogOpen(false);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setbisLoading(false);
    }
  };

  const handleSubmit = async () => {
    setbisLoading(true);
    try {
      const response = await fetch(`${api}api/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeeting),
      });

      if (response.ok) {
        await fetchMeetings();
        setIsAddDialogOpen(false);
        setNewMeeting({
          SelId: "",
          date: "",
          startTime: "",
          endTime: "",
          duration: 60,
        });
        toast({
          title: "Success",
          description: "Meeting added successfully.",
        });
      } else {
        throw new Error("Failed to add meeting");
      }
    } catch (error) {
      console.error("Error adding meeting:", error);
      toast({
        title: "Error",
        description: "Failed to add meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setbisLoading(false);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsEditDialogOpen(true);
  };


  const handleEditSubmit = async () => {
    setbisLoading(true);
    if (!editingMeeting) return;

    try {
      const response = await fetch(
        `${api}api/meetings/${editingMeeting.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            SelId: editingMeeting.SelId,
            date: editingMeeting.date,
            startTime: editingMeeting.startTime,
            endTime: editingMeeting.endTime,
            duration: editingMeeting.duration,
          }),
        }
      );

      if (response.ok) {
        await fetchMeetings();
        setIsEditDialogOpen(false);
        setEditingMeeting(null);
        toast({
          title: "Success",
          description: "Meeting updated successfully.",
        });
      } else {
        throw new Error("Failed to update meeting");
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to update meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setbisLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setbisLoading(true);
    try {
      const response = await fetch(`${api}api/meetings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMeetings(meetings.filter((meeting) => meeting.id !== id));
        toast({
          title: "Success",
          description: "Meeting deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete meeting");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast({
        title: "Error",
        description: "Failed to delete meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setbisLoading(false);
    }
  };

  const handleGenerateMeetings = async () => {
    setbisLoading(true);
    try {
      const response = await fetch(
        `${api}api/meetings/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finalizeSchedule: true }),
        }
      );

      if (response.ok) {
        await fetchMeetings();
        toast({
          title: "Success",
          description: "Meetings generated successfully.",
        });
      } else {
        throw new Error("Failed to generate meetings");
      }
    } catch (error) {
      console.error("Error generating meetings:", error);
      toast({
        title: "Error",
        description: "Failed to generate meetings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setbisLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    setbisLoading(true);
    const headers = [
      "ID",
      "Selection ID",
      "Start Time",
      "End Time",
      "Date",
      "Investor Name",
      "Investor Company",
      "Portfolio Company",
      "Portfolio Timezone",
    ];
    const csvContent = [
      headers.join(","),
      ...meetings.map((meeting) =>
        [
          meeting.id,
          meeting.SelId,
          meeting.startTime,
          meeting.endTime,
          meeting.date,
          meeting.Selection.Investor.InvName,
          meeting.Selection.Investor.InvCompany,
          meeting.Selection.PortfolioCompany.PFCompany,
          meeting.Selection.PortfolioCompany.PFName,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "meetings.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setbisLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="mb-4">No data found.</p>
        {bisLoading ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <Button onClick={handleGenerateMeetings}>Generate Meetings</Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Meetings</h2>
          <span className="text-lg text-gray-500">
            Total Meetings:{" "}
            {meetings.length +
              unscheduledMeetings.length +
              slotdMeetings.length}
          </span>
        </div>

        <div className="space-x-2">
          {bisLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : meetType === "Conflicts" ? (
            <Button onClick={() => setMeetType("Scheduled")}>Scheduled</Button>
          ) : (
            <Button
              onClick={() => {
                setMeetType("Conflicts");
              }}
            >
              Unscheduled
            </Button>
          )}
          {bisLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : meetType === "No-Slots" ? (
            <Button onClick={() => setMeetType("Scheduled")}>Scheduled</Button>
          ) : (
            <Button
              onClick={() => {
                setMeetType("No-Slots");
              }}
            >
              No-Slots
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
        <div className="space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>Add Meeting</Button>
          {bisLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Button onClick={handleGenerateMeetings}>Generate Meetings</Button>
          )}
          {bisLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Button onClick={handleDownloadCSV}>Download CSV</Button>
          )}
          {bisLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Button onClick={() => {}} disabled>
              Send Mail To All
            </Button>
          )}
        </div>
      </div>
      {meetType === "Conflicts" ? (
        <p className="text-sm text-gray-700 mb-4">
          *Note : Unscheduled Meetings are the meetings which are not scheduled
          due to conflicts. Add more time slots to resolve conflicts.
        </p>
      ) : meetType === "No-Slots" ? (
        <p className="text-sm text-gray-700 mb-4">
          *Note : No-Slot available meetings are the meetings which are not
          scheduled due to no available time slots for Investor or Portfolios. Add more time slots to
          resolve conflicts.
        </p>
      ) : (
        <p className="text-sm text-gray-700 mb-4">
          Scheduled Meetings: {meetings.length} | Unscheduled Overlapping
          Meetings: {unscheduledMeetings.length} | No-Slot available :{" "}
          {slotdMeetings.length}
        </p>
      )}
      {meetType === "Conflicts" ? 
        <>
        <div
          style={{
            overflowX: "auto",
            height: "calc(100vh - 400px)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unmeetFilter.map((meetings) => (
              <Card key={meetings.id} className="flex flex-col">
                <CardContent className="flex-grow p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        <Ban />
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold">
                      {meetings.Selection.PortfolioCompany.PFName.split(" ")[0]}{" "}
                      <span className="text-gray-500">meeting with </span>
                      {meetings.Selection.Investor.InvName.split(" ")[0]}
                    </h3>
                  </div>
                  <div className="flex items-center mb-2">
                    <IdCard className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      {" "}
                      Meeting Room ID:{" "}
                      <span className="font-semibold">NA</span> &
                      Selection ID:{" "}
                      <span className="font-semibold">{meetings.SelId}</span>{" "}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <CalendarX2 className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                    Conflict on{" "}
                      <span className="font-semibold">{meetings.date}</span>{" "}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <ClockAlert className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                    Conflict From{" "}
                      <span className="font-semibold">
                        {meetings.startTime}
                      </span>{" "}
                      To{" "}
                      <span className="font-semibold">{meetings.endTime}</span>{" "}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Building2 className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                     B/W{" "}
                      <span className="font-semibold">
                        {meetings.Selection.PortfolioCompany.PFCompany}
                      </span>{" "}
                      {" "}
                      <span className="font-semibold">
                        {meetings.Selection.Investor.InvCompany}
                      </span>
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 p-4 bg-gray-50">
                  {bisLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Button
                      style={{
                        backgroundColor: "green",
                      }}
                      size="sm"
                      onClick={() => {}}
                      disabled
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Mail
                    </Button>
                  )}

                  {bisLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(meetings)}
                      disabled
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {bisLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(meetings.id)}
                      disabled
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </> : meetType === "No-Slots" ? 
      <>
      <div
            style={{
              overflowX: "auto",
              height: "calc(100vh - 400px)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slotFilter.map((selection) => (
                <Card key={selection.SelId} className="flex flex-col">
                  <CardContent className="flex-grow p-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          <CalendarOff />
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-semibold">
                        {selection.PortfolioCompany.PFName.split(" ")[0]}{" "}
                        <span className="text-gray-500">paired with </span>
                        {selection.Investor.InvName.split(" ")[0]}
                      </h3>
                    </div>
                    <div className="flex items-center mb-2">
                      <IdCard className="h-5 w-5 mr-2 text-gray-500" />
                      <span>
                        {" "}
                        Selection ID:{" "}
                        <span className="font-semibold">{selection.SelId}</span>
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <IdCard className="h-5 w-5 mr-2 text-gray-500" />
                      <span>
                        Portfolio Company ID:{" "}
                        <span className="font-semibold">{selection.PFId}</span>{" "}
                        & Investor ID:{" "}
                        <span className="font-semibold">{selection.InvId}</span>{" "}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                    <CalendarX2 className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                    Conflict on{" "}
                      <span className="font-semibold">NA</span>{" "}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <ClockAlert className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                    Conflict From{" "}
                      <span className="font-semibold">
                       NA
                      </span>{" "}
                      To{" "}
                      <span className="font-semibold">NA</span>{" "}
                    </span>
                  </div>
                    <div className="flex items-center mb-2">
                      <Building2 className="h-5 w-5 mr-2 text-gray-500" />
                      <span>
                        {" "}
                        <span className="font-semibold">
                          {selection.PortfolioCompany.PFCompany}
                        </span>{" "}
                        paired with{" "}
                        <span className="font-semibold">
                          {selection.Investor.InvCompany}
                        </span>
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 p-4 bg-gray-50">
                  {bisLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Button
                      style={{
                        backgroundColor: "green",
                      }}
                      size="sm"
                      onClick={() => {}}
                      disabled
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Mail
                    </Button>
                  )}
                    {bisLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {}}
                        disabled
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {bisLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {}}
                        disabled
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
      
      
      </>  
      : 
        <>
        <div
          style={{
            overflowX: "auto",
            height: "calc(100vh - 400px)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetFilter.map((meetings) => (
              <Card key={meetings.id} className="flex flex-col">
                <CardContent className="flex-grow p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        <Presentation />
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold">
                      {meetings.Selection.PortfolioCompany.PFName.split(" ")[0]}{" "}
                      <span className="text-gray-500">meeting with </span>
                      {meetings.Selection.Investor.InvName.split(" ")[0]}
                    </h3>
                  </div>
                  <div className="flex items-center mb-2">
                    <IdCard className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      {" "}
                      Meeting Room ID:{" "}
                      <span className="font-semibold">{meetings.id}</span> &
                      Selection ID:{" "}
                      <span className="font-semibold">{meetings.SelId}</span>{" "}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <CalendarCheck className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      When{" "}
                      <span className="font-semibold">{meetings.date}</span>{" "}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock9 className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      From{" "}
                      <span className="font-semibold">
                        {meetings.startTime}
                      </span>{" "}
                      To{" "}
                      <span className="font-semibold">{meetings.endTime}</span>{" "}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Building2 className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      {" "}
                      <span className="font-semibold">
                        {meetings.Selection.PortfolioCompany.PFCompany}
                      </span>{" "}
                      B/W{" "}
                      <span className="font-semibold">
                        {meetings.Selection.Investor.InvCompany}
                      </span>
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 p-4 bg-gray-50">
                  {bisLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Button
                      style={{
                        backgroundColor: "green",
                      }}
                      size="sm"
                      onClick={() => handlemail(meetings)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Mail
                    </Button>
                  )}

                  {bisLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(meetings)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {bisLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(meetings.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </>}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sel-id" className="text-right">
                Selection ID
              </Label>
              <Input
                id="sel-id"
                value={newMeeting.SelId}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, SelId: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <DatePicker
                  selected={
                    newMeeting.date ? new Date(newMeeting.date) : undefined
                  }
                  onSelect={(date) =>
                    setNewMeeting({
                      ...newMeeting,
                      date: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
                  className="rounded-md border"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right">
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={newMeeting.startTime}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, startTime: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time" className="text-right">
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={newMeeting.endTime}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, endTime: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            {bisLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Button onClick={handleSubmit}>Add Meeting</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          {editingMeeting && (
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sel-id" className="text-right">
                  Selection ID
                </Label>
                <Input
                  id="edit-sel-id"
                  value={editingMeeting.SelId}
                  onChange={(e) =>
                    setEditingMeeting({
                      ...editingMeeting,
                      SelId: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <DatePicker
                    selected={new Date(editingMeeting.date)}
                    onSelect={(date) =>
                      setEditingMeeting({
                        ...editingMeeting,
                        date: date
                          ? format(date, "yyyy-MM-dd")
                          : editingMeeting.date,
                      })
                    }
                    className="rounded-md border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start-time" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={editingMeeting.startTime}
                  onChange={(e) =>
                    setEditingMeeting({
                      ...editingMeeting,
                      startTime: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end-time" className="text-right">
                  End Time
                </Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={editingMeeting.endTime}
                  onChange={(e) =>
                    setEditingMeeting({
                      ...editingMeeting,
                      endTime: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              {bisLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Button onClick={handleEditSubmit}>Update Meeting</Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>


      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive" >
            <AlertDescription>
              Please replace the mail IDs for both the investor and portfolio with working mail IDs so that you can see how mail is working.
            </AlertDescription>
          </Alert>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invName" className="text-right">
                Investor Name
              </Label>
              <Input
                id="invName"
                value={emailData.invName}
                onChange={(e) => setEmailData({ ...emailData, invName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="PFName" className="text-right">
                Portfolio Name
              </Label>
              <Input
                id="PFName"
                value={emailData.PFName}
                onChange={(e) => setEmailData({ ...emailData, PFName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="InvEMAIL" className="text-right">
                Investor Email
              </Label>
              <Input
                id="InvEMAIL"
                value={emailData.InvEMAIL}
                onChange={(e) => setEmailData({ ...emailData, InvEMAIL: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="PFEMAIL" className="text-right">
                Portfolio Email
              </Label>
              <Input
                id="PFEMAIL"
                value={emailData.PFEMAIL}
                onChange={(e) => setEmailData({ ...emailData, PFEMAIL: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={emailData.date}
                onChange={(e) => setEmailData({ ...emailData, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={emailData.startTime}
                onChange={(e) => setEmailData({ ...emailData, startTime: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={emailData.endTime}
                onChange={(e) => setEmailData({ ...emailData, endTime: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSendMail} disabled={bisLoading}>
              {bisLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
