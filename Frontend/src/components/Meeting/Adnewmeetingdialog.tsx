import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Loader2 } from 'lucide-react'

interface NewMeeting {
  SelId: string
  date: string
  startTime: string
  endTime: string
  duration: number
}

interface AvailableSlot {
  startTime: string
  endTime: string
}

interface AvailableSlots {
  [date: string]: AvailableSlot[]
}

interface AddNewMeetingDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (newMeeting: NewMeeting) => Promise<void>
  isLoading: boolean
  selIds: string[]
  api: string
}

export function AddNewMeetingDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  selIds,
  api
}: AddNewMeetingDialogProps) {
  const [newMeeting, setNewMeeting] = useState<NewMeeting>({
    SelId: "",
    date: "",
    startTime: "",
    endTime: "",
    duration: 60,
  })
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots>({})
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimes, setAvailableTimes] = useState<AvailableSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  useEffect(() => {
    if (newMeeting.date) {
      setAvailableTimes(availableSlots[newMeeting.date] || [])
    }
  }, [newMeeting.date, availableSlots])

  const fetchAvailableSlots = async (selId: string) => {
    setIsLoadingSlots(true)
    try {
      const response = await fetch(
        `${api}api/availabilityslots/allAviableslotforseletedselid`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ SelId: selId }),
        }
      )
      if (!response.ok) {
        throw new Error("Failed to fetch available slots")
      }
      const fetchedAvailableSlots: AvailableSlots = await response.json()
      setAvailableSlots(fetchedAvailableSlots)
      setAvailableDates(Object.keys(fetchedAvailableSlots))
      setNewMeeting(prev => ({ ...prev, SelId: selId, date: "", startTime: "", endTime: "" }))
    } catch (err) {
      console.error("Error fetching available slots:", err)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleSelIdChange = (selId: string) => {
    fetchAvailableSlots(selId)
  }

  const handleDateChange = (date: string) => {
    setNewMeeting(prev => ({ ...prev, date, startTime: '', endTime: '' }))
  }

  const handleStartTimeChange = (startTime: string) => {
    setNewMeeting(prev => ({ ...prev, startTime }))
  }

  const handleEndTimeChange = (endTime: string) => {
    setNewMeeting(prev => ({ ...prev, endTime }))
  }

  const handleSubmit = () => {
    onSubmit(newMeeting)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Meeting</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sel-id" className="text-right">
              Selection ID
            </Label>
            <Select
              value={newMeeting.SelId}
              onValueChange={handleSelIdChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a Selection ID" />
              </SelectTrigger>
              <SelectContent>
                {selIds.map((selId) => (
                  <SelectItem key={selId} value={selId}>
                    {selId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isLoadingSlots ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Select
                  value={newMeeting.date}
                  onValueChange={handleDateChange}
                  disabled={!newMeeting.SelId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-time" className="text-right">
                  Start Time
                </Label>
                <Select
                  value={newMeeting.startTime}
                  onValueChange={handleStartTimeChange}
                  disabled={!newMeeting.date}
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
                <Label htmlFor="end-time" className="text-right">
                  End Time
                </Label>
                <Select
                  value={newMeeting.endTime}
                  onValueChange={handleEndTimeChange}
                  disabled={!newMeeting.startTime}
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
            </>
          )}
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          ) : (
            <Button onClick={handleSubmit} disabled={!newMeeting.SelId || !newMeeting.date || !newMeeting.startTime || !newMeeting.endTime}>Add Meeting</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
