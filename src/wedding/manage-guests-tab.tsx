
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, CheckCircle, XCircle, Clock, Edit, Trash2, Save, Plus, RotateCw, MessageCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { readGuests, readRSVPs, updateParty, addParty, deleteParty, updateRSVP, getRSVPStatus, setRSVPStatus } from "../lib/supabase-db"
import type { Party } from "../lib/local-db"

interface GuestResponse {
  name: string
  attending: "yes" | "no" | "pending"
}

interface RSVP {
  party_id: string
  party_name: string
  attending: boolean
  attending_count: number
  guest_responses: GuestResponse[]
  responding_guest: string
  additional_notes: string | null
  id: string
  created_at: string
  updated_at: string
}

interface GuestsData {
  parties: Party[]
}

interface RSVPsData {
  rsvps: RSVP[]
}

interface ManageGuestsTabProps {
  refreshKey?: number
}

interface GuestDetail {
  name: string
  partyName: string
  status: "yes" | "no" | "pending"
  updatedAt?: string
}

export function ManageGuestsTab({ refreshKey }: ManageGuestsTabProps) {
  const [guestsData, setGuestsData] = useState<GuestsData | null>(null)
  const [rsvpsData, setRsvpsData] = useState<RSVPsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingParty, setEditingParty] = useState<Party | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteConfirmParty, setDeleteConfirmParty] = useState<Party | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newParty, setNewParty] = useState<Partial<Party>>({
    partyName: '',
    maxGuests: 1,
    guests: []
  })
  const [showGuestListModal, setShowGuestListModal] = useState(false)
  const [guestListFilter, setGuestListFilter] = useState<"all" | "accepted" | "declined" | "pending">("all")
  const [filteredGuestList, setFilteredGuestList] = useState<GuestDetail[]>([])
  const [showMessagesDialog, setShowMessagesDialog] = useState(false)
  const [guestMessages, setGuestMessages] = useState<Array<{ partyName: string; message: string; updatedAt: string }>>([])
  const [rsvpIsOpen, setRsvpIsOpen] = useState(true)
  const [showRsvpConfirm, setShowRsvpConfirm] = useState(false)
  const [pendingRsvpAction, setPendingRsvpAction] = useState<boolean | null>(null)

  const handleOpenMessages = () => {
    const messages = rsvpsData!.rsvps
      .filter(rsvp => rsvp.additional_notes)
      .map(rsvp => ({
        partyName: rsvp.party_name,
        message: rsvp.additional_notes || '',
        updatedAt: rsvp.updated_at
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    setGuestMessages(messages)
    setShowMessagesDialog(true)
  }

  const handleRsvpStatusChange = async (newStatus: boolean) => {
    await setRSVPStatus(newStatus)
    setRsvpIsOpen(newStatus)
    setShowRsvpConfirm(false)
    setPendingRsvpAction(null)
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      const guests = await readGuests()
      const rsvps = await readRSVPs()
      const isOpen = await getRSVPStatus()
      setGuestsData(guests)
      setRsvpsData({ rsvps })
      setRsvpIsOpen(isOpen)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [refreshKey])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading guest data...</p>
        </div>
      </div>
    )
  }

  if (!guestsData || !rsvpsData) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load data</p>
      </div>
    )
  }

  // Calculate statistics
  const totalGuests = guestsData.parties.reduce((sum, party) => sum + party.maxGuests, 0)
  const totalAccepted = rsvpsData.rsvps.reduce((sum, rsvp) => sum + rsvp.attending_count, 0)
  const totalDeclined = rsvpsData.rsvps.reduce((sum, rsvp) => {
    if (!rsvp.attending) return sum + rsvp.guest_responses.length
    return sum + rsvp.guest_responses.filter(g => g.attending === 'no').length
  }, 0)
  const totalPending = totalGuests - totalAccepted - totalDeclined

  const handleEditParty = (party: Party) => {
    // Initialize guests with their current RSVP status
    const updatedParty = { ...party }
    const partyRsvp = rsvpsData?.rsvps.find(r => r.party_id === party.partyId)
    
    if (partyRsvp) {
      updatedParty.guests = party.guests.map(guest => ({
        ...guest,
        rsvpStatus: (partyRsvp.guest_responses.find(g => g.name === guest.name)?.attending as any) || 'pending'
      })) as any
    }
    
    setEditingParty(updatedParty)
    setShowEditDialog(true)
  }

  const handleGuestRsvpChange = (guestName: string, newStatus: "yes" | "no" | "pending") => {
    if (!editingParty) return
    
    // Update or create the RSVP data
    const updatedGuests = editingParty.guests.map(guest => {
      if (guest.name === guestName) {
        return {
          ...guest,
          rsvpStatus: newStatus
        }
      }
      return guest
    })
    
    setEditingParty({
      ...editingParty,
      guests: updatedGuests as any
    })
  }

  const getGuestRsvpStatus = (guestName: string): "yes" | "no" | "pending" => {
    if (!editingParty) return "pending"
    
    const guest = editingParty.guests.find(g => g.name === guestName)
    return (guest as any)?.rsvpStatus || "pending"
  }

  const handleDeleteGuest = (guestName: string) => {
    if (!editingParty) return
    
    const updatedGuests = editingParty.guests.filter(guest => guest.name !== guestName)
    setEditingParty({
      ...editingParty,
      guests: updatedGuests
    })
  }

  const handleSaveParty = async () => {
    if (!editingParty) return

    const sanitizedParty = {
      ...editingParty,
      guests: editingParty.guests
        .filter((guest) => guest.name.trim())
        .map((guest) => ({
          name: guest.name.trim(),
          nameParts: guest.name.trim().toLowerCase().split(/\s+/),
        })),
    }

    try {
      const success = await updateParty(editingParty.partyId, sanitizedParty)

      if (success) {
        // Update RSVP guest responses with new statuses
        const guestResponses = editingParty.guests
          .filter(guest => guest.name.trim())
          .map(guest => ({
            name: guest.name.trim(),
            attending: ((guest as any).rsvpStatus || 'pending') as "yes" | "no" | "pending"
          }))
        
        // Check if RSVP exists for this party
        const existingRsvp = rsvpsData?.rsvps.find(r => r.party_id === editingParty.partyId)
        if (existingRsvp) {
          await updateRSVP(editingParty.partyId, guestResponses)
        }

        await refreshData()
        setShowEditDialog(false)
        setEditingParty(null)
      } else {
        console.error('Failed to save party')
      }
    } catch (error) {
      console.error('Error saving party:', error)
    }
  }

  const handleAddParty = async () => {
    if (!newParty.partyName || !newParty.guests || newParty.guests.length === 0) return

    const partyId = newParty.partyName.toLowerCase().replace(/\s+/g, '-')
    const party: Party = {
      partyId,
      partyName: newParty.partyName,
      maxGuests: newParty.maxGuests || 1,
      guests: newParty.guests
        .filter((guest) => guest.name.trim())
        .map((guest) => ({
          name: guest.name.trim(),
          nameParts: guest.name.trim().toLowerCase().split(/\s+/),
        })),
    }

    try {
      const success = await addParty(party)

      if (success) {
        await refreshData()
        setShowAddDialog(false)
        setNewParty({ partyName: '', maxGuests: 1, guests: [] })
      } else {
        console.error('Failed to add party')
      }
    } catch (error) {
      console.error('Error adding party:', error)
    }
  }

  const confirmDeleteParty = (party: Party) => {
    setDeleteConfirmParty(party)
    setShowDeleteConfirm(true)
  }

  const handleDeleteParty = async () => {
    if (!deleteConfirmParty) return
    
    try {
      const success = await deleteParty(deleteConfirmParty.partyId)
      if (success) {
        await refreshData()
        setShowDeleteConfirm(false)
        setDeleteConfirmParty(null)
      } else {
        console.error('Failed to delete party')
      }
    } catch (error) {
      console.error('Error deleting party:', error)
    }
  }

  const getPartyStatus = (party: Party) => {
    const rsvp = rsvpsData.rsvps.find(r => r.party_id === party.partyId)
    if (!rsvp) return { status: 'pending', count: 0, total: party.guests.length }

    const accepted = rsvp.guest_responses.filter(g => g.attending === 'yes').length
    const declined = rsvp.guest_responses.filter(g => g.attending === 'no').length

    if (accepted > 0 && declined === 0) return { status: 'accepted', count: accepted, total: party.guests.length }
    if (declined > 0 && accepted === 0) return { status: 'declined', count: declined, total: party.guests.length }
    if (accepted > 0 && declined > 0) return { status: 'partial', count: accepted, total: party.guests.length }
    return { status: 'pending', count: 0, total: party.guests.length }
  }

  const getGuestListForFilter = (filter: "all" | "accepted" | "declined" | "pending"): GuestDetail[] => {
    const guests: GuestDetail[] = []

    guestsData!.parties.forEach((party) => {
      const rsvp = rsvpsData!.rsvps.find(r => r.party_id === party.partyId)

      party.guests.forEach((guest) => {
        const response = rsvp?.guest_responses.find(r => r.name === guest.name)
        const status = response?.attending || 'pending'

        let matches = false
        if (filter === 'all') {
          matches = true
        } else if (filter === 'accepted' && status === 'yes') {
          matches = true
        } else if (filter === 'declined' && status === 'no') {
          matches = true
        } else if (filter === 'pending' && status === 'pending') {
          matches = true
        }

        if (matches) {
          guests.push({
            name: guest.name,
            partyName: party.partyName,
            status: status as "yes" | "no" | "pending",
            updatedAt: rsvp?.updated_at
          })
        }
      })
    })

    // Sort by response time (most recent first) for accepted/declined guests, otherwise alphabetically
    if (filter === 'accepted' || filter === 'declined') {
      return guests.sort((a, b) => {
        // Sort by updatedAt in descending order (most recent first)
        if (a.updatedAt && b.updatedAt) {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }
        return 0
      })
    }

    // Sort by first name for other filters
    return guests.sort((a, b) => {
      const firstNameA = a.name.split(' ')[0].toLowerCase()
      const firstNameB = b.name.split(' ')[0].toLowerCase()
      return firstNameA.localeCompare(firstNameB)
    })
  }

  const formatPHTime = (dateString?: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const formatter = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    
    return formatter.format(date)
  }

  const handleStatCardClick = (filter: "all" | "accepted" | "declined" | "pending") => {
    const guests = getGuestListForFilter(filter)
    setFilteredGuestList(guests)
    setGuestListFilter(filter)
    setShowGuestListModal(true)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground">
              Guest Management Dashboard
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshData()}
              className="rounded-full p-2"
              title="Refresh data from Supabase"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage wedding guests and track RSVPs
          </p>
        </motion.div>

        {/* RSVP Status Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">RSVP Status:</span>
            <Badge className={rsvpIsOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {rsvpIsOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <Button
            variant={rsvpIsOpen ? "outline" : "default"}
            size="sm"
            onClick={() => {
              setPendingRsvpAction(!rsvpIsOpen)
              setShowRsvpConfirm(true)
            }}
          >
            {rsvpIsOpen ? "Close RSVP" : "Open RSVP"}
          </Button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatCardClick('all')}>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{totalGuests}</div>
              <div className="text-sm text-muted-foreground">Estimated Guests</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatCardClick('accepted')}>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{totalAccepted}</div>
              <div className="text-sm text-muted-foreground">Accepted</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatCardClick('declined')}>
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{totalDeclined}</div>
              <div className="text-sm text-muted-foreground">Declined</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatCardClick('pending')}>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{totalPending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Guest Parties List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Guest Parties
                </CardTitle>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Group
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {guestsData.parties.sort((a, b) => {
                const rsvpA = rsvpsData.rsvps.find(r => r.party_id === a.partyId)
                const rsvpB = rsvpsData.rsvps.find(r => r.party_id === b.partyId)
                
                const hasResponsedA = rsvpA !== undefined
                const hasResponsedB = rsvpB !== undefined
                
                // Put responded parties first
                if (hasResponsedA && !hasResponsedB) return -1
                if (!hasResponsedA && hasResponsedB) return 1
                
                // For responded parties, sort by updated_at (oldest first = first accepters at top)
                if (hasResponsedA && hasResponsedB && rsvpA && rsvpB) {
                  return new Date(rsvpA.updated_at).getTime() - new Date(rsvpB.updated_at).getTime()
                }
                
                return 0
              }).map((party) => {
                const status = getPartyStatus(party)
                const rsvp = rsvpsData.rsvps.find(r => r.party_id === party.partyId)

                const unnamedGuestCount = Math.max(0, (rsvp?.attending_count || 0) - party.guests.length)
                const unnamedSlots = Math.max(0, party.maxGuests - party.guests.length)

                return (
                  <div key={party.partyId} className="border rounded-lg overflow-hidden flex flex-col md:flex-row">
                    {/* Card Content */}
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-medium">{party.partyName}</h3>
                        <Badge className={
                          status.status === 'accepted' ? 'bg-green-500 hover:bg-green-600 text-white' :
                          status.status === 'declined' ? 'bg-red-500 hover:bg-red-600 text-white' :
                          status.status === 'partial' ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        }>
                          {status.status === 'accepted' ? 'Accepted' :
                           status.status === 'declined' ? 'Declined' :
                           status.status === 'partial' ? 'Partial' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-2 text-left">
                        {rsvp && (
                          <p>Responded by: {rsvp.responding_guest}</p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {party.guests.map((guest, idx) => {
                            const response = rsvp?.guest_responses.find(r => r.name === guest.name)
                            return (
                              <span key={idx} className={`text-xs px-2 py-1 rounded ${
                                response?.attending === 'yes' ? 'bg-green-100 text-green-800' :
                                response?.attending === 'no' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {guest.name}
                              </span>
                            )
                          })}
                          {Array.from({ length: unnamedSlots }).map((_, idx) => (
                            <span key={`unnamed-${idx}`} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                              Unnamed Guest
                            </span>
                          ))}
                          {unnamedGuestCount > 0 && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                              +{unnamedGuestCount} unnamed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons - Below on mobile, left side on desktop */}
                    <div className="p-3 md:p-4 bg-muted/20 border-t md:border-t-0 md:border-l flex md:flex-col gap-2 justify-end md:justify-center items-center md:items-center flex-wrap md:flex-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditParty(party)}
                        className="w-full md:w-auto"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDeleteParty(party)}
                        className="text-red-600 hover:text-red-700 w-full md:w-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Party Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Party</DialogTitle>
            </DialogHeader>
            {editingParty && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="partyName" className="mb-4 block">Party Name</Label>
                  <Input
                    id="partyName"
                    className="bg-white"
                    value={editingParty.partyName}
                    onChange={(e) => setEditingParty({ ...editingParty, partyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxGuests" className="mb-4 block">Max Guests</Label>
                  <Input
                    id="maxGuests"
                    className="bg-white"
                    type="number"
                    value={editingParty.maxGuests}
                    onChange={(e) => setEditingParty({ ...editingParty, maxGuests: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="mb-4 block">Guests</Label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {editingParty.guests.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No guests added</p>
                    ) : (
                      editingParty.guests.map((guest, idx) => {
                        const rsvpStatus = getGuestRsvpStatus(guest.name)
                        return (
                          <div
                            key={idx}
                            className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-medium text-sm">{guest.name || `Guest ${idx + 1}`}</span>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={rsvpStatus}
                                  onValueChange={(value) =>
                                    handleGuestRsvpChange(
                                      guest.name,
                                      value as "yes" | "no" | "pending"
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="yes">Attending</SelectItem>
                                    <SelectItem value="no">Not Attending</SelectItem>
                                  </SelectContent>
                                </Select>
                                {rsvpStatus === "yes" && (
                                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                                )}
                                {rsvpStatus === "no" && (
                                  <Badge className="bg-red-100 text-red-800">✗</Badge>
                                )}
                                {rsvpStatus === "pending" && (
                                  <Badge className="bg-yellow-100 text-yellow-800">?</Badge>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteGuest(guest.name)}
                                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                <div>
                  <Label className="mb-4 block">Add Guest</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newGuestName"
                      className="bg-white flex-1"
                      placeholder="Enter guest name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            setEditingParty({
                              ...editingParty,
                              guests: [
                                ...editingParty.guests,
                                {
                                  name: input.value.trim(),
                                  nameParts: input.value.trim().toLowerCase().split(/\s+/),
                                },
                              ],
                            })
                            input.value = ""
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById("newGuestName") as HTMLInputElement
                        if (input && input.value.trim()) {
                          setEditingParty({
                            ...editingParty,
                            guests: [
                              ...editingParty.guests,
                              {
                                name: input.value.trim(),
                                nameParts: input.value.trim().toLowerCase().split(/\s+/),
                              },
                            ],
                          })
                          input.value = ""
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveParty}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Party Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Guest Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPartyName" className="mb-4 block">Party Name</Label>
                <Input
                  id="newPartyName"
                  className="bg-white"
                  value={newParty.partyName || ''}
                  onChange={(e) => setNewParty({ ...newParty, partyName: e.target.value })}
                  placeholder="e.g., Smith Family"
                />
              </div>
              <div>
                <Label htmlFor="newMaxGuests" className="mb-4 block">Max Guests</Label>
                <Input
                  id="newMaxGuests"
                  className="bg-white"
                  type="number"
                  value={newParty.maxGuests || 1}
                  onChange={(e) => setNewParty({ ...newParty, maxGuests: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div>
                <Label className="mb-4 block">Guests</Label>
                <Textarea
                  className="bg-white"
                  value={newParty.guests?.map(g => g.name).join('\n') || ''}
                  onChange={(e) => {
                    const names = e.target.value.split('\n')
                    setNewParty({
                      ...newParty,
                      guests: names.map(name => ({
                        name,
                        nameParts: name.trim() ? name.toLowerCase().split(/\s+/) : [],
                      })),
                    })
                  }}
                  placeholder="One guest name per line&#10;e.g., John Smith&#10;Jane Smith"
                  rows={5}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddParty} disabled={!newParty.partyName || !newParty.guests?.length}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Party</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the party <strong>{deleteConfirmParty?.partyName}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteParty}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Guest List Modal */}
        <Dialog open={showGuestListModal} onOpenChange={setShowGuestListModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {guestListFilter === 'all' && 'All Guests'}
                {guestListFilter === 'accepted' && 'Accepted Guests'}
                {guestListFilter === 'declined' && 'Declined Guests'}
                {guestListFilter === 'pending' && 'Pending Guests'}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto space-y-2">
              {filteredGuestList.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No guests found</p>
              ) : (
                <div className="space-y-2">
                  {filteredGuestList.map((guest, idx) => (
                    <div key={idx} className="bg-white rounded-lg border border-border px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{guest.name}</p>
                        <p className="text-xs text-muted-foreground">{guest.partyName}</p>
                      </div>
                      {(guestListFilter === 'accepted' || guestListFilter === 'declined') && guest.updatedAt && (
                        <div className="text-right">
                          <p className={`text-xs font-medium ${guestListFilter === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>{formatPHTime(guest.updatedAt)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Floating Message Button */}
        <button
          onClick={handleOpenMessages}
          className="fixed bottom-20 right-6 bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg transition-all duration-200 z-30"
          title="View guest messages"
          aria-label="View guest messages"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* RSVP Status Confirmation Dialog */}
        <AlertDialog open={showRsvpConfirm} onOpenChange={setShowRsvpConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingRsvpAction ? "Open RSVP?" : "Close RSVP?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingRsvpAction
                  ? "Are you sure you want to open RSVP? Guests will be able to submit responses again."
                  : "Are you sure you want to close RSVP? Guests will no longer be able to submit responses."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingRsvpAction !== null) {
                    handleRsvpStatusChange(pendingRsvpAction)
                  }
                }}
                className={pendingRsvpAction === false ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {pendingRsvpAction ? "Open RSVP" : "Close RSVP"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Guest Messages Dialog */}
        <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Guest Messages</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto space-y-4">
              {guestMessages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No messages from guests</p>
              ) : (
                <div className="space-y-4">
                  {guestMessages.map((msg, idx) => (
                    <div key={idx} className="bg-white rounded-lg border border-border p-4">
                      <p className="text-sm font-semibold text-primary mb-2">From: {msg.partyName}</p>
                      <p className="text-sm text-foreground mb-2">{msg.message}</p>
                      <p className="text-xs text-muted-foreground">{formatPHTime(msg.updatedAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}