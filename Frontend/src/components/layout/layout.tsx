// import React from 'react'
// import { Toaster } from "../ui/toaster"
// import { toast } from '../../hooks/use-toast';
// import { Button } from "../ui/button";
// import {
//   RotateCcw
// } from "lucide-react";

// interface LayoutProps {
//   children: React.ReactNode
// }

// const api = import.meta.env.VITE_APIURL
// export function Layout({ children }: LayoutProps) {

//   const [IsLoading, setIsLoading] = React.useState(false);


//   const fetchMeetings = async () => {
//     setIsLoading(true);
//     try {
//       const noslotresponse = await fetch(
//         `${api}api/deleteall`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       if (!noslotresponse.ok) {
//         throw new Error("Failed to fetch meetings");
//       }
//       // refresh the application
//       window.location.reload();

//     } catch (err) {
//       console.error("Error fetching meetings:", err);
//       toast({
//         title: "Error",
//         description: "Failed to fetch meetings. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   return (
//     <div className="min-h-screen w-full bg-gradient-to-b from-[#9747FF] to-white flex items-center justify-center p-4">
//       <div className="container mx-auto p-4 bg-white rounded-lg shadow-xl">
//         <div className="flex justify-between items-center" style={{
//           padding: "10px"
//         }}>
//         <h1 className="text-2xl font-bold mb-4 text-purple-800">Meeting Scheduler Admin Panel</h1> 
//         <Button onClick={fetchMeetings} variant="destructive" disabled={IsLoading}>
//         <RotateCcw className="h-4 w-4 mr-1" />
//             Reset All Data
//           </Button>
//         </div>
//         {children}
     
//         <Toaster />
//       </div>
//     </div>
//   )
// }

