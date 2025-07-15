# 🤖 Gemini Chat - AI Conversational Assistant

A fully functional, responsive, and visually appealing frontend for a Gemini-style conversational AI chat application built with Next.js 15, featuring OTP authentication, chatroom management, AI messaging simulation, and modern UX/UI.

## 🌐 Live Demo

**[View Live Application](https://gemini-ui-assignment.vercel.app/)**

## 🔐 Demo Login Credentials

For testing purposes, use any of the following:

- **Phone Number**: Any 10+ digit number (e.g., `1234567890`)
- **Country Code**: Select any country from the dropdown
- **OTP**: Any 6-digit number (e.g., `123456`, `000000`, `999999`)
- **Name**: Any name you prefer

> **Note**: The OTP system is simulated for demo purposes. Any 6-digit numeric code will work for verification.

## ✨ Features

### 🔐 Authentication

- **OTP-based Login/Signup** with country code selection
- **Real-time country data** fetched from restcountries.com API
- **Form validation** using React Hook Form + Zod
- **Persistent authentication** with localStorage

### 📱 Dashboard

- **Chatroom Management** - Create, delete, and organize chats
- **Debounced Search** - Filter chatrooms by title (300ms delay)
- **Responsive Grid Layout** - Adapts to all screen sizes
- **Toast Notifications** - Real-time feedback for all actions

### 💬 Chat Interface

- **Real-time Messaging** - Seamless user and AI conversations
- **Typing Indicators** - "Gemini is typing..." with animated dots
- **AI Response Simulation** - Throttled responses (1-3 second delays)
- **Auto-scroll** - Automatically scrolls to latest messages
- **Reverse Infinite Scroll** - Load older messages on demand
- **Image Upload** - Support for image sharing with preview
- **Copy to Clipboard** - Copy any message with hover action
- **Message Timestamps** - Relative time formatting

### 🎨 Global UX

- **Dark/Light Mode** - System preference detection + manual toggle
- **Fully Responsive** - Mobile-first design approach
- **Loading Skeletons** - Smooth loading states
- **Keyboard Accessibility** - Full keyboard navigation support
- **Modern Animations** - Smooth transitions and micro-interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <https://github.com/your-username/gemini-chat-app.git>
   cd gemini-chat-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install

   # or

   yarn install

   # or

   pnpm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev

   # or

   yarn dev

   # or

   pnpm dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
gemini-chat-app/
├── app/                          # Next.js App Router
│   ├── chat/[id]/               # Dynamic chat routes
│   │   └── page.tsx             # Individual chat page
│   ├── globals.css              # Global styles and Tailwind
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Home page (auth/dashboard)
├── components/                   # Reusable UI components
│   ├── auth/                    # Authentication components
│   │   └── auth-page.tsx        # OTP login/signup form
│   ├── chat/                    # Chat-related components
│   │   └── chat-interface.tsx   # Main chat UI
│   ├── dashboard/               # Dashboard components
│   │   └── dashboard.tsx        # Chatroom management
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx           # Button component
│   │   ├── card.tsx             # Card component
│   │   ├── input.tsx            # Input component
│   │   └── ...                  # Other UI primitives
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── hooks/                       # Custom React hooks
│   └── use-debounce.ts          # Debouncing utility hook
├── lib/                         # Utilities and configurations
│   ├── api/                     # API-related utilities
│   │   └── countries.ts         # Country data fetching
│   ├── stores/                  # Zustand state management
│   │   ├── auth-store.ts        # Authentication state
│   │   └── chat-store.ts        # Chat and messaging state
│   └── utils/                   # Utility functions
│       ├── ai-simulation.ts     # AI response generation
│       └── otp.ts               # OTP simulation utilities
└── public/                      # Static assets
    └── gemini-reference.png     # Reference design image
\`\`\`

## 🏗️ Architecture & Implementation

### State Management (Zustand)

**Authentication Store (`auth-store.ts`)**
\`\`\`typescript
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (user: User) => void
  logout: () => void
  initializeAuth: () => void
}
\`\`\`

**Chat Store (`chat-store.ts`)**
\`\`\`typescript
interface ChatState {
  chatrooms: Chatroom[]
  messages: Record<string, Message[]>
  isTyping: boolean
  createChatroom: (title: string) => string
  deleteChatroom: (id: string) => void
  addMessage: (chatroomId: string, message: Message) => void
}
\`\`\`

### 🔄 Throttling Implementation

**AI Response Throttling**
\`\`\`typescript
// lib/utils/ai-simulation.ts
export const generateAIResponse = async (userMessage: string): Promise<string> => {
  // Simulate AI thinking time (1-3 seconds)
  const thinkingTime = Math.random() * 2000 + 1000
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = generateContextualResponse(userMessage)
      resolve(response)
    }, thinkingTime)
  })
}
\`\`\`

**Search Debouncing**
\`\`\`typescript
// hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
\`\`\`

### 📄 Pagination & Infinite Scroll

**Message Pagination**
\`\`\`typescript
// chat-store.ts
loadMoreMessages: (chatroomId: string) => void => {
  // Simulate loading older messages (20 per batch)
  const dummyMessages: Message[] = Array.from({ length: 20 }, (_, i) => ({
    id: `old_msg_${Date.now()}_${i}`,
    content: `Older message ${i + 1}`,
    role: Math.random() > 0.5 ? "user" : "assistant",
    timestamp: new Date(Date.now() - (i + 1) *60000* 60),
  }))

  // Prepend to existing messages
  set((state) => ({
    messages: {
      ...state.messages,
      [chatroomId]: [...dummyMessages, ...(state.messages[chatroomId] || [])],
    },
  }))
}
\`\`\`

**Scroll Position Management**
\`\`\`typescript
// chat-interface.tsx
const handleLoadMore = async () => {
  const scrollHeight = messagesContainerRef.current?.scrollHeight || 0
  
  await loadMoreMessages(chatId)
  
  // Maintain scroll position after loading
  setTimeout(() => {
    if (messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight
      messagesContainerRef.current.scrollTop = newScrollHeight - scrollHeight
    }
  }, 100)
}
\`\`\`

### ✅ Form Validation

**Zod Schemas**
\`\`\`typescript
// Phone validation schema
const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

// OTP validation schema
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
})
\`\`\`

**React Hook Form Integration**
\`\`\`typescript
const phoneForm = useForm<PhoneFormData>({
  resolver: zodResolver(phoneSchema),
  defaultValues: {
    countryCode: "",
    phone: "",
    name: "",
  },
})
\`\`\`

### 🎨 Responsive Design

**Tailwind CSS Breakpoints**

- `sm:` - 640px and up
- `md:` - 768px and up  
- `lg:` - 1024px and up
- `xl:` - 1280px and up

**Mobile-First Approach**
\`\`\`typescript
// Example responsive classes
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
className="flex flex-col sm:flex-row gap-4"
className="w-full max-w-md sm:max-w-lg lg:max-w-2xl"
\`\`\`

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Theme**: next-themes

## 🔧 Key Features Implementation

### Authentication Flow

1. **Country Selection** - Fetches real country data from REST Countries API
2. **Phone Validation** - Validates phone number format and length
3. **OTP Simulation** - Accepts any 6-digit numeric code
4. **Persistent Sessions** - Stores auth state in localStorage

### Chat Features

1. **Real-time Messaging** - Instant message updates with optimistic UI
2. **AI Simulation** - Context-aware responses with realistic delays
3. **Image Handling** - Base64 encoding with 5MB size limit
4. **Message Actions** - Copy to clipboard with toast feedback

### Performance Optimizations

1. **Debounced Search** - Reduces API calls and improves UX
2. **Lazy Loading** - Messages loaded on demand
3. **Optimistic Updates** - Immediate UI feedback
4. **Efficient Re-renders** - Zustand's selective subscriptions

## 🚀 Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

**Live URL**: [https://gemini-ui-assignment.vercel.app/](https://gemini-ui-assignment.vercel.app/)

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/gemini-chat-app)

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from Google Gemini
- UI components from shadcn/ui
- Country data from REST Countries API
- Icons from Lucide React

---

**Built with ❤️ using Next.js and modern web technologies**
