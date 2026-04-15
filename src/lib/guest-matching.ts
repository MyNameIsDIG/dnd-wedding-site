import { readGuests } from './supabase-db'
import type { Party } from './local-db'

export interface MatchResult {
  party: Party | null
  matchedGuests: string[]
  allGuests: string[]
  confidence: number
  message?: string
}

// Flexible name matching algorithm
function calculateMatch(inputParts: string[], targetParts: string[]): number {
  if (inputParts.length === 0 || targetParts.length === 0) return 0

  let matchedParts = 0
  for (const inputPart of inputParts) {
    if (targetParts.some(tp => tp.includes(inputPart) || inputPart.includes(tp))) {
      matchedParts++
    }
  }

  return matchedParts / Math.max(inputParts.length, targetParts.length)
}

export async function findPartyByName(inputName: string): Promise<MatchResult> {
  const inputParts = inputName
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(p => p.length > 0)

  if (inputParts.length === 0) {
    return {
      party: null,
      matchedGuests: [],
      allGuests: [],
      confidence: 0,
      message: 'Please enter a name',
    }
  }

  // Require at least 2 name parts (first name + last name)
  if (inputParts.length < 2) {
    return {
      party: null,
      matchedGuests: [],
      allGuests: [],
      confidence: 0,
      message: 'Please enter at least your first and last name',
    }
  }

  const guestsData = await readGuests()
  let bestMatch: Party | null = null
  let bestConfidence = 0
  let bestMatchedGuests: string[] = []

  for (const party of guestsData.parties) {
    for (const guest of party.guests) {
      const confidence = calculateMatch(inputParts, guest.nameParts)

      if (confidence > bestConfidence) {
        bestConfidence = confidence
        bestMatch = party
        bestMatchedGuests = party.guests.map(g => g.name)
      }
    }
  }

  // Only accept matches with reasonable confidence
  if (bestConfidence < 0.4) {
    return {
      party: null,
      matchedGuests: [],
      allGuests: [],
      confidence: 0,
      message:
        'No matching guest found. Please double-check your name or contact us for manual RSVP.',
    }
  }

  return {
    party: bestMatch,
    matchedGuests: bestMatchedGuests,
    allGuests: bestMatch?.guests.map(g => g.name) || [],
    confidence: bestConfidence,
  }
}

export async function getPartyByGuestName(guestName: string): Promise<Party | null> {
  const guestsData = await readGuests()
  for (const party of guestsData.parties) {
    const found = party.guests.find(
      g => g.name.toLowerCase() === guestName.toLowerCase()
    )
    if (found) {
      return party
    }
  }
  return null
}

export async function getAllParties(): Promise<Party[]> {
  const guestsData = await readGuests()
  return guestsData.parties
}
