import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import StartStep from "../firstflowcompoents/StartStep";
import InvestorsStep from "../InvestorTb/InvestorsStep";
import PortfolioStep from "../PortfolioTab/PortfolioStep";
import UsersStep from "../selection/UsersStep";
import ProgressBar from "../firstflowcompoents/ProgressBar";
import AvaiableStep from "../Avilability/AvaiableStep";
import { Loader2, RotateCcw } from 'lucide-react';
import { toast } from "../../hooks/use-toast";
import { MainPage } from "../mainAdmin/MainAdmin";

const api = import.meta.env.VITE_APIURL;

export default function AdminPanelScheduler() {
  const [currentStep, setCurrentStep] = useState(0);
  const [mainComponent, setMainComponent] = useState(false);
  const [bisLoading, setbisLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { component: StartStep, key: "start", label: "Start" },
    { component: InvestorsStep, key: "investors", label: "Investors" },
    { component: PortfolioStep, key: "portfolio", label: "Portfolio" },
    { component: AvaiableStep, key: "Date & Times", label: "Date & Times" },
    { component: UsersStep, key: "pairs", label: "Pairs" },
    { component: null, key: "admin", label: "Admin Panel" },
  ];

  useEffect(() => {
    const storedMainComponent = localStorage.getItem("maincomponent");
    if (storedMainComponent === "true") {
      setMainComponent(true);
    }
  }, []);

  const scrollToNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const noslotresponse = await fetch(`${api}api/deleteall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!noslotresponse.ok) {
        throw new Error("Failed to fetch meetings");
      }
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

  const handleGenerateMeetings = async () => {
    setbisLoading(true);
    try {
      const response = await fetch(`${api}api/meetings/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalizeSchedule: true }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Meetings generated successfully.",
        });
        localStorage.setItem("maincomponent", "true");
        setMainComponent(true);
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

  if (bisLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return mainComponent ? (
    <MainPage />
  ) : (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-[#9747FF] to-white flex flex-col items-center justify-center p-4"
      style={{
        maxHeight: "100vh",
      }}
    >
      <div className="w-full max-w-6xl flex-grow flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {steps.map((Step, index) => {
            if (index === currentStep && Step.component) {
              return (
                <motion.div
                  style={{
                    maxHeight: "calc(100vh - 4rem)",
                  }}
                  key={Step.key}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    duration: 0.5,
                  }}
                >
                  <Step.component onComplete={scrollToNextStep} />
                </motion.div>
              );
            }
            return null;
          })}
        </AnimatePresence>
        {currentStep === steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              duration: 0.5,
            }}
            className="p-4 rounded-lg "
          >
            <div className="flex justify-center mt-4 flex-col items-center">
              <Button className="w-full" onClick={handleGenerateMeetings}>
                Done! Take me to admin panel
              </Button>
              <div className="flex justify-center mt-4 mb-4">OR</div>
              <Button
                onClick={fetchMeetings}
                variant="destructive"
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Re-Start from Start
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      <motion.div
        className="w-full max-w-2xl mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <ProgressBar steps={steps} currentStep={currentStep} />
      </motion.div>
    </div>
  );
}

