import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import CalendarView from "../firstflowcompoents/MeetingClander/MeetingClander";

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

const api = import.meta.env.VITE_APIURL;

export default function UnscheduledMeetingsTab() {
  const [isLoading, setIsLoading] = useState(true);

  const [, setError] = useState<string | null>(null);
  const [unscheduledMeetings, setUnscheduledMeetings] = useState<
    UnscheduledMeeting[]
  >([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const unmeetresponse = await fetch(`${api}api/nonmeeting`);
      // const noslotresponse = await fetch(`${api}api/meetings/unscheduled`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //  });
      const undata = await unmeetresponse.json();
      //const slotdata = await noslotresponse.json();
      setUnscheduledMeetings(undata);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <CalendarView
        meetings={unscheduledMeetings}
        onEdit={() => {}}
        onDelete={() => {}}
        onSendMail={() => {}}
        onGenerate={() => {}}
        disabled={true}
      />
    </>
  );
}
