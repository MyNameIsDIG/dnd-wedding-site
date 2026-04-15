import { getSupabase } from './supabase'
import type { RSVP, Party, GuestsData } from './local-db'

export async function readGuests(): Promise<GuestsData> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('parties')
    .select('party_id, party_name, max_guests, guests') as { data: any[] | null; error: any } // eslint-disable-line @typescript-eslint/no-explicit-any

  if (error) {
    console.error('Error reading guests:', error)
    return { parties: [] }
  }

  const parties: Party[] = (data || []).map(row => ({
    partyId: row.party_id,
    partyName: row.party_name,
    maxGuests: row.max_guests,
    guests: row.guests
  }))

  return { parties }
}

export async function updateParty(partyId: string, updatedParty: Party): Promise<boolean> {
  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('parties') as any)
    .update({
      party_name: updatedParty.partyName,
      max_guests: updatedParty.maxGuests,
      guests: updatedParty.guests
    })
    .eq('party_id', partyId)
    .select()

  if (error) {
    console.error('Error updating party:', error)
    return false
  }

  return true
}

export async function addParty(party: Party): Promise<boolean> {
  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('parties') as any)
    .insert({
      party_id: party.partyId,
      party_name: party.partyName,
      max_guests: party.maxGuests,
      guests: party.guests
    })
    .select()

  if (error) {
    console.error('Error adding party:', error)
    return false
  }

  return true
}

export async function deleteParty(partyId: string): Promise<boolean> {
  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('parties') as any)
    .delete()
    .eq('party_id', partyId)
    .select()

  if (error) {
    console.error('Error deleting party:', error)
    return false
  }

  return true
}

// RSVPs functions
export async function readRSVPs(): Promise<RSVP[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')

  if (error) {
    console.error('Error reading RSVPs:', error)
    return []
  }

  return data || []
}

export async function findRSVPByPartyId(partyId: string): Promise<RSVP | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('party_id', partyId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows
    console.error('Error finding RSVP:', error)
    return null
  }

  return data
}

export async function addRSVP(rsvp: Omit<RSVP, 'id' | 'created_at' | 'updated_at'>): Promise<RSVP> {
  const supabase = getSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('rsvps') as any)
    .insert(rsvp)
    .select()
    .single()

  if (error) {
    console.error('Error adding RSVP:', error)
    throw error
  }

  return data
}