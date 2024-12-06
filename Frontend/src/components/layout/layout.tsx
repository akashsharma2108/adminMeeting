import React from 'react'
import { Toaster } from "../ui/toaster"
import { toast } from '../../hooks/use-toast';
import { Button } from "../ui/button";
import {
  RotateCcw
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode
}


export function Layout({ children }: LayoutProps) {

  const [IsLoading, setIsLoading] = React.useState(false);


  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const noslotresponse = await fetch(
        "http://localhost:4000/api/deleteall",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!noslotresponse.ok) {
        throw new Error("Failed to fetch meetings");
      }
      // refresh the application
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
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center" style={{
          padding: "10px"
        }}>
        <h1 className="text-2xl font-bold mb-4 text-purple-800">Meeting Scheduler Admin Panel</h1> 
        <Button onClick={fetchMeetings} variant="destructive" disabled={IsLoading}>
        <RotateCcw className="h-4 w-4 mr-1" />
            Reset All Data
          </Button>
        </div>
        {children}
     
        <Toaster />
      </div>
    </div>
  )
}

