
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Check, AlertCircle, Heart, Users, Lightbulb } from "lucide-react"
import { findPartyByName } from "../lib/guest-matching"
import type { Party } from "../lib/local-db"
import { findRSVPByPartyId, addRSVP } from "../lib/supabase-db"

interface GuestRSVP {
  name: string
  attending: "yes" | "no" | ""
  placeholder?: boolean
}

const RSVP_DEADLINE = "May 20, 2026"

export function RSVPTab() {
  const [step, setStep] = useState<"search" | "form" | "success" | "already-responded">("search")
  const [searchName, setSearchName] = useState("")
  const [searchAttempts, setSearchAttempts] = useState(0)
  const [error, setError] = useState("")
  const [hint, setHint] = useState("")
  const [party, setParty] = useState<Party | null>(null)
  const [guestRSVPs, setGuestRSVPs] = useState<GuestRSVP[]>([])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setHint("")

    const matchResult = await findPartyByName(searchName)

    if (matchResult.party) {
      // Check if party has already responded
      const existingRsvp = await findRSVPByPartyId(matchResult.party.partyId)

      if (existingRsvp) {
        setStep("already-responded")
        return
      }

      setParty(matchResult.party)
      const baseGuests = matchResult.party.guests.map((guest) => ({
        name: guest.name,
        attending: "" as const,
      }))
      const missingSlots = Math.max(0, matchResult.party.maxGuests - baseGuests.length)
      const extraGuests = Array.from({ length: missingSlots }, () => ({
        name: "",
        attending: "" as const,
        placeholder: true,
      }))
      setGuestRSVPs([...baseGuests, ...extraGuests])
      setStep("form")
      setSearchAttempts(0)
    } else {
      setSearchAttempts((prev) => prev + 1)

      if (searchAttempts === 0) {
        setError("Name not found. Please check the spelling of your name.")
        setHint("Hint: Try using different parts of your name (first, middle, or last).")
      } else if (searchAttempts === 1) {
        setError("We still cannot find your name. Please try again with a different variation.")
        setHint("Hint: If you have a middle name, try including or excluding it.")
      } else {
        setError("Unable to locate your invitation.")
        setStep("search")
        setSearchAttempts(0)
      }
    }
  }

  const updateGuestRSVP = (index: number, field: keyof GuestRSVP, value: string) => {
    setGuestRSVPs((prev) =>
      prev.map((guest, i) =>
        i === index ? { ...guest, [field]: value } : guest
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!party) return

    setIsSubmitting(true)

    const normalizedGuestRSVPs = guestRSVPs
      .filter((guest) => guest.name.trim() || guest.attending !== "")
      .map((guest) => ({
        name: guest.name.trim(),
        attending: guest.attending === "yes" ? "yes" : "no",
      })) as { name: string; attending: "yes" | "no" }[]

    if (normalizedGuestRSVPs.some((guest) => guest.attending === "yes" && !guest.name.trim())) {
      setError("Please enter a name for any guest who is attending.")
      setIsSubmitting(false)
      return
    }

    try {
      const attendingCount = normalizedGuestRSVPs.filter(
        (g) => g.attending === "yes"
      ).length

      await addRSVP({
        party_id: party.partyId,
        party_name: party.partyName,
        attending: attendingCount > 0,
        attending_count: attendingCount,
        guest_responses: normalizedGuestRSVPs,
        responding_guest: normalizedGuestRSVPs.find((g) => g.attending === "yes")?.name || normalizedGuestRSVPs[0]?.name || "",
        additional_notes: notes || null,
      })

      setStep("success")
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.log("[v0] RSVP submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep("search")
    setSearchName("")
    setError("")
    setHint("")
    setParty(null)
    setGuestRSVPs([])
    setNotes("")
    setSearchAttempts(0)
  }

  return (
    <div className="px-4 py-8 pb-24 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-[30px] font-serif font-medium text-foreground mb-2">RSVP</h2>
        <p className="text-muted-foreground text-sm">
          Please respond by {RSVP_DEADLINE}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Search */}
        {step === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Enter your first and last name to find your invitation
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Juan Dela Cruz"
                    value={searchName}
                    onChange={(e) => {
                      setSearchName(e.target.value)
                      setError("")
                      setHint("")
                    }}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {hint && searchAttempts < 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg text-primary text-sm"
                  >
                    <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{hint}</span>
                  </motion.div>
                )}

                {searchAttempts >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg text-primary text-sm"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      Please contact us directly for manual RSVP assistance.
                    </span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base"
                  disabled={searchAttempts >= 2}
                >
                  Find My Invitation
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step 2: RSVP Form */}
        {step === "form" && party && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  Party of {party.maxGuests}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {guestRSVPs.map((guest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-4 pb-6 border-b border-border last:border-0 last:pb-0"
                  >
                    {guest.placeholder ? (
                      <div className="space-y-2">
                        <Label htmlFor={`guest-name-${index}`} className="text-sm text-muted-foreground">
                          Additional guest #{index + 1 - party.guests.length}
                        </Label>
                        <Input
                          id={`guest-name-${index}`}
                          value={guest.name}
                          onChange={(e) => updateGuestRSVP(index, "name", e.target.value)}
                          placeholder="Enter guest name"
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <h3 className="font-medium text-foreground text-left">{guest.name}</h3>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Will you be attending?
                      </Label>
                      <RadioGroup
                        value={guest.attending}
                        onValueChange={(value) =>
                          updateGuestRSVP(index, "attending", value)
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id={`yes-${index}`} />
                          <Label htmlFor={`yes-${index}`} className="cursor-pointer">
                            Joyfully Accept
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`no-${index}`} />
                          <Label htmlFor={`no-${index}`} className="cursor-pointer">
                            Regretfully Decline
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </motion.div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm text-muted-foreground">
                    Additional notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-muted rounded-lg text-xs text-muted-foreground"
                >
                  Due to venue capacity, we can only accommodate guests who have been specifically invited.
                </motion.div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl"
                    disabled={guestRSVPs.some((g) => g.attending === "") || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit RSVP"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step: Already Responded */}
        {step === "already-responded" && (
          <motion.div
            key="already-responded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-primary" />
              </motion.div>

              <h3 className="text-xl font-serif font-medium text-foreground mb-2">
                You or a family member have already responded.
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                If you need to update your response, please contact us directly.
              </p>

              <Button
                onClick={resetForm}
                variant="outline"
                className="rounded-xl"
              >
                Search Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-primary" />
              </motion.div>

              <h3 className="text-2xl font-serif font-medium text-foreground mb-2">
                Thank You!
              </h3>
              <p className="text-muted-foreground mb-6">
                Your RSVP has been received. We cannot wait to celebrate with you!
              </p>

              <div className="flex justify-center">
                <Heart className="w-6 h-6 text-primary fill-primary/30" />
              </div>

              <Button
                onClick={resetForm}
                variant="outline"
                className="mt-6 rounded-xl"
              >
                Submit Another RSVP
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
