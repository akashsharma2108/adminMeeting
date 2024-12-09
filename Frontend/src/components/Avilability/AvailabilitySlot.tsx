// import { useState, useEffect, useCallback } from 'react'
// import { Button } from "../ui/button"
// import { Input } from "../ui/input"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
// import { Label } from "../ui/label"
// import { Loader2, Plus, Minus } from 'lucide-react'
// import { useDropzone } from 'react-dropzone'
// import { useToast } from "../../hooks/use-toast"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
// import DatePicker from "react-datepicker"
// import "react-datepicker/dist/react-datepicker.css"
// import dayjs from 'dayjs'
// import utc from 'dayjs/plugin/utc'
// import timezone from 'dayjs/plugin/timezone'
// import { Card, CardContent, CardFooter } from "../ui/card"
// import { Globe, Edit, Trash2, CalendarDays ,ClockArrowUp, ClockArrowDown } from "lucide-react"
// import { Search } from "lucide-react"

// dayjs.extend(utc)
// dayjs.extend(timezone)

// interface AvailabilitySlot {
//   id: number
//   timezone: string
//   date: string
//   startTime: string
//   endTime: string
// }

// interface ManualEntry {
//   timezone: string
//   date: Date | null
//   startTime: string
//   endTime: string
// }

// const timezones = ['GMT', 'IST', 'EST', 'PST']

// //get it from env
// const api = import.meta.env.VITE_APIURL
// export default function AvailabilityTab() {
//   const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [bisLoading, setbisLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null)
//   const [manualEntries, setManualEntries] = useState<ManualEntry[]>([{ timezone: 'GMT', date: null, startTime: '', endTime: '' }])
//   const [csvFile, setCsvFile] = useState<File | null>(null)
//   const [filtered, setFiltered] = useState<AvailabilitySlot[]>([])
//   const [searchTerm, setSearchTerm] = useState("")
//   const { toast } = useToast()
 
//   useEffect(() => {
//     fetchAvailabilitySlots()
//   }, [])

//   useEffect(() => {
//     if (!isLoading && availabilitySlots.length > 0) {
//     const filtered = availabilitySlots.filter((availabilitySlots) =>
//       availabilitySlots.timezone.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     setFiltered(filtered)
//     }
//   }, [availabilitySlots, searchTerm])

//   const fetchAvailabilitySlots = async () => {
//     setIsLoading(true)
//     setError(null)
//     try {
//       const response = await fetch(`${api}api/availabilityslots`)
//       if (!response.ok) {
//         throw new Error('Failed to fetch availability slots')
//       }
//       const data = await response.json()
//       setAvailabilitySlots(data)
//     } catch (err) {
//       setError('Error fetching availability slots. Please try again.')
//       console.error('Error fetching availability slots:', err)
//       toast({
//         title: "Error",
//         description: "Failed to fetch availability slots. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleManualEntryChange = (index: number, field: keyof ManualEntry, value: string | Date) => {
//     const updatedEntries = [...manualEntries]
//     updatedEntries[index] = { ...updatedEntries[index], [field]: value }
//     setManualEntries(updatedEntries)
//   }

//   const addManualEntry = () => {
//     setManualEntries([...manualEntries, { timezone: 'GMT', date: null, startTime: '', endTime: '' }])
//   }

//   const removeManualEntry = (index: number) => {
//     const updatedEntries = manualEntries.filter((_, i) => i !== index)
//     setManualEntries(updatedEntries)
//   }

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     setCsvFile(acceptedFiles[0])
//   }, [])

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } })

//   const convertToIST = (date: Date, time: string, timezone: string): string => {
//     const dateTime = dayjs.tz(`${dayjs(date).format('YYYY-MM-DD')}T${time}`, timezone)
//     return dateTime.tz('Asia/Kolkata').format('HH:mm:ss')
//   }

//   const handleSubmit = async () => {
//     setbisLoading(true)
//     if (!csvFile && manualEntries.every(entry => !entry.date || !entry.startTime || !entry.endTime)) {
//       setError('Please provide either a CSV file or manual entries.')
//       toast({
//         title: "Error",
//         description: "Please provide either a CSV file or manual entries.",
//         variant: "destructive",
//       })
//       return
//     }

//     let dataToSubmit: { timezone: string[], date: string[], startTime: string[], endTime: string[] }

