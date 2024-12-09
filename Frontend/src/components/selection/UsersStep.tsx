import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import SelectionCards from "../firstflowcompoents/Cards/SelectionCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
interface UsersStepProps {
  onComplete: () => void;

  whatpage?: string;
}

export default function UsersStep({ onComplete, whatpage }: UsersStepProps) {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bisLoading, setbisLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  // const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSelection, setEditingSelection] = useState<Selection | null>(
    null
  );
  // const [newSelection, setNewSelection] = useState({ InvId: "", PFId: "" });
  const [selectedCards, setSelectedCards] = useState<number[]>(() =>
    selections.length > 0 ? [selections[0].SelId] : []
  );
  const [invNameFilter, setInvNameFilter] = useState("");
  const [pfNameFilter, setPfNameFilter] = useState("");
  const [invCompanyFilter, setInvCompanyFilter] = useState("");
  const [pfCompanyFilter, setPfCompanyFilter] = useState("");

  const filteredMeetings = selections.filter((selection) => {
    if (
      invNameFilter &&
      !selection.Investor.InvName.toLowerCase().includes(
        invNameFilter.toLowerCase()
      )
    )
      return false;
    if (
      pfNameFilter &&
      !selection.PortfolioCompany.PFName.toLowerCase().includes(
        pfNameFilter.toLowerCase()
      )
    )
      return false;
    if (
      invCompanyFilter &&
      !selection.Investor.InvCompany.toLowerCase().includes(
        invCompanyFilter.toLowerCase()
      )
    )
      return false;
    if (
      pfCompanyFilter &&
      !selection.PortfolioCompany.PFCompany.toLowerCase().includes(
        pfCompanyFilter.toLowerCase()
      )
    )
      return false;
    return true;
  });

  const resetFilters = () => {
    setInvNameFilter("");
    setPfNameFilter("");
    setInvCompanyFilter("");
    setPfCompanyFilter("");
  };

  const { toast } = useToast();

  useEffect(() => {
    fetchSelections().then(() => {
      if (selections.length > 0) {
        setSelectedCards([selections[0].SelId]);
      }
    });
  }, []);

  const fetchSelections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${api}api/selections`);
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

  // const handleSubmit = async () => {
  //   setbisLoading(true);
  //   try {
  //     const response = await fetch(`${api}api/selections`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(newSelection),
  //     });

  //     if (response.status === 201) {
  //       await fetchSelections();
  //       setIsAddDialogOpen(false);
  //       setNewSelection({ InvId: "", PFId: "" });
  //       toast({
  //         title: "Success",
  //         description: "Selection added successfully.",
  //       });
  //     } else if (response.status === 400) {
  //       const data = await response.json();
  //       toast({
  //         title: "Error",
  //         description: data.message,
  //         variant: "destructive",
  //       });
  //     } else {
  //       throw new Error("Failed to add selection");
  //     }
  //   } catch (error) {
  //     console.error("Error adding selection:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to add selection. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setbisLoading(false);
  //   }
  // };

  const handleEdit = (selection: Selection) => {
    setEditingSelection(selection);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    setbisLoading(true);
    if (!editingSelection) return;

    try {
      const response = await fetch(
        `${api}api/selections/${editingSelection.SelId}`,
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
      const response = await fetch(`${api}api/selections/${id}`, {
        method: "DELETE",
      });

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
      const response = await fetch(`${api}api/selections/generateselections`, {
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
    } finally {
      setbisLoading(false);
    }
  };

  const handleAutoSelection = async () => {
    gentrateSelection();
  };

  const handleCardSelection = (selId: number) => {
    setSelectedCards((prev) => {
      if (selId === selections[0].SelId) {
        // Prevent unselecting the first card if it's the only one selected
        if (prev.length === 1 && prev[0] === selId) {
          return prev;
        }
      }

      if (prev.includes(selId)) {
        return prev.filter((id) => id !== selId);
      } else {
        return [...prev, selId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCards.length === selections.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(selections.map((sel) => sel.SelId));
    }
  };

  const handleDone = async () => {
    try {
      const response = await fetch(`${api}api/selections/userselected`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ SelId: selectedCards }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Selections submitted successfully.",
        });
        onComplete();
      } else {
        throw new Error("Failed to submit selections");
      }
    } catch (error) {
      console.error("Error submitting selections:", error);
      toast({
        title: "Error",
        description: "Failed to submit selections. Please try again.",
        variant: "destructive",
      });
    }
  };
  return (
    <>
      <motion.div
        className="p-8 rounded-lg  text-center"
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
        {selections.length === 0 ? (
          <>
            <motion.h2
              className="text-2xl font-bold mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Now, let's select some pairs.
            </motion.h2>
            <motion.p
              className="mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Pairs are the selection between any investor with any protfolios
              to make a pair.
              <br /> Choose Select All or manually select the pairs.
            </motion.p>
            <motion.div
              className="flex space-x-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button onClick={handleAutoSelection}>
                Generate and Select!
              </Button>
            </motion.div>
          </>
        ) : (
          <></>
        )}

        {selections.length > 0 && whatpage === "main" && (
          <div
            className="flex items-center gap-4 p-4  flex-wrap "
            style={{
              marginTop: whatpage === "main" ? "-3rem" : "0",
              marginBottom: "2rem",
            }}
          >
            <Select value={invNameFilter} onValueChange={setInvNameFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Investor" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  new Set(selections.map((s) => s.Investor.InvName))
                ).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={pfNameFilter} onValueChange={setPfNameFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Portfolio" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  new Set(selections.map((s) => s.PortfolioCompany.PFName))
                ).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={invCompanyFilter}
              onValueChange={setInvCompanyFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Inv Company" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  new Set(selections.map((s) => s.Investor.InvCompany))
                ).map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={pfCompanyFilter} onValueChange={setPfCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by PF Company" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  new Set(selections.map((s) => s.PortfolioCompany.PFCompany))
                ).map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
        {filteredMeetings.length > 0 && (
          <>
            <div
              className="overflow-y-auto h-96"
              style={{
                height: "calc(74vh - 4rem)",
                WebkitOverflowScrolling: "touch",
                msOverflowStyle: "-ms-autohiding-scrollbar",
              }}
            >
              <SelectionCards
                selection={filteredMeetings}
                onEdit={handleEdit}
                onDelete={handleDelete}
                selectedCards={selectedCards}
                onCardSelection={handleCardSelection}
              />
            </div>
            <div className="flex flex-row justify-center items-center gap-4 mt-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button onClick={handleAutoSelection}>Re-Generate</Button>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  onClick={handleSelectAll}
                  disabled={selections.length === selectedCards.length}
                >
                  Select All
                </Button>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  onClick={handleDone}
                  disabled={selectedCards.length === 0}
                >
                  {whatpage === "main" ? "Submit" : "Done"} (
                  {selectedCards.length})
                </Button>
              </motion.div>
            </div>
          </>
        )}

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
      </motion.div>
    </>
  );
}
