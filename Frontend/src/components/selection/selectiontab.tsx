"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

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

export default function SelectionTab() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bisLoading, setbisLoading] = useState(false)
  const [, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSelection, setEditingSelection] = useState<Selection | null>(
    null
  );
  const [newSelection, setNewSelection] = useState({ InvId: "", PFId: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchSelections();
  }, []);

  const fetchSelections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://adminmeeting.onrender.com/api/selections");
      if (!response.ok) {
        throw new Error("Failed to fetch selections");
      }
      const data = await response.json();
      setSelections(data.selections);
    } catch (err) {
      setError("Error fetching selections. Please try again.");
      console.error("Error fetching selections:", err);
      toast({
        title: "Error",
        description: "Failed to fetch selections. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setbisLoading(true)
    try {
      const response = await fetch("https://adminmeeting.onrender.com/api/selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSelection),
      });

      if (response.status === 201) {
        await fetchSelections();
        setIsAddDialogOpen(false);
        setNewSelection({ InvId: "", PFId: "" });
        toast({
          title: "Success",
          description: "Selection added successfully.",
        });
      } else if (response.status === 400) {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      } else {
        throw new Error("Failed to add selection");
      }
    } catch (error) {
      console.error("Error adding selection:", error);
      toast({
        title: "Error",
        description: "Failed to add selection. Please try again.",
        variant: "destructive",
      });
    } finally {
        setbisLoading(false)
        }
  };

  const handleEdit = (selection: Selection) => {
    setEditingSelection(selection);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    setbisLoading(true)
    if (!editingSelection) return;

    try {
      const response = await fetch(
        `https://adminmeeting.onrender.com/api/selections/${editingSelection.SelId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            InvId: editingSelection.InvId,
            PFId: editingSelection.PFId,
          }),
        }
      );

      if (response.ok) {
        await fetchSelections();
        setIsEditDialogOpen(false);
        setEditingSelection(null);
        toast({
          title: "Success",
          description: "Selection updated successfully.",
        });
      } else {
        throw new Error("Failed to update selection");
      }
    } catch (error) {
      console.error("Error updating selection:", error);
      toast({
        title: "Error",
        description: "Failed to update selection. Please try again.",
        variant: "destructive",
      });
    } finally {
        setbisLoading(false)
        }

  };

  const handleDelete = async (id: number) => {
    setbisLoading(true)
    try {
      const response = await fetch(
        `https://adminmeeting.onrender.com/api/selections/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSelections(selections.filter((sel) => sel.SelId !== id));
        toast({
          title: "Success",
          description: "Selection deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete selection");
      }
    } catch (error) {
      console.error("Error deleting selection:", error);
      toast({
        title: "Error",
        description: "Failed to delete selection. Please try again.",
        variant: "destructive",
      });
    } finally {
        setbisLoading(false)
        }
        
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const gentrateSelection = async () => {
    try {
        const response = await fetch("https://adminmeeting.onrender.com/api/selections/generateselections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
  
        if (response.status === 201) {
          await fetchSelections();
          toast({
            title: "Success",
            description: "Selection added successfully.",
          });
        } else if (response.status === 400) {
          const data = await response.json();
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive",
          });
        } else {
          throw new Error("Failed to add selection");
        }
      } catch (error) {
        console.error("Error adding selection:", error);
        toast({
          title: "Error",
          description: "Failed to add selection. Please try again.",
          variant: "destructive",
        });
      }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Selections</h2>
        <div className="space-x-2">
        { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :  <Button onClick={() => gentrateSelection()}>
          Generate Selection
        </Button> }
         <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Selection
        </Button>
        </div>
      </div>

      {selections.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p>No selections found.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Selection ID</TableHead>
              <TableHead>Portfolio Company ID</TableHead>
              <TableHead>Investor ID</TableHead>
              <TableHead>Portfolio Name</TableHead>
              <TableHead>Portfolio Company</TableHead>
              <TableHead>Investor Company</TableHead>
              <TableHead>Investor Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selections.map((selection) => (
              <TableRow key={selection.SelId}>
                <TableCell>{selection.SelId}</TableCell>
                <TableCell>{selection.PFId}</TableCell>
                <TableCell>{selection.InvId}</TableCell>
                <TableCell>{selection.PortfolioCompany.PFName}</TableCell>
                <TableCell>{selection.PortfolioCompany.PFCompany}</TableCell>
                <TableCell>{selection.Investor.InvCompany}</TableCell>
                <TableCell>{selection.Investor.InvName}</TableCell>
                <TableCell>
                { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :      <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleEdit(selection)}
                  >
                    Edit
                  </Button>}
                  { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :    <Button
                    variant="destructive"
                    onClick={() => handleDelete(selection.SelId)}
                  >
                    Delete
                  </Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Selection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inv-id" className="text-right">
                Investor ID
              </Label>
              <Input
                id="inv-id"
                value={newSelection.InvId}
                onChange={(e) =>
                  setNewSelection({ ...newSelection, InvId: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pf-id" className="text-right">
                Portfolio Company ID
              </Label>
              <Input
                id="pf-id"
                value={newSelection.PFId}
                onChange={(e) =>
                  setNewSelection({ ...newSelection, PFId: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :  <Button onClick={handleSubmit}>Add Selection</Button>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Selection</DialogTitle>
          </DialogHeader>
          {editingSelection && (
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-inv-id" className="text-right">
                  Investor ID
                </Label>
                <Input
                  id="edit-inv-id"
                  value={editingSelection.InvId}
                  onChange={(e) =>
                    setEditingSelection({
                      ...editingSelection,
                      InvId: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-pf-id" className="text-right">
                  Portfolio Company ID
                </Label>
                <Input
                  id="edit-pf-id"
                  value={editingSelection.PFId}
                  onChange={(e) =>
                    setEditingSelection({
                      ...editingSelection,
                      PFId: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :    <Button onClick={handleEditSubmit}>Update Selection</Button>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
