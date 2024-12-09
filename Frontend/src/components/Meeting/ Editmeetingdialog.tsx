import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "../ui/alert"

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

type TimeSlot = {
  startTime: string
  endTime: string
}

type AvailableSlots = TimeSlot[] | ["NA"]

interface EditMeetingDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingMeeting: Meeting | null
  editislotavailable: Record<string, AvailableSlots>
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
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [availableTimes, setAvailableTimes] = useState<AvailableSlots>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isValidTimeSlots = (slots: AvailableSlots): slots is TimeSlot[] => {
    return Array.isArray(slots) && slots[0] !== "NA";
  };

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
    setUpdatedMeeting(prev => prev ? { ...prev, date, startTime: "", endTime: "" } : null)
    setErrorMessage(null)
  }

  const handleStartTimeChange = (startTime: string) => {
    setUpdatedMeeting(prev => prev ? { ...prev, startTime, endTime: "" } : null)
    setErrorMessage(null)
  }

  const handleEndTimeChange = (endTime: string) => {
    if (updatedMeeting && updatedMeeting.startTime) {
      const start = new Date(`2000-01-01T${updatedMeeting.startTime}`)
      const end = new Date(`2000-01-01T${endTime}`)
      const diffInMinutes = (end.getTime() - start.getTime()) / 60000

      if (diffInMinutes !== 60) {
        setErrorMessage("Meeting time must be exactly one hour.")
      } else {
        setErrorMessage(null)
      }
    }
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

  const isTimeSelectDisabled = !isValidTimeSlots(availableTimes);
  const isUpdateButtonDisabled = !updatedMeeting?.startTime || !updatedMeeting?.endTime || errorMessage !== null

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
                disabled={isTimeSelectDisabled}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    if (isValidTimeSlots(availableTimes)) {
                      return availableTimes.map((slot: TimeSlot) => (
                        <SelectItem key={slot.startTime} value={slot.startTime}>
                          {slot.startTime}
                        </SelectItem>
                      ));
                    }
                    return null;
                  })()}
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
                disabled={isTimeSelectDisabled || !updatedMeeting.startTime}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    if (isValidTimeSlots(availableTimes)) {
                      return availableTimes.map((slot: TimeSlot) => (
                        <SelectItem key={slot.endTime} value={slot.endTime}>
                          {slot.endTime}
                        </SelectItem>
                      ));
                    }
                    return null;
                  })()}
                </SelectContent>
              </Select>
            </div>
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
           
          { isUpdateButtonDisabled && isTimeSelectDisabled ?(
                <Alert variant="destructive">
                    <AlertDescription>No time slot available for this date</AlertDescription>
                </Alert>
                ): null}
            {
             
            
            
            isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : (
              <Button onClick={handleSubmit} disabled={isUpdateButtonDisabled}>
                Update Meeting
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

