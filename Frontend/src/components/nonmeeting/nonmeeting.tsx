import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Loader2 } from 'lucide-react'
import { useToast } from "../../hooks/use-toast"

interface UnscheduledMeeting {
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
      InvTimezone: string
    }
    PortfolioCompany: {
      PFName: string
      PFCompany: string
      PFTimezone: string
    }
  }
}

export default function UnscheduledMeetingsTab() {
  const [unscheduledMeetings, setUnscheduledMeetings] = useState<UnscheduledMeeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUnscheduledMeetings()
  }, [])

  const fetchUnscheduledMeetings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:4000/api/nonmeeting')
      if (!response.ok) {
        throw new Error('Failed to fetch unscheduled meetings')
      }
      const data = await response.json()
      setUnscheduledMeetings(data)
    } catch (err) {
      setError('Error fetching unscheduled meetings. Please try again.')
      console.error('Error fetching unscheduled meetings:', err)
      toast({
        title: "Error",
        description: "Failed to fetch unscheduled meetings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (unscheduledMeetings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No unscheduled meetings found.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Unscheduled Meetings</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Selection ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Duration (min)</TableHead>
            <TableHead>Investor Name</TableHead>
            <TableHead>Investor Company</TableHead>
            <TableHead>Investor Timezone</TableHead>
            <TableHead>Portfolio Name</TableHead>
            <TableHead>Portfolio Company</TableHead>
            <TableHead>Portfolio Timezone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unscheduledMeetings.map((meeting) => (
            <TableRow key={meeting.id}>
              <TableCell>{meeting.id}</TableCell>
              <TableCell>{meeting.SelId}</TableCell>
              <TableCell>{meeting.date}</TableCell>
              <TableCell>{meeting.startTime}</TableCell>
              <TableCell>{meeting.endTime}</TableCell>
              <TableCell>{meeting.duration}</TableCell>
              <TableCell>{meeting.Selection.Investor.InvName}</TableCell>
              <TableCell>{meeting.Selection.Investor.InvCompany}</TableCell>
              <TableCell>{meeting.Selection.Investor.InvTimezone}</TableCell>
              <TableCell>{meeting.Selection.PortfolioCompany.PFName}</TableCell>
              <TableCell>{meeting.Selection.PortfolioCompany.PFCompany}</TableCell>
              <TableCell>{meeting.Selection.PortfolioCompany.PFTimezone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