//     if (csvFile) {
//       const text = await csvFile.text()
//       const rows = text.split('\n').slice(1) // Assuming the first row is headers
//       dataToSubmit = rows.reduce((acc: { timezone: string[], date: string[], startTime: string[], endTime: string[] }, row) => {
//         const [_id,timezone, date, startTime, endTime] = row.split(',')
//         acc.timezone.push(timezone.trim())
//         acc.date.push(date.trim())
//         acc.startTime.push(startTime.trim())
//         acc.endTime.push(endTime.trim())
//         return acc
//       }, { timezone: [], date: [], startTime: [], endTime: [] })
//     } else {
//       dataToSubmit = manualEntries.reduce((acc: { timezone: string[], date: string[], startTime: string[], endTime: string[] }, entry) => {
//         if (entry.date && entry.startTime && entry.endTime) {
//           acc.timezone.push(entry.timezone)
//           acc.date.push(dayjs(entry.date).format('YYYY-MM-DD'))
//           acc.startTime.push(entry.startTime)
//           acc.endTime.push(entry.endTime)
//         }
//         return acc
//       }, { timezone: [], date: [], startTime: [], endTime: [] })
//     }

//     try {
//       const response = await fetch(`${api}api/availabilityslots`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(dataToSubmit)
//       })

//       if (response.ok) {
//         await fetchAvailabilitySlots()
//         setIsAddDialogOpen(false)
//         setCsvFile(null)
//         setManualEntries([{ timezone: 'GMT', date: null, startTime: '', endTime: '' }])
//         toast({
//           title: "Success",
//           description: "Availability slots added successfully.",
//         })
//       } else {
//         throw new Error('Failed to add availability slots')
//       }
//     } catch (error) {
//       console.error('Error adding availability slots:', error)
//       setError('Failed to add availability slots. Please try again.')
//       toast({
//         title: "Error",
//         description: "Failed to add availability slots. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setbisLoading(false)
//     }
//   }

//   const handleEdit = (slot: AvailabilitySlot) => {
//     setEditingSlot(slot)
//     setIsEditDialogOpen(true)
//   }

//   const handleEditSubmit = async () => {
//     setbisLoading(true)
//     if (!editingSlot) return

//     try {
//       const response = await fetch(`${api}api/availabilityslots/${editingSlot.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           timezone: editingSlot.timezone,
//           date: editingSlot.date,
//           startTime: editingSlot.startTime,
//           endTime: editingSlot.endTime,
//         })
//       })

//       if (response.ok) {
//         const updatedSlot = await response.json()
//         setAvailabilitySlots(availabilitySlots.map(slot => slot.id === updatedSlot.id ? updatedSlot : slot))
//         setIsEditDialogOpen(false)
//         setEditingSlot(null)
//         toast({
//           title: "Success",
//           description: "Availability slot updated successfully.",
//         })
//       } else {
//         throw new Error('Failed to update availability slot')
//       }
//     } catch (error) {
//       console.error('Error updating availability slot:', error)
//       toast({
//         title: "Error",
//         description: "Failed to update availability slot. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setbisLoading(false)
//     }
//   }

//   const handleDelete = async (id: number) => {
//     setbisLoading(true)
//     try {
//       const response = await fetch(`${api}/api/availabilityslots/${id}`, {
//         method: 'DELETE',
//       })

//       if (response.ok) {
//         setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== id))
//         toast({
//           title: "Success",
//           description: "Availability slot deleted successfully.",
//         })
//       } else {
//         throw new Error('Failed to delete availability slot')
//       }
//     } catch (error) {
//       console.error('Error deleting availability slot:', error)
//       toast({
//         title: "Error",
//         description: "Failed to delete availability slot. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//         setbisLoading(false)
//         }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     )
//   }



//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <div>
//         <h2 className="text-2xl font-semibold">Availability Slots</h2>
//         <span className="text-lg text-gray-500">Total slots: {availabilitySlots.length}</span>
//         </div>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <Input
//             type="text"
//             placeholder="Search by Timezone.."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 pr-4 py-2 w-full"
//           />
//         </div>
//           <Button onClick={() => setIsAddDialogOpen(true)}>Add Availability Slot</Button>
//       </div>

