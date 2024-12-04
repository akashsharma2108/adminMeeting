import { useState, useEffect } from 'react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Loader2 } from 'lucide-react'
import { useToast } from "../../hooks/use-toast"
import DatePicker from "react-datepicker"
import { format } from "date-fns"

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

export default function MeetingTab() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bisLoading, setbisLoading] = useState(false)
  const [, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [newMeeting, setNewMeeting] = useState({
    SelId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 60
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('https://adminmeeting.onrender.com/api/meetings')
      if (!response.ok) {
        throw new Error('Failed to fetch meetings')
      }
      const data = await response.json()
      setMeetings(data)
    } catch (err) {
      setError('Error fetching meetings. Please try again.')
      console.error('Error fetching meetings:', err)
      toast({
        title: "Error",
        description: "Failed to fetch meetings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setbisLoading(true)
    try {
      const response = await fetch('https://adminmeeting.onrender.com/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting)
      })

      if (response.ok) {
        await fetchMeetings() 
        setIsAddDialogOpen(false)
        setNewMeeting({
          SelId: '',
          date: '',
          startTime: '',
          endTime: '',
          duration: 60
        })
        toast({
          title: "Success",
          description: "Meeting added successfully.",
        })
      } else {
        throw new Error('Failed to add meeting')
      }
    } catch (error) {
      console.error('Error adding meeting:', error)
      toast({
        title: "Error",
        description: "Failed to add meeting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setbisLoading(false)
    }
  }

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    setbisLoading(true)
    if (!editingMeeting) return

    try {
      const response = await fetch(`https://adminmeeting.onrender.com/api/meetings/${editingMeeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SelId: editingMeeting.SelId,
          date: editingMeeting.date,
          startTime: editingMeeting.startTime,
          endTime: editingMeeting.endTime,
          duration: editingMeeting.duration
        })
      })

      if (response.ok) {
        await fetchMeetings()
        setIsEditDialogOpen(false)
        setEditingMeeting(null)
        toast({
          title: "Success",
          description: "Meeting updated successfully.",
        })
      } else {
        throw new Error('Failed to update meeting')
      }
    } catch (error) {
      console.error('Error updating meeting:', error)
      toast({
        title: "Error",
        description: "Failed to update meeting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setbisLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setbisLoading(true)
    try {
      const response = await fetch(`https://adminmeeting.onrender.com/api/meetings/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMeetings(meetings.filter(meeting => meeting.id !== id))
        toast({
          title: "Success",
          description: "Meeting deleted successfully.",
        })
      } else {
        throw new Error('Failed to delete meeting')
      }
    } catch (error) {
      console.error('Error deleting meeting:', error)
      toast({
        title: "Error",
        description: "Failed to delete meeting. Please try again.",
        variant: "destructive",
      })
    } finally {
        setbisLoading(false)
    }
  }

  const handleGenerateMeetings = async () => {
    setbisLoading(true)
    try {
      const response = await fetch('https://adminmeeting.onrender.com/api/meetings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalizeSchedule: true })
      })

      if (response.ok) {
        await fetchMeetings()
        toast({
          title: "Success",
          description: "Meetings generated successfully.",
        })
      } else {
        throw new Error('Failed to generate meetings')
      }
    } catch (error) {
      console.error('Error generating meetings:', error)
      toast({
        title: "Error",
        description: "Failed to generate meetings. Please try again.",
        variant: "destructive",
      })
    } finally {
        setbisLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    setbisLoading(true)
    const headers = ["ID", "Selection ID", "Start Time", "End Time", "Date", "Investor Name", "Investor Company", "Portfolio Company", "Portfolio Timezone"]
    const csvContent = [
      headers.join(','),
      ...meetings.map(meeting => [
        meeting.id,
        meeting.SelId,
        meeting.startTime,
        meeting.endTime,
        meeting.date,
        meeting.Selection.Investor.InvName,
        meeting.Selection.Investor.InvCompany,
        meeting.Selection.PortfolioCompany.PFCompany,
        meeting.Selection.PortfolioCompany.PFName
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "meetings.csv")
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    setbisLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="mb-4">No data found.</p>
        { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :    <Button onClick={handleGenerateMeetings}>Generate Meetings</Button> }
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Meetings</h2>
        <div className="space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>Add Meeting</Button>
          { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :    <Button onClick={handleGenerateMeetings}>Generate Meetings</Button>}
          { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :     <Button onClick={handleDownloadCSV}>Download CSV</Button> }
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Selection ID</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Investor Name</TableHead>
            <TableHead>Investor Company</TableHead>
            <TableHead>Portfolio Company</TableHead>
            <TableHead>Portfolio Timezone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow key={meeting.id}>
              <TableCell>{meeting.id}</TableCell>
              <TableCell>{meeting.SelId}</TableCell>
              <TableCell>{meeting.startTime}</TableCell>
              <TableCell>{meeting.endTime}</TableCell>
              <TableCell>{meeting.date}</TableCell>
              <TableCell>{meeting.Selection.Investor.InvName}</TableCell>
              <TableCell>{meeting.Selection.Investor.InvCompany}</TableCell>
              <TableCell>{meeting.Selection.PortfolioCompany.PFCompany}</TableCell>
              <TableCell>{meeting.Selection.PortfolioCompany.PFName}</TableCell>
              <TableCell>
              { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :     <Button variant="outline" className="mr-2" onClick={() => handleEdit(meeting)}>Edit</Button>}
     { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :       <Button variant="destructive" onClick={() => handleDelete(meeting.id)}>Delete</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sel-id" className="text-right">
                Selection ID
              </Label>
              <Input
                id="sel-id"
                value={newMeeting.SelId}
                onChange={(e) => setNewMeeting({ ...newMeeting, SelId: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <DatePicker
                  selected={newMeeting.date ? new Date(newMeeting.date) : undefined}
                  onSelect={(date) => setNewMeeting({ ...newMeeting, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                  className="rounded-md border"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right">
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={newMeeting.startTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time" className="text-right">
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={newMeeting.endTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                className="col-span-3"
              />
            </div>
            { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :  <Button onClick={handleSubmit}>Add Meeting</Button> }
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          {editingMeeting && (
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sel-id" className="text-right">
                  Selection ID
                </Label>
                <Input
                  id="edit-sel-id"
                  value={editingMeeting.SelId}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, SelId: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <DatePicker
                    selected={new Date(editingMeeting.date)}
                    onSelect={(date) => setEditingMeeting({ ...editingMeeting, date: date ? format(date, 'yyyy-MM-dd') : editingMeeting.date })}
                    className="rounded-md border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start-time" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={editingMeeting.startTime}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, startTime: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end-time" className="text-right">
                  End Time
                </Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={editingMeeting.endTime}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, endTime: e.target.value })}
                  className="col-span-3"
                />
              </div>
              { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :   <Button onClick={handleEditSubmit}>Update Meeting</Button>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

