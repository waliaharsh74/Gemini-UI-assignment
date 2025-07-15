const AI_RESPONSES = [
  "That's an interesting question! Let me think about that for a moment.",
  "I understand what you're asking. Here's my perspective on this topic.",
  "Great question! I'd be happy to help you with that.",
  "That's a fascinating topic. Let me break this down for you.",
  "I see what you mean. Here's how I would approach this.",
  "Thanks for sharing that with me. Here's what I think.",
  "That's a complex question with several aspects to consider.",
  "I appreciate you asking about this. Let me explain.",
  "That's a really good point. Here's my take on it.",
  "Interesting! I have some thoughts on this that might help.",
]

export const generateAIResponse = async (userMessage: string): Promise<string> => {
  // Simulate AI thinking time (1-3 seconds)
  const thinkingTime = Math.random() * 2000 + 1000

  return new Promise((resolve) => {
    setTimeout(() => {
      const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]

      // Add some context based on user message
      let contextualResponse = randomResponse

      if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
        contextualResponse = "Hello! I'm Gemini, your AI assistant. How can I help you today?"
      } else if (userMessage.toLowerCase().includes("help")) {
        contextualResponse =
          "I'm here to help! You can ask me questions about various topics, and I'll do my best to provide helpful and informative responses."
      } else if (userMessage.toLowerCase().includes("code") || userMessage.toLowerCase().includes("programming")) {
        contextualResponse =
          "I'd be happy to help with coding questions! Whether you need help with debugging, learning new concepts, or writing code, I'm here to assist."
      }

      resolve(contextualResponse)
    }, thinkingTime)
  })
}
