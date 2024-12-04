import React from 'react'
import { Toaster } from "../ui/toaster"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-purple-800">Meeting Scheduler Admin Panel</h1>
        {children}
        <Toaster />
      </div>
    </div>
  )
}