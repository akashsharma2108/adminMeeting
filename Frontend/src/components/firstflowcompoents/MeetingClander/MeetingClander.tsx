import { useState } from "react"
import { ChevronLeft, ChevronRight, MoreVertical, Send, Trash2 } from 'lucide-react'
import { Button } from "../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "../../ui/card"
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog"
import { cn } from "../../../lib/utils"
import { ScrollArea } from "../../ui/scroll-area"


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

interface CalendarViewProps {
  meetings: Meeting[]
  onEdit : (meeting: Meeting) => void
  onDelete : (id : number) => void
  onSendMail : (meeting: Meeting) => void
  onGenerate: () => void
  disabled: boolean
}

const HOURS = Array.from({ length: 19 }, (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`)

const getUniqueDates = (meetings: Meeting[]): string[] => {
  const uniqueDates = Array.from(new Set(meetings.map(m => m.date)));
  return uniqueDates.sort();
};



// Function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}


export default function CalendarView({ meetings, onEdit, onDelete, onSendMail, disabled ,onGenerate }: CalendarViewProps) {
  const uniqueDates = getUniqueDates(meetings);
  const [selectedDate, setSelectedDate] = useState(uniqueDates[0] || '');
  const [invNameFilter, setInvNameFilter] = useState("")
  const [pfNameFilter, setPfNameFilter] = useState("")
  const [invCompanyFilter, setInvCompanyFilter] = useState("")
  const [pfCompanyFilter, setPfCompanyFilter] = useState("")

  const filteredMeetings = meetings.filter((meeting) => {
    if (meeting.date !== selectedDate) return false;
    if (invNameFilter && !meeting.Selection.Investor.InvName.toLowerCase().includes(invNameFilter.toLowerCase())) return false
    if (pfNameFilter && !meeting.Selection.PortfolioCompany.PFName.toLowerCase().includes(pfNameFilter.toLowerCase())) return false
    if (invCompanyFilter && !meeting.Selection.Investor.InvCompany.toLowerCase().includes(invCompanyFilter.toLowerCase())) return false
    if (pfCompanyFilter && !meeting.Selection.PortfolioCompany.PFCompany.toLowerCase().includes(pfCompanyFilter.toLowerCase())) return false
    return true
  })

  const resetFilters = () => {
    setInvNameFilter("")
    setPfNameFilter("")
    setInvCompanyFilter("")
    setPfCompanyFilter("")
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Filter Panel */}
      <div className="flex items-center gap-4 p-4 border-b flex-wrap">
        <Select value={invNameFilter} onValueChange={setInvNameFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Investor" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(new Set(meetings.map((m) => m.Selection.Investor.InvName))).map((name) => (
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
            {Array.from(new Set(meetings.map((m) => m.Selection.PortfolioCompany.PFName))).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={invCompanyFilter} onValueChange={setInvCompanyFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Inv Company" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(new Set(meetings.map((m) => m.Selection.Investor.InvCompany))).map((company) => (
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
            {Array.from(new Set(meetings.map((m) => m.Selection.PortfolioCompany.PFCompany))).map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>

        <Button variant="outline" onClick={onGenerate}>
          Re-Generate 
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              const currentIndex = uniqueDates.indexOf(selectedDate);
              if (currentIndex > 0) {
                setSelectedDate(uniqueDates[currentIndex - 1]);
              }
            }}
            disabled={uniqueDates.indexOf(selectedDate) === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {uniqueDates.map((date) => {
            const dateObj = new Date(date);
            return (
              <div
                key={date}
                className={cn(
                  "text-center min-w-[60px] cursor-pointer",
                  date === selectedDate && "bg-primary text-primary-foreground rounded-md"
                )}
                onClick={() => setSelectedDate(date)}
              >
                <div className="text-sm font-medium">{dateObj.toLocaleString('default', { month: 'short' })}</div>
                <div className="text-2xl">{dateObj.getDate()}</div>
              </div>
            );
          })}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              const currentIndex = uniqueDates.indexOf(selectedDate);
              if (currentIndex < uniqueDates.length - 1) {
                setSelectedDate(uniqueDates[currentIndex + 1]);
              }
            }}
            disabled={uniqueDates.indexOf(selectedDate) === uniqueDates.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[100px_1fr] h-full">
          {/* Time Labels */}
          <div className="col-start-1 col-span-1 border-r">
            {HOURS.map((hour) => (
              <div key={hour} className="h-20 border-b px-2 py-1 text-sm">
                {hour}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="col-span-1 border-r">
            {HOURS.map((hour) => {
              const cellMeetings = filteredMeetings.filter((m) => {
                const meetingStartTime = m.startTime.split(':')[0].padStart(2, '0') + ':00';
                return meetingStartTime === hour;
              });

              return (
                <div key={`${selectedDate}-${hour}`} className="h-20 border-b relative group">
                  <ScrollArea className="h-full">
                    <div className="flex space-x-2 p-1">
                      {cellMeetings.map((meeting) => (
                        <MeetingCard key={meeting.id} meeting={meeting} onEdit={onEdit} onDelete={onDelete} onSendMail={onSendMail} disabl={disabled} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

type MeetingCardProps = {
  meeting: Meeting
  onEdit: (meeting: Meeting) => void
  onDelete: (id: number) => void
  onSendMail: (meeting: Meeting) => void
  disabl: boolean
}

function MeetingCard({ meeting, onEdit, onDelete, onSendMail,disabl }: MeetingCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-40 flex-shrink-0 cursor-pointer hover:bg-primary/10 transition-colors bg-blue-100 border border-blue-300 shadow-sm">
          <CardHeader className="p-2">
            <div className="flex justify-between items-center">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{meeting.Selection.Investor.InvName[0]}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <p className="text-xs font-medium truncate">{meeting.Selection.Investor.InvName}</p>
            <p className="text-xs text-muted-foreground truncate">with {meeting.Selection.PortfolioCompany.PFName}</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent style={{maxWidth : '400px'}}>
            <CardHeader>
              <div className={`bg-gradient-to-r from-pink-500 to-purple-500 h-32 rounded-t-lg flex items-center justify-center p-0`}>
                <Avatar className="h-20 w-20 border-4 border-white">
                  <AvatarFallback>{getInitials(meeting.Selection.Investor.InvName)}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent className="text-left space-y-2">
            {disabl? <><h3 className="font-semibold text-xl truncate">{meeting.Selection.Investor.InvName} - {meeting.Selection.PortfolioCompany.PFName}</h3>
              <p className="text-sm text-muted-foreground truncate mb-2">{meeting.Selection.Investor.InvCompany} - {meeting.Selection.PortfolioCompany.PFCompany}</p>
              <p className="text-sm ">
                {meeting.Selection.Investor.InvName} from {meeting.Selection.Investor.InvCompany} and {meeting.Selection.PortfolioCompany.PFName} from {meeting.Selection.PortfolioCompany.PFCompany} both have a meeting conflict on {meeting.date} from {meeting.startTime} to {meeting.endTime} add more slot.
              </p></> : <><h3 className="font-semibold text-xl truncate">{meeting.Selection.Investor.InvName} - {meeting.Selection.PortfolioCompany.PFName}</h3>
              <p className="text-sm text-muted-foreground truncate mb-2">{meeting.Selection.Investor.InvCompany} - {meeting.Selection.PortfolioCompany.PFCompany}</p>
              <p className="text-sm line-clamp-3">
                {meeting.Selection.Investor.InvName} from {meeting.Selection.Investor.InvCompany} is having meeting with {meeting.Selection.PortfolioCompany.PFName} from {meeting.Selection.PortfolioCompany.PFCompany} on {meeting.date} from {meeting.startTime} to {meeting.endTime}
              </p></>}
            </CardContent>
            <CardFooter className="flex justify-left mt-auto">
            <Button
                        style={{
                          backgroundColor: "green",
                        }}
                        disabled={disabl}
                        size="sm"
                        onClick={() => onSendMail(meeting)}
                      
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Mail
                      </Button>
              <Button 
              size="sm"
                 onClick={() => onEdit(meeting)}
                style={{
                  marginLeft: "10px",
                }}
                disabled={disabl}
              >
                Edit Details
              </Button>
      
                      <Button
                        variant="destructive"
                        style={{
                          marginLeft: "10px",
                        }}
                        size="sm"
                        onClick={() => onDelete(meeting.id)}
                        disabled={disabl}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
            </CardFooter>
  
      </DialogContent>
    </Dialog>
  )
}

