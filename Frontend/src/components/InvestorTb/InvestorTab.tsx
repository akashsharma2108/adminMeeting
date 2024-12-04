"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2, Plus, Minus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "../../hooks/use-toast";

interface Investor {
  InvId: string;
  InvName: string;
  InvCompany: string;
  InvTimezone: string;
}

interface ManualEntry {
  InvName: string;
  InvCompany: string;
  InvTimezone: string;
}

export default function InvestorTab() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([
    { InvName: "", InvCompany: "", InvTimezone: "" },
  ]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:4000/api/investors");
      if (!response.ok) {
        throw new Error("Failed to fetch investors");
      }
      const data = await response.json();
      setInvestors(data);
    } catch (err) {
      setError("Error fetching investors. Please try again.");
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
      { InvName: "", InvCompany: "", InvTimezone: "" },
    ]);
  };

  const removeManualEntry = (index: number) => {
    const updatedEntries = manualEntries.filter((_, i) => i !== index);
    setManualEntries(updatedEntries);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setCsvFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  const handleSubmit = async () => {
    if (
      !csvFile &&
      manualEntries.every(
        (entry) => !entry.InvName && !entry.InvCompany && !entry.InvTimezone
      )
    ) {
      setError("Please provide either a CSV file or manual entries.");
      toast({
        title: "Error",
        description: "Please provide either a CSV file or manual entries.",
        variant: "destructive",
      });
      return;
    }

    let dataToSubmit: {
      InvName: Array<string>;
      InvCompany: Array<string>;
      InvTimezone: Array<string>;
    } = {
      InvName: [],
      InvCompany: [],
      InvTimezone: [],
    }

    if (csvFile) {
      const text = await csvFile.text();
      const rows = text.split("\n").slice(1); // Assuming the first row is headers
      const d = rows
        .map((row) => {
          const [_InvId, InvName, InvCompany, InvTimezone] = row
            .split(",")
            .map((item) => {
              return item.trim();
            });
          return {
            InvName,
            InvCompany,
            InvTimezone,
          };
        });

      if (d.length === 0) {
        return alert("Failed to add investors");
      }

      d.forEach((entry) => {
        dataToSubmit.InvName = [...dataToSubmit.InvName, entry.InvName];
        dataToSubmit.InvCompany = [...dataToSubmit.InvCompany, entry.InvCompany];
        dataToSubmit.InvTimezone = [
          ...dataToSubmit.InvTimezone,
          entry.InvTimezone,
        ];
      });
    } else {
      const d = manualEntries.filter(
        (entry) => !entry.InvName || !entry.InvCompany || !entry.InvTimezone
      ) as Array<Investor>;
      

      if (d.length === 0) {
        (manualEntries as Array<Investor>).forEach((entry: Investor) => {
          console.log(entry);
          
          dataToSubmit.InvName = [...dataToSubmit.InvName, entry.InvName];
          dataToSubmit.InvCompany = [
            ...dataToSubmit.InvCompany,
            entry.InvCompany,
          ];
          dataToSubmit.InvTimezone = [
            ...dataToSubmit.InvTimezone,
            entry.InvTimezone,
          ];
        });
      } else {
        return alert("Failed to add investors");
      }
    }

    try {
      const response = await fetch('http://localhost:4000/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      })

      if (response.ok) {
        await fetchInvestors()
        setIsAddDialogOpen(false)
        setCsvFile(null)
        setManualEntries([{ InvName: '', InvCompany: '', InvTimezone: '' }])
        toast({
          title: "Success",
          description: "Investors added successfully.",
        })
      } else {
        throw new Error('Failed to add investors')
      }
    } catch (error) {
      console.error('Error adding investors:', error)
      setError('Failed to add investors. Please try again.')
      toast({
        title: "Error",
        description: "Failed to add investors. Please try again.",
        variant: "destructive",
      })
    }
  };

  const handleEdit = (investor: Investor) => {
    setEditingInvestor(investor);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingInvestor) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/investors/${editingInvestor.InvId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            InvName: editingInvestor.InvName,
            InvCompany: editingInvestor.InvCompany,
            InvTimezone: editingInvestor.InvTimezone,
          }),
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
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/investors/${id}`,
        {
          method: "DELETE",
        }
      );

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Investors</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Investor</Button>
      </div>

      {investors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="mb-4">No investors found.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investors.map((investor) => (
              <TableRow key={investor.InvId}>
                <TableCell>{investor.InvName}</TableCell>
                <TableCell>{investor.InvCompany}</TableCell>
                <TableCell>{investor.InvTimezone}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleEdit(investor)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(investor.InvId)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
            {error && <p className="text-red-500">{error}</p>}
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
              <Button onClick={handleEditSubmit}>Update Investor</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
