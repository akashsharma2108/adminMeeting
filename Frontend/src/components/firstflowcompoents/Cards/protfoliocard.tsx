import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from "../../ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "../../ui/card"
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

interface PortfolioCompany {
    PFId: number
    PFName: string
    PFCompany: string
    PFTimezone: string
    PFEmail : string
    createdAt: string
    updatedAt: string
  }
  

  const getRandomGradient = () => {
    const gradients = [
      'bg-gradient-to-r from-pink-500 to-purple-500',
      'bg-gradient-to-r from-cyan-500 to-blue-500',
      'bg-gradient-to-r from-green-400 to-teal-500',
      'bg-gradient-to-r from-orange-500 to-red-500',
      'bg-gradient-to-r from-indigo-500 to-purple-500',
    ]
    return gradients[Math.floor(Math.random() * gradients.length)]
  }
  
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }
  
  export default function PortfoliosCards({ 
    portfolio, 
    onEdit, 
    onDelete,
  }: { 
    portfolio: PortfolioCompany[]
    onEdit: (Portfolios: PortfolioCompany) => void
    onDelete: (id: number) => void
  }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioCompany | null>(null)
  
    const handleDeleteClick = (Portfolios: PortfolioCompany) => {
      setSelectedPortfolio(Portfolios)
      setDeleteDialogOpen(true)
    }
  
    const handleConfirmDelete = () => {
      if (selectedPortfolio) {
        onDelete(selectedPortfolio.PFId)
        setDeleteDialogOpen(false)
        setSelectedPortfolio(null)
      }
    }
  
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((Portfolios) => (
            <Card key={Portfolios.PFId} className="relative h-[380px] flex flex-col "
            style={{
                padding: "0px",
            }}
            >
              <button
                onClick={() => handleDeleteClick(Portfolios)}
                className="absolute right-1 top-0 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
              <CardHeader>
                <div className={`${getRandomGradient()} h-32 rounded-t-lg flex items-center justify-center p-0`}>
                  <Avatar className="h-20 w-20 border-4 border-white">
                    <AvatarFallback>{getInitials(Portfolios.PFName)}</AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent className="text-left space-y-2">
                <h3 className="font-semibold text-xl truncate">{Portfolios.PFName}</h3>
                <p className="text-sm text-muted-foreground truncate mb-2">{Portfolios.PFCompany}</p>
                <p className="text-sm line-clamp-3">
                  {Portfolios.PFName} is from {Portfolios.PFCompany}, their timezone is {Portfolios.PFTimezone} and email is {Portfolios.PFEmail} and belongs to portfolio company groups.
                </p>
              </CardContent>
              <CardFooter className="flex justify-left mt-auto">
                <Button onClick={() => onEdit(Portfolios)}>Edit Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

  
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this Portfolio?</AlertDialogTitle>
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
  
  