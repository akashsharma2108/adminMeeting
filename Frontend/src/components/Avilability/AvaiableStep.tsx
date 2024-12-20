import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2, Plus, Minus } from 'lucide-react';
import { useDropzone } from "react-dropzone";
import { useToast } from "../../hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import AvailabilityCards from "../firstflowcompoents/Cards/AvailabiltyCalnder";


dayjs.extend(utc)
dayjs.extend(timezone)

interface AvailabilitySlot {
  id: number
  timezone: string
  date: string
  startTime: string
  endTime: string
}

interface ManualEntry {
  timezone: string
  date: Date | null
  startTime: string
  endTime: string
}

const timezones = ['GMT', 'IST', 'EST', 'PST']

//get it from env
const api = import.meta.env.VITE_APIURL
interface slotStepProps {

    onComplete: () => void;
  
    whatpage?: string;
  
  }

export default function AvaiableStep({onComplete, whatpage}: slotStepProps) {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
   const [isLoading, setIsLoading] = useState(false)
   const [bisLoading, setbisLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
   const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null)
   const [manualEntries, setManualEntries] = useState<ManualEntry[]>([{ timezone: 'GMT', date: null, startTime: '', endTime: '' }])
   const [csvFile, setCsvFile] = useState<File | null>(null)

   const { toast } = useToast()
  
   useEffect(() => {
     fetchAvailabilitySlots()
   }, [])
 
 
   const fetchAvailabilitySlots = async () => {
     setIsLoading(true)
     setError(null)
     try {
       const response = await fetch(`${api}api/availabilityslots`)
       if (!response.ok) {
         throw new Error('Failed to fetch availability slots')
       }
       const data = await response.json()
       setAvailabilitySlots(data)
     } catch (err) {
       setError('Error fetching availability slots. Please try again.')
       console.error('Error fetching availability slots:', err)
       toast({
         title: "Error",
         description: "Failed to fetch availability slots. Please try again.",
         variant: "destructive",
       })
     } finally {
       setIsLoading(false)
     }
   }
 
   const handleManualEntryChange = (index: number, field: keyof ManualEntry, value: string | Date) => {
     const updatedEntries = [...manualEntries]
     updatedEntries[index] = { ...updatedEntries[index], [field]: value }
     setManualEntries(updatedEntries)
   }
 
   const addManualEntry = () => {
     setManualEntries([...manualEntries, { timezone: 'GMT', date: null, startTime: '', endTime: '' }])
   }
 
   const removeManualEntry = (index: number) => {
     const updatedEntries = manualEntries.filter((_, i) => i !== index)
     setManualEntries(updatedEntries)
   }
 
   const onDrop = useCallback((acceptedFiles: File[]) => {
     setCsvFile(acceptedFiles[0])
   }, [])
 
   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } })
 
   const convertToIST = (date: Date, time: string, timezone: string): string => {
     const dateTime = dayjs.tz(`${dayjs(date).format('YYYY-MM-DD')}T${time}`, timezone)
     return dateTime.tz('Asia/Kolkata').format('HH:mm:ss')
   }
 
   const handleSubmit = async () => {
     setbisLoading(true)
     if (!csvFile && manualEntries.every(entry => !entry.date || !entry.startTime || !entry.endTime)) {
       setError('Please provide either a CSV file or manual entries.')
       toast({
         title: "Error",
         description: "Please provide either a CSV file or manual entries.",
         variant: "destructive",
       })
       setbisLoading(false)
       return
     }
 
     let dataToSubmit: { timezone: string[], date: string[], startTime: string[], endTime: string[], istStartTime?: string[], istEndTime?: string[] }
 
     if (csvFile) {
       const text = await csvFile.text()
       const rows = text.split('\n').slice(1) // Assuming the first row is headers
       dataToSubmit = rows.reduce((acc: { timezone: string[], date: string[], startTime: string[], endTime: string[] }, row) => {
         const [_id, timezone, date, startTime, endTime] = row.split(',')
         acc.timezone.push(timezone.trim())
         acc.date.push(date.trim())
         acc.startTime.push(startTime.trim())
         acc.endTime.push(endTime.trim())
         return acc
       }, { timezone: [], date: [], startTime: [], endTime: [] })
     } else {
       // Handle manual entries
       dataToSubmit = manualEntries.reduce((acc: { timezone: string[], date: string[], startTime: string[], endTime: string[] }, entry) => {
         if (entry.date && entry.startTime && entry.endTime) {
           acc.timezone.push(entry.timezone)
           acc.date.push(dayjs(entry.date).format('YYYY-MM-DD'))
           acc.startTime.push(convertToIST(entry.date, entry.startTime, entry.timezone))
           acc.endTime.push(convertToIST(entry.date, entry.endTime, entry.timezone))
         }  
         return acc
       }, { timezone: [], date: [], startTime: [], endTime: [] })
     }
    

     try {
       const response = await fetch(`${api}api/availabilityslots`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(dataToSubmit) 
       })
 
       if (response.ok) {
         await fetchAvailabilitySlots()
         setIsAddDialogOpen(false)
         setCsvFile(null)
         setManualEntries([{ timezone: 'GMT', date: null, startTime: '', endTime: '' }])
         toast({
           title: "Success",
           description: "Availability slots added successfully.",
         })
       } else {
         throw new Error('Failed to add availability slots')
       }
     } catch (error) {
       console.error('Error adding availability slots:', error)
       setError('Failed to add availability slots. Please try again.')
       toast({
         title: "Error",
         description: "Failed to add availability slots. Please try again.",
         variant: "destructive",
       })
     } finally {
       setbisLoading(false)
     }
   }
 
   const handleEdit = (slot: AvailabilitySlot) => {
     setEditingSlot(slot)
     setIsEditDialogOpen(true)
   }
 
   const handleEditSubmit = async () => {
     setbisLoading(true)
     if (!editingSlot) return
 
     try {
       const response = await fetch(`${api}api/availabilityslots/${editingSlot.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           timezone: editingSlot.timezone,
           date: editingSlot.date,
           startTime: editingSlot.startTime,
           endTime: editingSlot.endTime,
         })
       })
 
       if (response.ok) {
         const updatedSlot = await response.json()
         setAvailabilitySlots(availabilitySlots.map(slot => slot.id === updatedSlot.id ? updatedSlot : slot))
         setIsEditDialogOpen(false)
         setEditingSlot(null)
         toast({
           title: "Success",
           description: "Availability slot updated successfully.",
         })
       } else {
         throw new Error('Failed to update availability slot')
       }
     } catch (error) {
       console.error('Error updating availability slot:', error)
       toast({
         title: "Error",
         description: "Failed to update availability slot. Please try again.",
         variant: "destructive",
       })
     } finally {
       setbisLoading(false)
     }
   }
 
   const handleDelete = async (id: number) => {
     setbisLoading(true)
     try {
       const response = await fetch(`${api}api/availabilityslots/${id}`, {
         method: 'DELETE',
       })
 
       if (response.ok) {
         setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== id))
         toast({
           title: "Success",
           description: "Availability slot deleted successfully.",
         })
       } else {
         throw new Error('Failed to delete availability slot')
       }
     } catch (error) {
       console.error('Error deleting availability slot:', error)
       toast({
         title: "Error",
         description: "Failed to delete availability slot. Please try again.",
         variant: "destructive",
       })
     } finally {
         setbisLoading(false)
         }
   }
 
   if (isLoading) {
     return (
       <div className="flex justify-center items-center h-64">
         <Loader2 className="h-8 w-8 animate-spin" />
       </div>
     )
   }
 
  return (
    <motion.div
      className="p-8 rounded-lg  text-center"
      style={{
        width: "fit-content",
      }}
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
      {availabilitySlots.length === 0 ? (
        <>
          {" "}
          <motion.h2
            className="text-2xl font-bold mb-4 "
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            What about date and time for the meetings?
          </motion.h2>
          <motion.p
            className="mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Let's add some Date and time.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              onClick={() => {
                setIsAddDialogOpen(true);
              }}
            >
              Add Slots
            </Button>
          </motion.div>
        </>
      ) : null}

      {availabilitySlots.length > 0 && (
        <>
          <div
            className="overflow-y-auto h-96"
            style={{
              overflowX: "auto",
              height: "calc(78vh - 4rem)",
              width: "80vw",
              margin: '0 auto',
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "-ms-autohiding-scrollbar",
            }}
          >
            
            <AvailabilityCards
        avaikable={availabilitySlots}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
          </div>
          <div className="flex flex-row justify-center items-center gap-4 mt-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                onClick={() => {
                  setIsAddDialogOpen(true);
                }}
              >
                Add More{" "}
              </Button>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {whatpage === "main"?
             <>  <p className="text-sm text-gray-600">Total {availabilitySlots.length} slots</p></>
              :<Button onClick={onComplete}>Done {availabilitySlots.length} </Button>}
            </motion.div>
          </div>
        </>
      )}

           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
             <DialogContent className="max-w-3xl">
               <DialogHeader>
                 <DialogTitle>Add New Availability Slots</DialogTitle>
               </DialogHeader>
               <div className="grid gap-6">
                 <div {...getRootProps()} className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer">
                   <input {...getInputProps()} />
                   {isDragActive ? (
                     <p>Drop the CSV file here ...</p>
                   ) : (
                     <p>Drag 'n' drop a CSV file here, or click to select a file</p>
                   )}
                   {csvFile && <p className="mt-2">File selected: {csvFile.name}</p>}
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold mb-2">Manual Entry</h3>
                   {manualEntries.map((entry, index) => (
                     <div key={index} className="grid grid-cols-5 gap-2 mb-4">
                       <Select
                         value={entry.timezone}
                         onValueChange={(value) => handleManualEntryChange(index, 'timezone', value)}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select timezone" />
                         </SelectTrigger>
                         <SelectContent>
                           {timezones.map((tz) => (
                             <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <DatePicker
                         selected={entry.date}
                         onChange={(date: Date | null) => handleManualEntryChange(index, 'date', date as any)}
                         className="w-full p-2 border rounded"
                       />
                       <Input
                         type="time"
                         value={entry.startTime}
                         onChange={(e) => handleManualEntryChange(index, 'startTime', e.target.value)}
                       />
                       <Input
                         type="time"
                         value={entry.endTime}
                         onChange={(e) => handleManualEntryChange(index, 'endTime', e.target.value)}
                       />
                       {index === manualEntries.length - 1 ? (
                         <Button variant="outline" size="icon" onClick={addManualEntry}>
                           <Plus className="h-4 w-4" />
                         </Button>
                       ) : (
                         <Button variant="outline" size="icon" onClick={() => removeManualEntry(index)}>
                           <Minus className="h-4 w-4" />
                         </Button>
                       )}
                     </div>
                   ))}
                   {manualEntries.map((entry, index) => (
                     entry.date && entry.startTime && entry.endTime && (
                       <div key={`ist-${index}`} className="text-sm text-gray-600 mb-2">
                         IST: {convertToIST(entry.date, entry.startTime, entry.timezone)} - {convertToIST(entry.date, entry.endTime, entry.timezone)}
                       </div>
                     )
                   ))}
                 </div>
                 {error && <p className="text-red-500">{error}</p>}
                 { bisLoading ?
             <Loader2 className="h-8 w-8 animate-spin" />
           :  <Button onClick={handleSubmit}>Submit</Button>}
               </div>
             </DialogContent>
           </Dialog>
     
           <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Edit Availability Slot</DialogTitle>
               </DialogHeader>
               {editingSlot && (
                 <div className="grid gap-4">
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="edit-date" className="text-right">
                       Date
                     </Label>
                     <DatePicker
                       selected={editingSlot ? new Date(editingSlot.date) : null}
                       onChange={(date: Date | null) => date && setEditingSlot({ ...editingSlot!, date: dayjs(date).format('YYYY-MM-DD') })}
                       className="w-full p-2 border rounded col-span-3"
                     />
                   </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="edit-start-time" className="text-right">
                       Start Time
                     </Label>
                     <Input
                       id="edit-start-time"
                       type="time"
                       value={editingSlot.startTime}
                       onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
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
                       value={editingSlot.endTime}
                       onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                       className="col-span-3"
                     />
                   </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="edit-timezone" className="text-right">
                       Timezone
                     </Label>
                     <Select
                       value={editingSlot.timezone}
                       onValueChange={(value) => setEditingSlot({ ...editingSlot, timezone: value })}
                     >
                       <SelectTrigger className="col-span-3">
                         <SelectValue placeholder="Select timezone" />
                       </SelectTrigger>
                       <SelectContent>
                         {timezones.map((tz) => (
                           <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   { bisLoading ?
             <Loader2 className="h-8 w-8 animate-spin" /> : <Button onClick={handleEditSubmit}>Update Availability Slot</Button> }
                 </div>
               )}
             </DialogContent>
           </Dialog>
    </motion.div>
  );
}

