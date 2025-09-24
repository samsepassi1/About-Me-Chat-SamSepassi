# Sam Sepassi Portfolio

A modern, interactive portfolio website featuring an AI-powered chat assistant that can answer questions about Sam's cybersecurity experience, skills, and professional background.

## Features

- **AI Chat Assistant**: Intelligent chatbot powered by OpenAI GPT-5 that provides detailed information about Sam's career
- **Contact Management**: Automated contact form submission with email notifications
- **Analytics Dashboard**: Real-time analytics tracking visitor interactions and engagement
- **Email Automation**: Automated follow-up email sequences using Brevo API
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Type Safety**: Full TypeScript implementation across frontend and backend

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Wouter** for client-side routing
- **TanStack Query** for state management and API calls
- **shadcn/ui** component library
- **Tailwind CSS** for styling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Neon PostgreSQL** for data persistence

### External Services
- **OpenAI API** (GPT-5) for AI chat functionality
- **Brevo Email API** for transactional emails and notifications

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, Dashboard)
│   │   ├── lib/            # Utility functions and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express.js application
│   ├── services/           # Business logic services
│   │   ├── openai.ts       # AI service integration
│   │   ├── email.ts        # Email notification service
│   │   └── resume-parser.ts # Sam's professional data
│   ├── storage.ts          # Database storage interface
│   ├── routes.ts           # API route definitions
│   └── db.ts              # Database connection setup
├── shared/                 # Shared TypeScript schemas
│   └── schema.ts          # Database schema and types
└── README.md              # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or Neon account)
- OpenAI API key
- Brevo API key

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
BREVO_API_KEY=your_brevo_api_key
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sam-sepassi-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## API Endpoints

### Chat API
- `POST /api/chat` - Send message to AI assistant
  - Body: `{ message: string, sessionId: string, messageHistory?: array }`
  - Response: `{ response: string }`

### Contact API
- `POST /api/contact` - Submit contact form
  - Body: `{ name: string, email: string, message?: string }`
  - Response: `{ success: boolean }`

### Analytics API
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/contacts` - Get contact analytics

### Health Checks
- `GET /health` - Application health status
- `GET /ready` - Service readiness status

## Database Schema

The application uses the following main tables:

- **users** - User accounts (if authentication is added)
- **chat_messages** - Chat conversation history
- **contact_submissions** - Contact form submissions
- **unknown_questions** - Questions the AI couldn't answer
- **email_follow_ups** - Scheduled email follow-up tasks

## AI Chat Features

The AI assistant can:
- Answer questions about Sam's cybersecurity experience and skills
- Provide information about certifications and career background
- Collect user contact information when they express interest
- Record unknown questions for future knowledge base improvements
- Trigger automated email notifications and follow-ups

## Email Automation

The system includes automated email workflows:
- **Immediate Notification**: Sam receives instant notifications of new contacts
- **Welcome Email**: New contacts receive a personalized welcome message
- **Follow-up Sequence**: Automated follow-ups at 3 days and 7 days
- **Unknown Questions**: Sam is notified when the AI encounters questions it can't answer

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Database operations
npm run db:push          # Push schema changes to database
npm run db:push --force  # Force push schema changes

# Type checking
npm run type-check
```

## Analytics & Monitoring

The dashboard provides insights into:
- Total contact submissions and growth trends
- Chat message volume and unique sessions
- Recent contact activity and unknown questions
- Real-time analytics with 30-second refresh intervals

## Deployment

The application is configured for easy deployment with:
- Health check endpoints for monitoring
- Environment variable configuration
- Production build optimization
- PostgreSQL connection pooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary to Sam Sepassi.

---

For questions or support, contact Sam Sepassi at samsepassi2@gmail.com