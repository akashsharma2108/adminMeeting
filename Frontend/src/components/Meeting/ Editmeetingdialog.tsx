import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";


interface Meeting {
  id: number
  SelId: number
  date: string
  startTime: string
  endTime: string
  duration: number
  Selection: {
    Investor: {
      InvName: string
      InvCompany: string
    }
    PortfolioCompany: {
      PFCompany: string
      PFName: string
      PFTimezone: string
    }
  }
}

interface EditMeetingDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingMeeting: Meeting | null
  editislotavailable: Record<string, Array<{ startTime: string; endTime: string }>>
  onSubmit: (updatedMeeting: Meeting) => Promise<void>
}

export function EditMeetingDialog({
  isOpen,
  onOpenChange,
  editingMeeting,
  editislotavailable,
  onSubmit
}: EditMeetingDialogProps) {
  const [updatedMeeting, setUpdatedMeeting] = useState<Meeting | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableTimes, setAvailableTimes] = useState<Array<{ startTime: string; endTime: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editingMeeting) {
      setUpdatedMeeting(editingMeeting)
      setSelectedDate(editingMeeting.date)
      setAvailableTimes(editislotavailable[editingMeeting.date] || [])
    }
  }, [editingMeeting, editislotavailable])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setAvailableTimes(editislotavailable[date] || [])
    setUpdatedMeeting(prev => prev ? { ...prev, date, startTime: '', endTime: '' } : null)
  }

  const handleStartTimeChange = (startTime: string) => {
    setUpdatedMeeting(prev => prev ? { ...prev, startTime } : null)
  }

  const handleEndTimeChange = (endTime: string) => {
    setUpdatedMeeting(prev => prev ? { ...prev, endTime } : null)
  }

  const handleSubmit = async () => {
    if (!updatedMeeting) return
    setIsLoading(true)
    try {
      await onSubmit(updatedMeeting)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating meeting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Meeting</DialogTitle>
        </DialogHeader>
        {updatedMeeting && (
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sel-id" className="text-right">
                Selection ID
              </Label>
              <Input
                disabled
                id="edit-sel-id"
                value={updatedMeeting.SelId}
                onChange={(e) =>
                  setUpdatedMeeting({
                    ...updatedMeeting,
                    SelId: parseInt(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Date
              </Label>
              <Select
                value={selectedDate}
                onValueChange={handleDateChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(editislotavailable).map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-start-time" className="text-right">
                Start Time
              </Label>
              <Select
                value={updatedMeeting.startTime}
                onValueChange={handleStartTimeChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((slot) => (
                    <SelectItem key={slot.startTime} value={slot.startTime}>
                      {slot.startTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-end-time" className="text-right">
                End Time
              </Label>
              <Select
                value={updatedMeeting.endTime}
                onValueChange={handleEndTimeChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((slot) => (
                    <SelectItem key={slot.endTime} value={slot.endTime}>
                      {slot.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : (
              <Button onClick={handleSubmit}>Update Meeting</Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

