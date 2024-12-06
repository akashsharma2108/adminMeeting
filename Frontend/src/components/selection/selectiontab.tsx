import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Building2, Edit, Trash2, IdCard, Cable } from "lucide-react";
import { Search } from "lucide-react";

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
  const [bisLoading, setbisLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSelection, setEditingSelection] = useState<Selection | null>(
    null
  );
  const [newSelection, setNewSelection] = useState({ InvId: "", PFId: "" });
  const [filtered, setFiltered] = useState<Selection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSelections();
  }, []);

  useEffect(() => {
    if (!isLoading && selections.length > 0) {
      const filtered = selections.filter(
        (value) =>
          value.Investor.InvName.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          value.PortfolioCompany.PFName.toLowerCase().includes(
            searchTerm.toLowerCase()
          )
      );
      setFiltered(filtered);
    }
  }, [selections, searchTerm]);

  const fetchSelections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:4000/api/selections");
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
    setbisLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/selections", {
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
      setbisLoading(false);
    }
  };

  const handleEdit = (selection: Selection) => {
    setEditingSelection(selection);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    setbisLoading(true);
    if (!editingSelection) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/selections/${editingSelection.SelId}`,
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
      setbisLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setbisLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/selections/${id}`,
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

  const gentrateSelection = async () => {
    setbisLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/selections/generateselections",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

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
    } finally {
      setbisLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Selections</h2>
          <span className="text-lg text-gray-500">
            Total Selections: {selections.length}
          </span>
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
          {bisLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Button onClick={() => gentrateSelection()}>
              Generate Selection
            </Button>
          )}
          {bisLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Add Selection
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <>
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
            <p  className="text-gray-500 text-lg mb-4">No selections found. Click the button to generate selections</p>
          {bisLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Button onClick={() => gentrateSelection()}>
              Generate Selection
            </Button>
          )}
          </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-700 mb-4">
            *Note selection are based on investors and portfolio companies and
            aviailable timezones
          </p>

          <div
            style={{
              overflowX: "auto",
              height: "calc(100vh - 400px)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((selection) => (
                <Card key={selection.SelId} className="flex flex-col">
                  <CardContent className="flex-grow p-6">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          <Cable />
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(selection)}
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
                        onClick={() => handleDelete(selection.SelId)}
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
            {bisLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Button onClick={handleSubmit}>Add Selection</Button>
            )}
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
              {bisLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Button onClick={handleEditSubmit}>Update Selection</Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
