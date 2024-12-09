import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2, Plus, Minus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "../../hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import InvestorCards from "../firstflowcompoents/Cards/investorcard";
interface Investor {
  InvId: string;
  InvName: string;
  InvEmail: string;
  InvCompany: string;
  InvTimezone: string;
}

interface ManualEntry {
  InvName: string;
  InvEmail: string;
  InvCompany: string;
  InvTimezone: string;
}

interface investorStepProps {
  onComplete: () => void;
  whatpage?: string;
}
const api = import.meta.env.VITE_APIURL;
export default function InvestorsStep({
  onComplete,
  whatpage,
}: investorStepProps) {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setbisLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([
    { InvName: "", InvCompany: "", InvTimezone: "", InvEmail: "" },
  ]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { toast } = useToast();

  const fetchInvestors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${api}api/investors`);
      if (!response.ok) {
        throw new Error("Failed to fetch investors");
      }
      const data = await response.json();
      setInvestors(data);
    } catch (err) {
      console.error("Error fetching investors:", err);
      toast({
        title: "Error",
        description: "Failed to fetch investors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchInvestors();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setCsvFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  const handleManualEntryChange = (
    index: number,
    field: keyof ManualEntry,
    value: string
  ) => {
    const updatedEntries = [...manualEntries];
    updatedEntries[index][field] = value;
    setManualEntries(updatedEntries);
  };

  const addManualEntry = () => {
    setManualEntries([
      ...manualEntries,
      { InvName: "", InvCompany: "", InvTimezone: "", InvEmail: "" },
    ]);
  };

  const removeManualEntry = (index: number) => {
    const updatedEntries = manualEntries.filter((_, i) => i !== index);
    setManualEntries(updatedEntries);
  };

  const handleSubmit = async () => {
    setbisLoading(true);
    if (
      !csvFile &&
      manualEntries.every(
        (entry) =>
          !entry.InvName &&
          !entry.InvCompany &&
          !entry.InvTimezone &&
          !entry.InvEmail
      )
    ) {
      toast({
        title: "Error",
        description: "Please provide either a CSV file or manual entries.",
        variant: "destructive",
      });
      return;
    }

    let dataToSubmit: {
      InvName: string[];
      InvCompany: string[];
      InvTimezone: string[];
      InvEmail: string[];
    } = {
      InvName: [],
      InvCompany: [],
      InvTimezone: [],
      InvEmail: [],
    };

    if (csvFile) {
      const text = await csvFile.text();
      const rows = text.split("\n").slice(1); // Assuming the first row is headers
      rows.forEach((row) => {
        const [_InvId, InvName, InvCompany, InvTimezone, InvEmail] = row
          .split(",")
          .map((item) => item.trim());
        dataToSubmit.InvName.push(InvName);
        dataToSubmit.InvCompany.push(InvCompany);
        dataToSubmit.InvTimezone.push(InvTimezone);
        dataToSubmit.InvEmail.push(InvEmail);
      });
    } else {
      manualEntries.forEach((entry) => {
        if (
          entry.InvName &&
          entry.InvCompany &&
          entry.InvTimezone &&
          entry.InvEmail
        ) {
          dataToSubmit.InvName.push(entry.InvName);
          dataToSubmit.InvCompany.push(entry.InvCompany);
          dataToSubmit.InvTimezone.push(entry.InvTimezone);
          dataToSubmit.InvEmail.push(entry.InvEmail);
        }
      });
    }

    try {
      const response = await fetch(`${api}api/investors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        await fetchInvestors();
        setIsAddDialogOpen(false);
        setCsvFile(null);
        setManualEntries([
          { InvName: "", InvCompany: "", InvTimezone: "", InvEmail: "" },
        ]);
        toast({
          title: "Success",
          description: "Investors added successfully.",
        });
      } else {
        throw new Error("Failed to add investors");
      }
    } catch (error) {
      console.error("Error adding investors:", error);
      toast({
        title: "Error",
        description: "Failed to add investors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setbisLoading(false);
    }
  };

  const handleEdit = (investor: Investor) => {
    setEditingInvestor(investor);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    setbisLoading(true);
    if (!editingInvestor) return;
    try {
      const response = await fetch(
        `${api}api/investors/${editingInvestor.InvId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingInvestor),
        }
      );
      if (response.ok) {
        const updatedInvestor = await response.json();
        setInvestors(
          investors.map((inv) =>
            inv.InvId === updatedInvestor.InvId ? updatedInvestor : inv
          )
        );
        setIsEditDialogOpen(false);
        setEditingInvestor(null);
        toast({
          title: "Success",
          description: "Investor updated successfully.",
        });
      } else {
        throw new Error("Failed to update investor");
      }
    } catch (error) {
      console.error("Error updating investor:", error);
      toast({
        title: "Error",
        description: "Failed to update investor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setbisLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setbisLoading(true);
    try {
      const response = await fetch(`${api}api/investors/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setInvestors(investors.filter((inv) => inv.InvId !== id));
        toast({
          title: "Success",
          description: "Investor deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete investor");
      }
    } catch (error) {
      console.error("Error deleting investor:", error);
      toast({
        title: "Error",
        description: "Failed to delete investor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setbisLoading(false);
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
    <motion.div
      className="p-8 rounded-lg  text-center"
      style={{
        width: "fit-content",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.5,
      }}
    >
      {investors.length === 0 ? (
        <>
          {" "}
          <motion.h2
            className="text-2xl font-bold mb-4 "
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            First investors
          </motion.h2>
          <motion.p
            className="mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Let's add some investors.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              onClick={() => {
                setIsAddDialogOpen(true);
              }}
            >
              Add investor
            </Button>
          </motion.div>
        </>
      ) : null}

      {investors.length > 0 && (
        <>
          <div
            className="overflow-y-auto h-96"
            style={{
              height: "calc(78vh - 4rem)",
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "-ms-autohiding-scrollbar",
            }}
          >
            <InvestorCards
              investors={investors}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          <div className="flex flex-row justify-center items-center gap-4 mt-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                onClick={() => {
                  setIsAddDialogOpen(true);
                }}
              >
                Add More{" "}
              </Button>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {whatpage === "main" ? (
                <p className="text-sm text-gray-600">
                  Done {investors.length}{" "}
                </p>
              ) : (
                <Button onClick={onComplete}>Done {investors.length} </Button>
              )}
            </motion.div>
          </div>
        </>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Investors</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the CSV file here ...</p>
              ) : (
                <p>Drag 'n' drop a CSV file here, or click to select a file</p>
              )}
              {csvFile && <p className="mt-2">File selected: {csvFile.name}</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Manual Entry</h3>
              {manualEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Name"
                    value={entry.InvName}
                    onChange={(e) =>
                      handleManualEntryChange(index, "InvName", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Company"
                    value={entry.InvCompany}
                    onChange={(e) =>
                      handleManualEntryChange(
                        index,
                        "InvCompany",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Timezone"
                    value={entry.InvTimezone}
                    onChange={(e) =>
                      handleManualEntryChange(
                        index,
                        "InvTimezone",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Email"
                    value={entry.InvEmail}
                    onChange={(e) =>
                      handleManualEntryChange(index, "InvEmail", e.target.value)
                    }
                  />
                  {index === manualEntries.length - 1 ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={addManualEntry}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeManualEntry(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Investor</DialogTitle>
          </DialogHeader>
          {editingInvestor && (
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingInvestor.InvName}
                  onChange={(e) =>
                    setEditingInvestor({
                      ...editingInvestor,
                      InvName: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-company" className="text-right">
                  Company
                </Label>
                <Input
                  id="edit-company"
                  value={editingInvestor.InvCompany}
                  onChange={(e) =>
                    setEditingInvestor({
                      ...editingInvestor,
                      InvCompany: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timezone" className="text-right">
                  Timezone
                </Label>
                <Input
                  id="edit-timezone"
                  value={editingInvestor.InvTimezone}
                  onChange={(e) =>
                    setEditingInvestor({
                      ...editingInvestor,
                      InvTimezone: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={editingInvestor.InvEmail}
                  onChange={(e) =>
                    setEditingInvestor({
                      ...editingInvestor,
                      InvEmail: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <Button onClick={handleEditSubmit}>Update Investor</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
