"use client"

import ChainReactionPanel from "@/components/chain-reaction-panel"
import { ExploreIIContent, ReactionEvent } from "../content/types"

interface ExploreIITemplateProps {
  content: ExploreIIContent
  selectedEvent?: ReactionEvent | null
  onEventSelect?: (event: ReactionEvent) => void
}

export default function ExploreIITemplate({ 
  content, 
  selectedEvent, 
  onEventSelect 
}: ExploreIITemplateProps) {
  return (
    <div className="h-full">
      <ChainReactionPanel
        events={content.events}
        eventTypes={content.eventTypes}
        eventResponses={content.eventResponses}
        selectedEvent={selectedEvent}
        onEventSelect={onEventSelect}
        chainReactionPatterns={content.chainReactionPatterns}
      />
    </div>
  )
}