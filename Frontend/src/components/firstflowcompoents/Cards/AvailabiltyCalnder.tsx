import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

interface AvailabilitySlot {
  id: number;
  timezone: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function AvailabilityCards({
  avaikable,
  onEdit,
  onDelete,
}: {
  avaikable: AvailabilitySlot[];
  onEdit: (slot: AvailabilitySlot) => void;
  onDelete: (id: number) => void;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Get unique timezones and dates
  const uniqueTimezones = Array.from(
    new Set(avaikable.map((slot) => slot.timezone))
  );
  const uniqueDates = Array.from(new Set(avaikable.map((slot) => slot.date)));

  // Group slots by timezone and date
  const groupedSlots = avaikable.reduce((acc, slot) => {
    const key = `${slot.timezone}-${slot.date}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  const handleDeleteClick = (slot: AvailabilitySlot, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSlot(slot);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSlot) {
      onDelete(selectedSlot.id);
      setDeleteDialogOpen(false);
      setSelectedSlot(null);
    }
  };

  const handleEditClick = (slot: AvailabilitySlot, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(slot);
  };

  return (
    <div className="relative min-h-screen" style={{ minWidth: "100vw" }}>
      <div className="overflow-x-auto">
        <div
          className=" p-6"
          style={{
            width: "92dvw",
            overflowX: "auto",
            
          }}
        >
          {/* Header with timezones */}
          <div
            className={`grid gap-4 mb-8`}
            style={{
              gridTemplateColumns: `200px repeat(${uniqueTimezones.length}, minmax(200px, 1fr))`,
            }}
          >
            <div className="font-semibold text-lg">Date</div>
            {uniqueTimezones.map((timezone) => (
              <div key={timezone} className="font-semibold text-lg text-center">
                {timezone}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-8">
            {uniqueDates.map((date) => (
              <div
                key={date}
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `200px repeat(${uniqueTimezones.length}, minmax(200px, 1fr))`,
                }}
              >
                <div className="font-medium text-lg">{date}</div>
                {uniqueTimezones.map((timezone) => {
                  const slots = groupedSlots[`${timezone}-${date}`] || [];
                  const cardKey = `${timezone}-${date}`;
                  const isExpanded = expandedCard === cardKey;

                  if (slots.length === 0) return <div key={timezone} />;

                  return (
                    <Card
                      key={timezone}
                      className={`p-4 bg-white rounded-xl transition-all duration-200 cursor-pointer
                        ${
                          isExpanded
                            ? "scale-110 shadow-lg z-10"
                            : "hover:scale-105"
                        }`}
                      onMouseEnter={() => setExpandedCard(cardKey)}
                      onMouseLeave={() => setExpandedCard(null)}
                    >
                      {isExpanded ? (
                        <div className="space-y-3">
                          {slots.map((slot, index) => (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between  ${
                                index !== slots.length - 1
                                  ? "border-b pb-2"
                                  : ""
                              }`}
                              style={{
                                flexWrap: "nowrap",
                              }}
                            >
                              <span className="text-sm font-medium">
                                {slot.startTime} to {slot.endTime}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-slate-100"
                                  onClick={(e) => handleEditClick(slot, e)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-slate-100"
                                  onClick={(e) => handleDeleteClick(slot, e)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {slots[0].startTime} to {slots[0].endTime}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-slate-100"
                                onClick={(e) => handleEditClick(slots[0], e)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-slate-100"
                                onClick={(e) => handleDeleteClick(slots[0], e)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {slots.length > 1 && (
                            <div className="text-sm text-muted-foreground">
                              +{slots.length - 1} more slots
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this time slot?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
