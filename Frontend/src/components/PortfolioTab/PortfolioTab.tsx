import { useState, useEffect, useCallback } from 'react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Loader2, Plus, Minus } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useToast } from "../../hooks/use-toast"

interface PortfolioCompany {
  PFId: number
  PFName: string
  PFCompany: string
  PFTimezone: string
  createdAt: string
  updatedAt: string
}

interface ManualEntry {
  PFName: string
  PFCompany: string
  PFTimezone: string
}

export default function PortfolioTab() {
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bisLoading, setbisLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<PortfolioCompany | null>(null)
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([{ PFName: '', PFCompany: '', PFTimezone: '' }])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPortfolioCompanies()
  }, [])

  const fetchPortfolioCompanies = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:4000/api/portfoliocompanies')
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio companies')
      }
      const data = await response.json()
      setPortfolioCompanies(data)
    } catch (err) {
      setError('Error fetching portfolio companies. Please try again.')
      console.error('Error fetching portfolio companies:', err)
      toast({
        title: "Error",
        description: "Failed to fetch portfolio companies. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualEntryChange = (index: number, field: keyof ManualEntry, value: string) => {
    const updatedEntries = [...manualEntries]
    updatedEntries[index][field] = value
    setManualEntries(updatedEntries)
  }

  const addManualEntry = () => {
    setManualEntries([...manualEntries, { PFName: '', PFCompany: '', PFTimezone: '' }])
  }

  const removeManualEntry = (index: number) => {
    const updatedEntries = manualEntries.filter((_, i) => i !== index)
    setManualEntries(updatedEntries)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setCsvFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } })

  const handleSubmit = async () => {
    setbisLoading(true)
    if (!csvFile && manualEntries.every(entry => !entry.PFName && !entry.PFCompany && !entry.PFTimezone)) {
      setError('Please provide either a CSV file or manual entries.')
      toast({
        title: "Error",
        description: "Please provide either a CSV file or manual entries.",
        variant: "destructive",
      })
      return
    }

    let dataToSubmit: { PFName: string[], PFCompany: string[], PFTimezone: string[] }

    if (csvFile) {
      const text = await csvFile.text()
      const rows = text.split('\n').slice(1) // Assuming the first row is headers
      dataToSubmit = rows.reduce((acc: { PFName: string[], PFCompany: string[], PFTimezone: string[] }, row) => {
        const [_PFId, PFName, PFCompany, PFTimezone] = row.split(',');
        acc.PFName.push(PFName.trim())
        acc.PFCompany.push(PFCompany.trim())
        acc.PFTimezone.push(PFTimezone.trim())
        return acc
      }, { PFName: [], PFCompany: [], PFTimezone: [] })
    } else {
      dataToSubmit = manualEntries.reduce((acc: { PFName: string[], PFCompany: string[], PFTimezone: string[] }, entry) => {
        if (entry.PFName || entry.PFCompany || entry.PFTimezone) {
          acc.PFName.push(entry.PFName)
          acc.PFCompany.push(entry.PFCompany)
          acc.PFTimezone.push(entry.PFTimezone)
        }
        return acc
      }, { PFName: [], PFCompany: [], PFTimezone: [] })
    }

    try {
      const response = await fetch('http://localhost:4000/api/portfoliocompanies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      })

      if (response.ok) {
        await fetchPortfolioCompanies()
        setIsAddDialogOpen(false)
        setCsvFile(null)
        setManualEntries([{ PFName: '', PFCompany: '', PFTimezone: '' }])
        toast({
          title: "Success",
          description: "Portfolio companies added successfully.",
        })
      } else {
        throw new Error('Failed to add portfolio companies')
      }
    } catch (error) {
      console.error('Error adding portfolio companies:', error)
      setError('Failed to add portfolio companies. Please try again.')
      toast({
        title: "Error",
        description: "Failed to add portfolio companies. Please try again.",
        variant: "destructive",
      })
    } finally {
      setbisLoading(false)
    }
  }

  const handleEdit = (company: PortfolioCompany) => {
    setEditingCompany(company)
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    setbisLoading(true)
    if (!editingCompany) return

    try {
      const response = await fetch(`http://localhost:4000/api/portfoliocompanies/${editingCompany.PFId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PFName: editingCompany.PFName,
          PFCompany: editingCompany.PFCompany,
          PFTimezone: editingCompany.PFTimezone,
        })
      })

      if (response.ok) {
        const updatedCompany = await response.json()
        setPortfolioCompanies(portfolioCompanies.map(company => company.PFId === updatedCompany.PFId ? updatedCompany : company))
        setIsEditDialogOpen(false)
        setEditingCompany(null)
        toast({
          title: "Success",
          description: "Portfolio company updated successfully.",
        })
      } else {
        throw new Error('Failed to update portfolio company')
      }
    } catch (error) {
      console.error('Error updating portfolio company:', error)
      toast({
        title: "Error",
        description: "Failed to update portfolio company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setbisLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setbisLoading(true)
    try {
      const response = await fetch(`http://localhost:4000/api/portfoliocompanies/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPortfolioCompanies(portfolioCompanies.filter(company => company.PFId !== id))
        toast({
          title: "Success",
          description: "Portfolio company deleted successfully.",
        })
      } else {
        throw new Error('Failed to delete portfolio company')
      }
    } catch (error) {
      console.error('Error deleting portfolio company:', error)
      toast({
        title: "Error",
        description: "Failed to delete portfolio company. Please try again.",
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Portfolio Companies</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Portfolio Company</Button>
      </div>

      {portfolioCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="mb-4">No investors found.</p>
        </div>
      ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Timezone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolioCompanies.map((company) => (
            <TableRow key={company.PFId}>
              <TableCell>{company.PFName}</TableCell>
              <TableCell>{company.PFCompany}</TableCell>
              <TableCell>{company.PFTimezone}</TableCell>
              <TableCell>
              { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :    <Button variant="outline" className="mr-2" onClick={() => handleEdit(company)}>Edit</Button> }
            { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :    <Button variant="destructive" onClick={() => handleDelete(company.PFId)}>Delete</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>)}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Portfolio Companies</DialogTitle>
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
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Name"
                    value={entry.PFName}
                    onChange={(e) => handleManualEntryChange(index, 'PFName', e.target.value)}
                  />
                  <Input
                    placeholder="Company"
                    value={entry.PFCompany}
                    onChange={(e) => handleManualEntryChange(index, 'PFCompany', e.target.value)}
                  />
                  <Input
                    placeholder="Timezone"
                    value={entry.PFTimezone}
                    onChange={(e) => handleManualEntryChange(index, 'PFTimezone', e.target.value)}
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
            </div>
            {error && <p className="text-red-500">{error}</p>}
            { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :    <Button onClick={handleSubmit}>Submit</Button> }
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio Company</DialogTitle>
          </DialogHeader>
          {editingCompany && (
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingCompany.PFName}
                  onChange={(e) => setEditingCompany({ ...editingCompany, PFName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-company" className="text-right">
                  Company
                </Label>
                <Input
                  id="edit-company"
                  value={editingCompany.PFCompany}
                  onChange={(e) => setEditingCompany({ ...editingCompany, PFCompany: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timezone" className="text-right">
                  Timezone
                </Label>
                <Input
                  id="edit-timezone"
                  value={editingCompany.PFTimezone}
                  onChange={(e) => setEditingCompany({ ...editingCompany, PFTimezone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              { bisLoading ?
        <Loader2 className="h-8 w-8 animate-spin" />
     :   <Button onClick={handleEditSubmit}>Update Portfolio Company</Button>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
