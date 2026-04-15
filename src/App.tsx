// App.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TabNavigation, type TabType } from './wedding/tab-navigation'
import { HomeTab } from './wedding/home-tab'
import { GalleryTab } from './wedding/gallery-tab'
import { QATab } from './wedding/qa-tab'
import { RSVPTab } from './wedding/rsvp-tab'
import { DetailsTab } from './wedding/details-tab'
import { ManageGuestsTab } from './wedding/manage-guests-tab'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [secretUnlocked] = useState(() => {
    return localStorage.getItem('secretUnlocked') === 'true'
  })

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Render the active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />
      case 'gallery':
        return <GalleryTab />
      case 'qa':
        return <QATab />
      case 'rsvp':
        return <RSVPTab />
      case 'details':
        return <DetailsTab />
      case 'manage-guests':
        return secretUnlocked ? <ManageGuestsTab /> : <HomeTab />
      default:
        return <HomeTab />
    }
  }

  return (
    <div className="app min-h-screen bg-background">
      {/* Main Content */}
      <main className="pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        secretUnlocked={secretUnlocked}
      />
    </div>
  )
}

export default App