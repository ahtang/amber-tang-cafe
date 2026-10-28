# Amber Café chatbot — V55 response design

The five-question starter list is now three questions, exactly as requested. The full original topic/answer knowledge records have NOT been removed: they are still inside `assets/amber-chat.js` for retrieval and are also preserved verbatim in `AMBER-CHAT-V54-FULL-SOURCE.js`. Existing source notes, portfolio pages, resume, and blurbs remain packaged.

The chat displays concise first responses. The three starter questions have edited, voice-matched short responses. Other questions return a shorter excerpt from the best-matched topic. Ask "tell me more" to read the full answer associated with the previous topic.

IMPORTANT: This is still a deterministic offline topic matcher, not a generative model. It cannot accurately answer arbitrary unrelated questions or reason deeply over all included documents on its own. No API key or paid external service has been configured.
