
import { motion } from "framer-motion"
import { MapPin, Clock, ExternalLink, Shirt, Palette } from "lucide-react"
import { Button } from "../ui/button"

const venues = [
  {
    type: "Ceremony",
    name: "Aniban IEMELIF Church",
    plusCode: "FX37+3J",
    location: "Bacoor, Cavite",
    time: "4:00 PM",
    mapUrl: "https://maps.app.goo.gl/f8TaEb8hkzqdjhfk9",
  },
  {
    type: "Reception",
    name: "MAI Pavillon",
    plusCode: "FX58+XJ",
    location: "Bacoor, Cavite",
    time: "5:00 PM",
    mapUrl: "https://maps.app.goo.gl/gpkXs6WpLdiAi6BB8",
  },
]

export function DetailsTab() {
  return (
    <div className="px-4 py-8 pb-24 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-[30px] font-serif font-medium text-foreground mb-2">
          Wedding Details
        </h2>
        <p className="text-muted-foreground text-sm">
          Everything you need to know about the venues
        </p>
      </motion.div>

      {/* Venue Cards */}
      <div className="space-y-4 mb-8">
        {venues.map((venue, index) => (
          <motion.div
            key={venue.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border"
          >
            <div className="flex items-start justify-start mb-4 text-left">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary rounded-full mb-3">
                  {venue.type}
                </span>
                <h3 className="text-xl font-serif font-medium text-foreground">
                  {venue.name}
                </h3>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">
                  {venue.plusCode} {venue.location}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{venue.time}</span>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full h-11 rounded-xl gap-2"
            >
              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Maps
              </a>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Dress Code & Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-6"
      >
        <h3 className="text-lg font-serif font-medium text-foreground mb-4 text-center">
          What to Wear
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shirt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Dress Code</p>
              <p className="text-muted-foreground text-sm">Formal / Semi-formal</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Color Theme</p>
              <p className="text-muted-foreground text-sm">Spring Pastels</p>
            </div>
          </div>
        </div>

        {/* Color palette preview */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Suggested colors
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-[#e8daef] border border-border" title="Pastel Purple" />
            <div className="w-8 h-8 rounded-full bg-[#fef3cd] border border-border" title="Pastel Yellow" />
            <div className="w-8 h-8 rounded-full bg-[#ffe4c9] border border-border" title="Pastel Orange" />
            <div className="w-8 h-8 rounded-full bg-[#e6d5c3] border border-border" title="Pastel Brown" />
            <div className="w-8 h-8 rounded-full bg-[#f5cac3] border border-border" title="Pastel Red" />
          </div>
        </div>
      </motion.div>

      {/* Additional Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground mt-6"
      >
        Please avoid wearing black and white.
      </motion.p>
    </div>
  )
}
