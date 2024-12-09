'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "../../ui/card"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"

interface Selection {
  SelId: number;
  InvId: number;
  PFId: number;
  Investor: {
    InvName: string;
    InvCompany: string;
  };
  PortfolioCompany: {
    PFName: string;
    PFCompany: string;
  };
}

// Function to get fixed gradient based on index
const getFixedGradient = (index: number) => {
  const gradients = [
    'bg-gradient-to-r from-pink-500 to-purple-500',
    'bg-gradient-to-r from-cyan-500 to-blue-500',
    'bg-gradient-to-r from-green-400 to-teal-500',
    'bg-gradient-to-r from-orange-500 to-red-500',
    'bg-gradient-to-r from-indigo-500 to-purple-500',
  ]
  return gradients[index % 5]
}

// Function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

export default function SelectionCards({ 
  selection, 
  onEdit, 
  onDelete,
  selectedCards,
  onCardSelection,
}: { 
  selection: Selection[]
  onEdit: (selection: Selection) => void
  onDelete: (id: number) => void
  selectedCards: number[]
  onCardSelection: (id: number) => void
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvestor, setSelectedInvestor] = useState<Selection | null>(null)


  const handleDeleteClick = (investor: Selection) => {
    setSelectedInvestor(investor)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedInvestor) {
      onDelete(selectedInvestor.InvId)
      setDeleteDialogOpen(false)
      setSelectedInvestor(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selection.map((selections, index) => (
          <Card 
            key={selections.SelId} 
            className={`relative h-[380px] flex flex-col ${
              selectedCards.includes(selections.SelId) ? 'bg-gray-100' : ''
            }`}
            style={{
              padding: "0px",
            }}
            onClick={() => onCardSelection(selections.SelId)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(selections)
              }}
              className="absolute right-1 top-0 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
            <CardHeader>
              <div className={`${getFixedGradient(index)} h-32 rounded-t-lg flex items-center justify-center p-0`}>
                <Avatar className="h-20 w-20 border-4 border-white">
                  <AvatarFallback>{getInitials(selections.Investor.InvName)}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent className="text-left space-y-2">
              <h3 className="font-semibold text-xl truncate">{selections.Investor.InvName} - {selections.PortfolioCompany.PFName}</h3>
              <p className="text-sm text-muted-foreground truncate mb-2">{selections.Investor.InvCompany} - {selections.PortfolioCompany.PFCompany}</p>
              <p className="text-sm line-clamp-3">
                {selections.Investor.InvName} from {selections.Investor.InvCompany} is paired with {selections.PortfolioCompany.PFName} from {selections.PortfolioCompany.PFCompany}
              </p>
            </CardContent>
            {selectedCards.includes(selections.SelId) && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                SELECTED
              </div>
            )}
            <CardFooter className="flex justify-left mt-auto">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(selections);
                }} 
                disabled={selectedCards.includes(selections.SelId)}
              >
                Edit Details
              </Button>

            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this investor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

