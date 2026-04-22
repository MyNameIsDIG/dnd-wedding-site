
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, CheckCircle, XCircle, Clock, Edit, Trash2, Save, Plus, RotateCw } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import { Textarea } from "../ui/textarea"
import { readGuests, readRSVPs, updateParty, addParty, deleteParty } from "../lib/supabase-db"
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

  const refreshData = async () => {
    setLoading(true)
    try {
      const guests = await readGuests()
      const rsvps = await readRSVPs()
      setGuestsData(guests)
      setRsvpsData({ rsvps })
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
    setEditingParty({ ...party })
    setShowEditDialog(true)
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

    // Sort by acceptance time (most recent first) for accepted guests, otherwise alphabetically
    if (filter === 'accepted') {
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
              <div className="text-sm text-muted-foreground">Estimated Total Guests</div>
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

                return (
                  <div key={party.partyId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{party.partyName}</h3>
                        <Badge variant={
                          status.status === 'accepted' ? 'default' :
                          status.status === 'declined' ? 'destructive' :
                          status.status === 'partial' ? 'secondary' : 'outline'
                        }>
                          {status.status === 'accepted' ? 'Accepted' :
                           status.status === 'declined' ? 'Declined' :
                           status.status === 'partial' ? 'Partial' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1 text-left">
                        <p>{party.guests.length} named guests (max {party.maxGuests})</p>
                        {rsvp && (
                          <p>Responded by: {rsvp.responding_guest}</p>
                        )}
                        <div className="flex gap-4 mt-2 flex-wrap">
                          {party.guests.map((guest, idx) => {
                            const response = rsvp?.guest_responses.find(r => r.name === guest.name)
                            return (
                              <span key={idx} className={`text-xs px-2 py-1 rounded ${
                                response?.attending === 'yes' ? 'bg-green-100 text-green-800' :
                                response?.attending === 'no' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {guest.name}: {response?.attending || 'pending'}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditParty(party)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDeleteParty(party)}
                        className="text-red-600 hover:text-red-700"
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
                  <Label htmlFor="partyName">Party Name</Label>
                  <Input
                    id="partyName"
                    value={editingParty.partyName}
                    onChange={(e) => setEditingParty({ ...editingParty, partyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxGuests">Max Guests</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    value={editingParty.maxGuests}
                    onChange={(e) => setEditingParty({ ...editingParty, maxGuests: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Guests</Label>
                  <Textarea
                    value={editingParty.guests.map(g => g.name).join('\n')}
                    onChange={(e) => {
                      const names = e.target.value.split('\n')
                      setEditingParty({
                        ...editingParty,
                        guests: names.map(name => ({
                          name,
                          nameParts: name.trim() ? name.toLowerCase().split(/\s+/) : [],
                        })),
                      })
                    }}
                    placeholder="One guest name per line"
                    rows={5}
                  />
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
                <Label htmlFor="newPartyName">Party Name</Label>
                <Input
                  id="newPartyName"
                  value={newParty.partyName || ''}
                  onChange={(e) => setNewParty({ ...newParty, partyName: e.target.value })}
                  placeholder="e.g., Smith Family"
                />
              </div>
              <div>
                <Label htmlFor="newMaxGuests">Max Guests</Label>
                <Input
                  id="newMaxGuests"
                  type="number"
                  value={newParty.maxGuests || 1}
                  onChange={(e) => setNewParty({ ...newParty, maxGuests: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div>
                <Label>Guests</Label>
                <Textarea
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {guestListFilter === 'all' && 'All Guests'}
                {guestListFilter === 'accepted' && 'Accepted Guests'}
                {guestListFilter === 'declined' && 'Declined Guests'}
                {guestListFilter === 'pending' && 'Pending Guests'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
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
                      {guestListFilter === 'accepted' && guest.updatedAt && (
                        <div className="text-right">
                          <p className="text-xs font-medium text-green-600">{formatPHTime(guest.updatedAt)}</p>
                        </div>
                      )}
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