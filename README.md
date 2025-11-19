# MediatorAI

MediatorAI is an AI-powered mediation platform that facilitates fair and efficient dispute resolution through guided conversations and intelligent suggestions. Built with React, Supabase, and OpenAI's GPT-4, it provides a neutral environment for parties to reach agreements with AI assistance.

## Features

### Core Functionality
- **User Authentication**: Secure sign-in with email/password or Google OAuth
- **Case Management**: Create, join, and manage mediation cases
- **Real-time Chat**: Live messaging between parties with AI mediation support
- **AI-Powered Mediation**: Intelligent suggestions including:
  - Situation summaries
  - Compromise options
  - Message rephrasing for calmer communication
  - Agreement drafting and improvement
- **Agreement Management**: Draft, finalize, and digitally sign agreements
- **Context Sharing**: Parties can provide background, goals, and constraints

### Key Screens
- **Authentication**: Login/signup with form validation
- **Dashboard**: Overview of active cases and quick actions
- **Case Creation Wizard**: Step-by-step case setup with invite generation
- **Mediation Room**: Main chat interface with AI tools and agreement drafting
- **Case Joining**: Token-based invitation system

## Architecture

### Frontend
- **React 19**: Modern React with hooks and functional components
- **React Router**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent UI elements
- **React Query**: Data fetching and caching
- **Vite**: Fast build tool and development server

### Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
  - Authentication with RLS (Row Level Security)
  - Real-time messaging and updates
  - File storage capabilities
- **OpenAI GPT-4**: AI mediation intelligence

### Database Schema
- **profiles**: User profiles linked to Supabase auth
- **cases**: Mediation cases with metadata
- **case_participants**: Users participating in cases
- **case_context**: Background information from each party
- **messages**: Chat messages with AI suggestions
- **agreements**: Draft and finalized agreements

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mediatorai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Supabase Setup**
   - Create a new Supabase project
   - Run the migration: `supabase db push`
   - Configure authentication providers (Google OAuth if needed)
   - Update the site URL in auth settings to match your deployment

5. **Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

6. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

### Deployment
- **Vercel/Netlify**: Connect your repository and set environment variables
- **Supabase Hosting**: Use Supabase's built-in hosting
- Ensure environment variables are set in your hosting platform

## Usage Guide

### Getting Started
1. **Sign Up**: Create an account with email/password or Google
2. **Dashboard**: View your cases or start a new mediation

### Creating a Case
1. Click "Create Case" on the dashboard
2. Fill in case details (title, description, type)
3. Optionally add an invite email
4. Generate an invite link to share with the other party
5. Provide your context (background, goals, acceptable outcomes)
6. The case becomes active once both parties join

### Joining a Case
1. Use the invite link provided by the case initiator
2. Provide your context information
3. Start mediating!

### During Mediation
- **Chat**: Communicate directly with the other party
- **AI Tools**: Use AI suggestions for:
  - Summarizing the current situation
  - Suggesting compromises
  - Rephrasing messages calmly
  - Drafting agreements
- **Agreement**: Work on drafting and finalizing agreements
- **Signing**: Digitally acknowledge agreements

### Best Practices
- Be respectful and clear in communications
- Use AI tools to maintain neutrality
- Provide detailed context for better AI suggestions
- Save drafts regularly
- Both parties should review agreements before signing

## Security Considerations

⚠️ **Important Security Notes:**
- API keys are exposed client-side for demo purposes
- For production, implement server-side API calls
- Use environment variables for all secrets
- Enable Supabase RLS policies
- Regularly rotate API keys
- Implement rate limiting for AI calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This AI-powered mediation tool is provided for informational purposes only and does not constitute legal advice. Users should consult with qualified legal professionals for any legal matters. The AI mediator facilitates communication but does not guarantee resolution or enforce agreements.

## Support

For support, please open an issue on GitHub or contact the development team.
