export interface RSVP {
  id: string
  party_id: string
  party_name: string
  attending: boolean
  attending_count: number
  guest_responses: GuestRSVP[]
  responding_guest: string
  additional_notes: string | null
  created_at: string
  updated_at: string
}

export interface GuestRSVP {
  name: string
  attending: 'yes' | 'no'
}

export interface Guest {
  name: string
  nameParts: string[]
}

export interface Party {
  partyId: string
  partyName: string
  maxGuests: number
  guests: Guest[]
}

export interface GuestsData {
  parties: Party[]
}

// Browser-based storage functions (fallback for Supabase)
function readGuests(): GuestsData {
  try {
    const data = localStorage.getItem('guests_data')
    return data ? JSON.parse(data) : { parties: [] }
  } catch {
    return { parties: [] }
  }
}

function writeGuests(guestsData: GuestsData) {
  try {
    localStorage.setItem('guests_data', JSON.stringify(guestsData))
  } catch (error) {
    console.error('Error writing guests data:', error)
  }
}

// Generate a simple ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Add a new party
export function addParty(party: Party): boolean {
  const guestsData = readGuests()
  
  // Check if party ID already exists
  if (guestsData.parties.some(p => p.partyId === party.partyId)) {
    return false
  }
  
  guestsData.parties.push(party)
  writeGuests(guestsData)
  return true
}