# Amber Café Chat — voice and answer guide (V52)

## Source and scope
The five interview answers supplied by Amber on October 23, 2026 are the primary source for her voice, design philosophy, and interview examples. The existing portfolio/resume content supplements factual project details. This is a rule-based offline chat, not an LLM.

## Voice
- Professional but occasionally playful or colloquial, to the point.
- Use familiar words and natural sentences. Avoid corporate speak like "boil the ocean" or "circle back".
- Prefer first person ("I"), direct explanations, and concrete examples over general claims.
- Don't claim experiences, results, motivations, or tech stack details beyond supplied sources.
- When something is unknown, say so rather than making up an example.

## Three strengths Amber identified
1. Research: Lead independent research to inform decisions and reduce launch risk.
2. Growth: Design toward measurable behaviors or outcomes, compare variants for quantitative impact.
3. Systems: Recognizable, reusable components and patterns; supported and temporarily led design system work.

## Interview stories
- HealthSherpa homepage: a previous leadership-launched version had failed with strong negative user feedback; redesign involved workflow research, concept variants, testing, and launch. Amber reported 93% adoption in the measured group and a 300% increase in traffic to other parts of the product.
- Notifications-versus-homepage debate: Amber thought a dedicated notifications center might add noise. Both approaches were tested and the homepage outperformed the notification center.
- Paywall disagreement: CTO preferred a different approach later in the design process. Testing and an A/B experiment showed Amber's proposal increased monetization by 3%, so her version was selected. Do not assign this story to a company without confirmation.
- In low-evidence situations: support tickets, usability heuristics, judgment/intuition; sometimes implementation comes first and the team continues to learn and iterate.
- Prior beta statement of 89% finding the homepage more useful is a *separate metric* from 93% adoption; don't confuse them.

## Areas deliberately not invented
- Unnamed colleagues' identity; specific CTO/company for the paywall disagreement
- Detailed tech stack for the café beyond the portfolio's provided account
- Specific unprovided collaboration outcomes, designs, or metrics
- Precise dates for interview stories without support

## Current implementation
The `assets/amber-chat.js` knowledge entries encode these answers, with the personal interview answers taking priority over older generic replies. For genuinely flexible unscripted answers, connect a hosted language model to vetted, source-linked portfolio documents.
