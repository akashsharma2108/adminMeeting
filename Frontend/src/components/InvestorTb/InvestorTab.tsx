import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Loader2, Plus, Minus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "../../hooks/use-toast";
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Card, CardContent, CardFooter } from "../ui/card"
import { Building2, Globe, Mail, Edit, Trash2 } from "lucide-react"
import { Search } from "lucide-react"

interface Investor {
  InvId: string
  InvName: string
  InvEmail: string
  InvCompany: string
  InvTimezone: string
}

interface ManualEntry {
  InvName: string
  InvEmail: string
  InvCompany: string
  InvTimezone: string
}

export default function InvestorTab() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bisLoading, setbisLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null)
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([
    { InvName: "", InvCompany: "", InvTimezone: "", InvEmail: "" },
  ])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [filtered, setFiltered] = useState<Investor[]>([])
    const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchInvestors()
  }, [])

  useEffect(() => {
    if (!isLoading && investors.length > 0) {
    const filtered = investors.filter((investors) =>
      investors.InvName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFiltered(filtered)
    }
  }, [investors, searchTerm])

  const fetchInvestors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:4000/api/investors")
      if (!response.ok) {
        throw new Error("Failed to fetch investors")
      }
      const data = await response.json()
      setInvestors(data)
    } catch (err) {
      console.error("Error fetching investors:", err)
      toast({
        title: "Error",
        description: "Failed to fetch investors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualEntryChange = (
    index: number,
    field: keyof ManualEntry,
    value: string
  ) => {
    const updatedEntries = [...manualEntries]
    updatedEntries[index][field] = value
    setManualEntries(updatedEntries)
  }

  const addManualEntry = () => {
    setManualEntries([
      ...manualEntries,
      { InvName: "", InvCompany: "", InvTimezone: "", InvEmail: "" },
    ])
  }

  const removeManualEntry = (index: number) => {
    const updatedEntries = manualEntries.filter((_, i) => i !== index)
    setManualEntries(updatedEntries)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setCsvFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  })

  const handleSubmit = async () => {
    setbisLoading(true)
    if (
      !csvFile &&
      manualEntries.every(
        (entry) => !entry.InvName && !entry.InvCompany && !entry.InvTimezone && !entry.InvEmail
      )
    ) {
      toast({
        title: "Error",
        description: "Please provide either a CSV file or manual entries.",
        variant: "destructive",
      })
      return
    }

    let dataToSubmit: {
      InvName: string[]
      InvCompany: string[]
      InvTimezone: string[]
      InvEmail: string[]
    } = {
      InvName: [],
      InvCompany: [],
      InvTimezone: [],
      InvEmail: []
    }

    if (csvFile) {
      const text = await csvFile.text()
      const rows = text.split("\n").slice(1) // Assuming the first row is headers
      rows.forEach((row) => {
        const [_InvId, InvName, InvCompany, InvTimezone, InvEmail] = row.split(",").map((item) => item.trim())
        dataToSubmit.InvName.push(InvName)
        dataToSubmit.InvCompany.push(InvCompany)
        dataToSubmit.InvTimezone.push(InvTimezone)
        dataToSubmit.InvEmail.push(InvEmail)
      })
    } else {
      manualEntries.forEach((entry) => {
        if (entry.InvName && entry.InvCompany && entry.InvTimezone && entry.InvEmail) {
          dataToSubmit.InvName.push(entry.InvName)
          dataToSubmit.InvCompany.push(entry.InvCompany)
          dataToSubmit.InvTimezone.push(entry.InvTimezone)
          dataToSubmit.InvEmail.push(entry.InvEmail)
        }
      })
    }

    try {
      const response = await fetch('http://localhost:4000/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      })

      if (response.ok) {
        await fetchInvestors()
        setIsAddDialogOpen(false)
        setCsvFile(null)
        setManualEntries([{ InvName: '', InvCompany: '', InvTimezone: '', InvEmail: '' }])
        toast({
          title: "Success",
          description: "Investors added successfully.",
        })
      } else {
        throw new Error('Failed to add investors')
      }
    } catch (error) {
      console.error('Error adding investors:', error)
      toast({
        title: "Error",
        description: "Failed to add investors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setbisLoading(false)
    }
  }

  const handleEdit = (investor: Investor) => {
    setEditingInvestor(investor)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    setbisLoading(true)
    if (!editingInvestor) return
    try {
      const response = await fetch(
        `http://localhost:4000/api/investors/${editingInvestor.InvId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingInvestor),
        }
      )
      if (response.ok) {
        const updatedInvestor = await response.json()
        setInvestors(investors.map((inv) => (inv.InvId === updatedInvestor.InvId ? updatedInvestor : inv)))
        setIsEditDialogOpen(false)
        setEditingInvestor(null)
        toast({
          title: "Success",
          description: "Investor updated successfully.",
        })
      } else {
        throw new Error("Failed to update investor")
      }
    } catch (error) {
      console.error("Error updating investor:", error)
      toast({
        title: "Error",
        description: "Failed to update investor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setbisLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setbisLoading(true)
    try {
      const response = await fetch(`http://localhost:4000/api/investors/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setInvestors(investors.filter((inv) => inv.InvId !== id))
        toast({
          title: "Success",
          description: "Investor deleted successfully.",
        })
      } else {
        throw new Error("Failed to delete investor")
      }
    } catch (error) {
      console.error("Error deleting investor:", error)
      toast({
        title: "Error",
        description: "Failed to delete investor. Please try again.",
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
        <h2 className="text-2xl font-semibold">Investors</h2>
        <span className="text-lg text-gray-500">Total Investors: {investors.length}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Investor</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-gray-500">No investors found. Please add some investors.</p>
        </div>
      ) : (
        <>
        <div style={{
          overflowX: "auto",
          height: "calc(100vh - 400px)"
        }}> 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((investor) => (
            <Card key={investor.InvId} className="flex flex-col">
              <CardContent className="flex-grow p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>{investor.InvName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{investor.InvName}</h3>
                </div>
                <div className="flex items-center mb-2">
                  <Building2 className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{investor.InvCompany}</span>
                </div>
                <div className="flex items-center mb-2">
                  <Globe className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{investor.InvTimezone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-sm">{investor.InvEmail}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 p-4 bg-gray-50">
              { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :       <Button variant="outline" size="sm" onClick={() => handleEdit(investor)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>}
                { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :         <Button variant="destructive" size="sm" onClick={() => handleDelete(investor.InvId)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button> }
              </CardFooter>
            </Card>
          ))}
        </div>
        </div>
        </>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Investors</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer"
            >
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
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Name"
                    value={entry.InvName}
                    onChange={(e) =>
                      handleManualEntryChange(index, "InvName", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Company"
                    value={entry.InvCompany}
                    onChange={(e) =>
                      handleManualEntryChange(
                        index,
                        "InvCompany",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Timezone"
                    value={entry.InvTimezone}
                    onChange={(e) =>
                      handleManualEntryChange(
                        index,
                        "InvTimezone",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Email"
                    value={entry.InvEmail}
                    onChange={(e) =>
                      handleManualEntryChange(
                        index,
                        "InvEmail",
                        e.target.value
                      )
                    }
                  />
                  {index === manualEntries.length - 1 ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={addManualEntry}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeManualEntry(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Investor</DialogTitle>
          </DialogHeader>
          {editingInvestor && (
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingInvestor.InvName}
                  onChange={(e) => setEditingInvestor({ ...editingInvestor, InvName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-company" className="text-right">
                  Company
                </Label>
                <Input
                  id="edit-company"
                  value={editingInvestor.InvCompany}
                  onChange={(e) => setEditingInvestor({ ...editingInvestor, InvCompany: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timezone" className="text-right">
                  Timezone
                </Label>
                <Input
                  id="edit-timezone"
                  value={editingInvestor.InvTimezone}
                  onChange={(e) => setEditingInvestor({ ...editingInvestor, InvTimezone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={editingInvestor.InvEmail}
                  onChange={(e) => setEditingInvestor({ ...editingInvestor, InvEmail: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <Button onClick={handleEditSubmit}>Update Investor</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}