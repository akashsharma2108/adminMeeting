import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Layout } from './components/layout/layout'
import  InvestorTab  from './components/InvestorTb/InvestorTab'
import PortfolioTab from './components/PortfolioTab/PortfolioTab'
import AvailabilityTab from './components/Avilability/AvailabilitySlot'
import SelectionTab from './components/selection/selectiontab'
import MeetingTab from './components/Meeting/Meetintab'

function App() {
  const [activeTab, setActiveTab] = useState('investors')

  return (
    <Layout>
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio Companies</TabsTrigger>
            <TabsTrigger value="availability">Availability Slots</TabsTrigger>
            <TabsTrigger value="selection">Selection</TabsTrigger>
            <TabsTrigger value="scheduler">Meeting Scheduler</TabsTrigger>
          </TabsList>
          <TabsContent value="investors">
            <InvestorTab />
          </TabsContent>
          <TabsContent value="portfolio"><PortfolioTab /></TabsContent>
          <TabsContent value="availability"><AvailabilityTab /></TabsContent>
          <TabsContent value="selection"><SelectionTab /></TabsContent>
          <TabsContent value="scheduler"><MeetingTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}

export default App


