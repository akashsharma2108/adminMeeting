import { useState } from "react";
import { Toaster } from "../ui/toaster";
import { toast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import {
  RotateCcw,
  CircleUserRound,
  Building2,
  Calendar,
  Workflow,
  Presentation,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import MeetingTab from "../Meeting/Meetintab";
import UnscheduledMeetingsTab from "../Meeting/Conflictmeetings";
import NoSlotTab from "../Meeting/Noslot";
import UsersStep from "../selection/UsersStep";
import AvaiableStep from "../Avilability/AvaiableStep";
import PortfolioStep from "../PortfolioTab/PortfolioStep";
import InvestorsStep from "../InvestorTb/InvestorsStep";

const api = import.meta.env.VITE_APIURL;

export function MainPage() {
  const [activeTab, setActiveTab] = useState("scheduler");
  const [activeSubTab, setActiveSubTab] = useState("schedle");
  const [IsLoading, setIsLoading] = useState(false);
  const [totalMettings, setTotalMettings] = useState(0);
  const [conflicts, setConflicts] = useState(0);
  const [noSlots, setNoSlots] = useState(0);

  const deltealldata = async () => {
    setIsLoading(true);
    try {
      const noslotresponse = await fetch(`${api}api/deleteall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!noslotresponse.ok) {
        throw new Error("Failed to fetch meetings");
      }
        localStorage.clear();
      window.location.reload();
    } catch (err) {
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

  const handleDataFromChild = (value: any) => {
    setTotalMettings(value.toatlmeeting);
    setConflicts(value.conflicts);
    setNoSlots(value.noSlots);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#9747FF] to-white p-4">
      <div className="w-full">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-purple-800">
            Meeting Scheduler Admin Panel
          </h1>
          <Button
            onClick={deltealldata}
            variant="destructive"
            disabled={IsLoading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset All Data
          </Button>
        </div>
        <div className="flex h-[calc(100vh-120px)]">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex w-full h-full"
            style={{
              gap: "5px",
            }}
          >
            <TabsList
              className="flex flex-col justify-center gap-1 w-1/5 h-full p-2 rounded-l-lg"
              style={{
                textAlign: "left",
                color: "black",
                alignItems: "flex-start",
                background: "transparent",
              }}
            >
              <TabsTrigger
                value="investors"
                style={{
                  textAlign: "left",
                }}
              >
                {" "}
                <CircleUserRound className="h-4 w-4 mr-1" /> Investors
              </TabsTrigger>
              <TabsTrigger value="portfolio">
                {" "}
                <Building2 className="h-4 w-4 mr-1" /> Portfolio Companies
              </TabsTrigger>
              <TabsTrigger value="availability">
                {" "}
                <Calendar className="h-4 w-4 mr-1" /> Availability Slots
              </TabsTrigger>
              <TabsTrigger value="selection">
                <Workflow className="h-4 w-4 mr-1" /> Selection
              </TabsTrigger>
              <TabsTrigger value="scheduler">
                {" "}
                <Presentation className="h-4 w-4 mr-1" /> Meeting Scheduler
              </TabsTrigger>
            </TabsList>
            <div
              className="w-4/5 rounded-r-lg p-4 overflow-auto "
              style={{
                background: "white",
              }}
            >
              <TabsContent value="investors">
                <InvestorsStep onComplete={() => {}} whatpage="main" />
              </TabsContent>
              <TabsContent value="portfolio">
                <PortfolioStep onComplete={() => {}} whatpage="main" />
              </TabsContent>
              <TabsContent value="availability">
                <AvaiableStep onComplete={() => {}} whatpage="main" />
              </TabsContent>
              <TabsContent value="selection">
                <UsersStep onComplete={() => {}} whatpage="main" />
              </TabsContent>
              <TabsContent value="scheduler">
                <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
                  <TabsList>
                    <TabsTrigger value="schedle">
                      Meeting {totalMettings}
                    </TabsTrigger>
                    <TabsTrigger value="conflict">
                      conflicts {conflicts}
                    </TabsTrigger>
                    <TabsTrigger value="Noslot">No-slot {noSlots}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="schedle">
                    <MeetingTab
                      sendDataToParent={handleDataFromChild}
                      page={activeSubTab}
                    />
                  </TabsContent>
                  <TabsContent value="conflict">
                    <UnscheduledMeetingsTab />
                  </TabsContent>
                  <TabsContent value="Noslot">
                    <NoSlotTab />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <Toaster />
      </div>
    </div>
  );
}
