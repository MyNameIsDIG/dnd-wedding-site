
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"

const faqs = [
  {
    question: "What is the dress code?",
    answer: "The dress code is formal or semi-formal. We kindly ask guests to wear spring pastels to match our color theme. You may visit the details tab for more information.",
  },
  {
    question: "Can I bring a plus one?",
    answer: "Due to venue capacity, we can only accommodate guests who have been specifically invited. Please refer to the RSVP tab for details on your party size.",
  },
  {
    question: "Is there parking available?",
    answer: "Yes, both the ceremony venue (Aniban IEMELIF Church) and reception venue (MAI Pavillon) have parking areas available for guests. We recommend arriving early to secure a spot.",
  },
  {
    question: "Will there be transportation between venues?",
    answer: "The ceremony and reception venues are approximately 10 minutes apart by car. Guests are responsible for their own transportation between venues. You may visit the details tab for more information.",
  },
  {
    question: "Are children welcome?",
    answer: "While we love your little ones, only children who are part of the entourage are invited to attend. We appreciate your understanding and look forward to celebrating with you!",
  },
  {
    question: "What time should I arrive?",
    answer: "The ceremony begins promptly at 4:00 PM. We recommend arriving 30 minutes early to find parking and get seated comfortably.",
  },
  {
    question: "Can I take photos during the ceremony?",
    answer: "We kindly request an unplugged ceremony - please turn off or silence your phones during the ceremony. Our professional photographer will capture all the special moments, and we will share photos with everyone afterward.",
  },
  {
    question: "Can I take photos during the reception?",
    answer: "Of course! We encourage you to take photos and videos, and share them with us using our wedding hashtag #DAVEstOneForNICOLE. Just remember to be mindful of the professional photographer and avoid blocking their shots.",
  },
  {
    question: "Will the reception be indoors or outdoors?",
    answer: "The reception at MAI Pavillon will be held indoors in an air-conditioned venue.",
  },
  {
    question: "What gifts do you prefer?",
    answer: "Your presence is the greatest gift we could ask for! However, if you wish to give a gift, a monetary contribution toward our future plans would be greatly appreciated.",
  },
  {
    question: "Whom should I contact for questions?",
    answer: "For any questions or concerns, you may reach out directly to us.",
  },
  {
    question: "Would there be Takawyaki by DND during cocktail hours?",
    answer: "YES! We will be serving Takawyaki by DND during the cocktail hours at the reception. Get ready to enjoy some delicious Takawyaki while celebrating with us!",
  },
]

export function QATab() {
  return (
    <div className="px-4 py-8 pb-24 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-[30px] font-serif font-medium text-foreground mb-2">
          Questions & Answers
        </h2>
        <p className="text-muted-foreground text-sm">
          Everything you need to know about our special day
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card rounded-xl border border-border shadow-sm px-4 data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4 text-sm sm:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 text-left">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  )
}