//       {availabilitySlots.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64">
//           <p className="mb-4">No Slot found. Please add new slots</p>
//         </div>
//       ) : (
//     <>
//     <div style={{
//       overflowX: "auto",
//       height: "calc(100vh - 400px)"
//     }}> 
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {filtered.map((investor) => (
//         <Card key={investor.id} className="flex flex-col">
//           <CardContent className="flex-grow p-6">
//             <div className="flex items-center mb-4">
//               <CalendarDays className="h-5 w-5 mr-2 text-gray-500" />
//               <h3 className="text-lg font-semibold">{investor.date}</h3>
//             </div>
//             <div className="flex items-center mb-2">
//               <ClockArrowUp className="h-5 w-5 mr-2 text-gray-500" />
//               <span>{investor.startTime}</span>
//             </div>
//             <div className="flex items-center mb-2">
//               <ClockArrowDown className="h-5 w-5 mr-2 text-gray-500" />
//               <span className="text-sm">{investor.endTime}</span>
//             </div>
//             <div className="flex items-center">
//               <Globe className="h-5 w-5 mr-2 text-gray-500" />
//               <span>{investor.timezone}</span>
//             </div>
//           </CardContent>
//           <CardFooter className="flex justify-end space-x-2 p-4 bg-gray-50">
//             <Button variant="outline" size="sm" onClick={() => handleEdit(investor)}>
//               <Edit className="h-4 w-4 mr-1" />
//               Edit
//             </Button>
//             <Button variant="destructive" size="sm" onClick={() => handleDelete(investor.id)}>
//               <Trash2 className="h-4 w-4 mr-1" />
//               Delete
//             </Button>
//           </CardFooter>
//         </Card>
//       ))}
//     </div>
//     </div>
//     </>
//     )}

//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <DialogContent className="max-w-3xl">
//           <DialogHeader>
//             <DialogTitle>Add New Availability Slots</DialogTitle>
//           </DialogHeader>
//           <div className="grid gap-6">
//             <div {...getRootProps()} className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer">
//               <input {...getInputProps()} />
//               {isDragActive ? (
//                 <p>Drop the CSV file here ...</p>
//               ) : (
//                 <p>Drag 'n' drop a CSV file here, or click to select a file</p>
//               )}
//               {csvFile && <p className="mt-2">File selected: {csvFile.name}</p>}
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold mb-2">Manual Entry</h3>
//               {manualEntries.map((entry, index) => (
//                 <div key={index} className="grid grid-cols-5 gap-2 mb-4">
//                   <Select
//                     value={entry.timezone}
//                     onValueChange={(value) => handleManualEntryChange(index, 'timezone', value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select timezone" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {timezones.map((tz) => (
//                         <SelectItem key={tz} value={tz}>{tz}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <DatePicker
//                     selected={entry.date}
//                     onChange={(date: Date | null) => handleManualEntryChange(index, 'date', date as any)}
//                     className="w-full p-2 border rounded"
//                   />
//                   <Input
//                     type="time"
//                     value={entry.startTime}
//                     onChange={(e) => handleManualEntryChange(index, 'startTime', e.target.value)}
//                   />
//                   <Input
//                     type="time"
//                     value={entry.endTime}
//                     onChange={(e) => handleManualEntryChange(index, 'endTime', e.target.value)}
//                   />
//                   {index === manualEntries.length - 1 ? (
//                     <Button variant="outline" size="icon" onClick={addManualEntry}>
//                       <Plus className="h-4 w-4" />
//                     </Button>
//                   ) : (
//                     <Button variant="outline" size="icon" onClick={() => removeManualEntry(index)}>
//                       <Minus className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               ))}
//               {manualEntries.map((entry, index) => (
//                 entry.date && entry.startTime && entry.endTime && (
//                   <div key={`ist-${index}`} className="text-sm text-gray-600 mb-2">
//                     IST: {convertToIST(entry.date, entry.startTime, entry.timezone)} - {convertToIST(entry.date, entry.endTime, entry.timezone)}
//                   </div>
//                 )
//               ))}
//             </div>
//             {error && <p className="text-red-500">{error}</p>}
//             { bisLoading ?
//         <Loader2 className="h-8 w-8 animate-spin" />
//       :  <Button onClick={handleSubmit}>Submit</Button>}
//           </div>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Availability Slot</DialogTitle>
//           </DialogHeader>
//           {editingSlot && (
//             <div className="grid gap-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="edit-date" className="text-right">
//                   Date
//                 </Label>
//                 <DatePicker
//                   selected={editingSlot ? new Date(editingSlot.date) : null}
//                   onChange={(date: Date | null) => date && setEditingSlot({ ...editingSlot!, date: dayjs(date).format('YYYY-MM-DD') })}
//                   className="w-full p-2 border rounded col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="edit-start-time" className="text-right">
//                   Start Time
//                 </Label>
//                 <Input
//                   id="edit-start-time"
//                   type="time"
//                   value={editingSlot.startTime}
//                   onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="edit-end-time" className="text-right">
//                   End Time
//                 </Label>
//                 <Input
//                   id="edit-end-time"
//                   type="time"
//                   value={editingSlot.endTime}
//                   onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="edit-timezone" className="text-right">
//                   Timezone
//                 </Label>
//                 <Select
//                   value={editingSlot.timezone}
//                   onValueChange={(value) => setEditingSlot({ ...editingSlot, timezone: value })}
//                 >
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder="Select timezone" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {timezones.map((tz) => (
//                       <SelectItem key={tz} value={tz}>{tz}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               { bisLoading ?
//         <Loader2 className="h-8 w-8 animate-spin" /> : <Button onClick={handleEditSubmit}>Update Availability Slot</Button> }
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }