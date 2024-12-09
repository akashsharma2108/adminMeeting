import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";

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

const api = import.meta.env.VITE_APIURL;

export default function NoSlotTab() {
  const [isLoading, setIsLoading] = useState(true);

  const [, setError] = useState<string | null>(null);
  const [slotdMeetings, setslotdMeetings] = useState<Selection[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const noslotresponse = await fetch(`${api}api/meetings/unscheduled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const slotdata = await noslotresponse.json();
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

  const getFixedGradient = (index: number) => {
    const gradients = [
      "bg-gradient-to-r from-pink-500 to-purple-500",
      "bg-gradient-to-r from-cyan-500 to-blue-500",
      "bg-gradient-to-r from-green-400 to-teal-500",
      "bg-gradient-to-r from-orange-500 to-red-500",
      "bg-gradient-to-r from-indigo-500 to-purple-500",
    ];
    return gradients[index % 5];
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
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
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slotdMeetings.map((selections, index) => (
            <Card
              key={selections.SelId}
              className={`relative h-[380px] flex flex-col`}
              style={{
                padding: "0px",
              }}
              onClick={() => {}}
            >
              <button
                disabled={true}
                className="absolute right-1 top-0 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
              <CardHeader>
                <div
                  className={`${getFixedGradient(
                    index
                  )} h-32 rounded-t-lg flex items-center justify-center p-0`}
                >
                  <Avatar className="h-20 w-20 border-4 border-white">
                    <AvatarFallback>
                      {getInitials(selections.Investor.InvName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent className="text-left space-y-2">
                <h3 className="font-semibold text-xl truncate">
                  {selections.Investor.InvName} -{" "}
                  {selections.PortfolioCompany.PFName}
                </h3>
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {selections.Investor.InvCompany} -{" "}
                  {selections.PortfolioCompany.PFCompany}
                </p>
                <p className="text-sm line-clamp-3">
                  {selections.Investor.InvName} from{" "}
                  {selections.Investor.InvCompany} is paired with{" "}
                  {selections.PortfolioCompany.PFName} from{" "}
                  {selections.PortfolioCompany.PFCompany}
                </p>
              </CardContent>
              <CardFooter className="flex justify-left mt-auto">
                <Button disabled={true}>Edit Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
