# Composer Kit - Next.js 14 Boilerplate (Specifically downgraded for Claude Sonnet 3.5)

A modern Next.js 14 application that helps developers build better applications with AI assistance, starter kits, and collaboration tools.

## 🚀 Features

### Core Features
- 🤖 AI-powered code assistance and debugging
- 💻 Pre-built starter kits and templates
- 🔄 Real-time chat interface
- 📊 Chat history and session management
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🌙 Light/Dark mode support

### Authentication & Security
- 🔐 Supabase authentication
- 🔑 Social login providers
- 👤 User profile management
- 🛡️ Row Level Security (RLS)

### Premium Features
- 📚 Access to premium starter kits
- 👥 Developer collaboration tools
- 💬 Discord community access
- ⚡ Priority support
- 📝 Extended chat history

### Payment Integration
- 💳 Stripe subscription management
- 💰 Multiple pricing tiers
- 📅 Usage-based billing
- 🔄 Automatic renewals

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI Integration**: OpenAI
- **State Management**: React Context
- **Animations**: Framer Motion

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/composer-kit.git
cd composer-kit
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Stripe Product/Price IDs
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_monthly
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_yearly

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

5. Set up Supabase:

a. Create a new Supabase project at https://supabase.com and save your project URL and keys

b. Install and set up Supabase CLI:
```bash
npm install -g supabase
supabase login
```bash
supabase link --project-ref your-project-ref
```

c. Apply database migrations:
```bash
# The migrations in supabase/migrations/ will be applied in order:
# - 20230601000000_create_subscriptions.sql: Creates initial tables and RLS policies
# - 20231126000000_update_subscriptions.sql: Updates subscription table and policies
# - 20240320000000_initial_schema.sql: Consolidates schema with chat history and indexes
# - seed.sql: Optional seed data for development

supabase db push
```

The migrations in `supabase/migrations/` will set up:

1. Database Tables:
   - `profiles`: User profiles with username, full name, and avatar
   - `subscriptions`: Stripe subscription data and status
   - `user_settings`: User preferences including API keys and theme
   - `chat_history`: Chat messages with JSONB storage and timestamps

2. Security:
   - Profiles: Public viewing, authenticated user updates
   - Subscriptions: User-specific access and service role management
   - User Settings: User-specific CRUD operations
   - Chat History: User-specific CRUD with automatic timestamps

3. Functions & Triggers:
   - `handle_new_user()`: Creates initial profile and settings on signup
   - `update_updated_at_column()`: Updates timestamps for chat history
   - `on_auth_user_created`: Handles new user initialization
   - `update_chat_history_updated_at`: Maintains chat history timestamps

To verify the setup:
```bash
# View applied migrations
supabase migration list

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts
```

6. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
composer-kit/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── public/              # Static assets
├── supabase/
│   └── migrations/      # Database migrations
│       ├── 20230601000000_create_subscriptions.sql
│       └── 20231126000000_update_subscriptions.sql
       └── 20240101000000_add_chat_history.sql
└── styles/             # Global styles
```

## 🗄️ Database Migrations

The database schema is managed through migrations in the `supabase/migrations/` directory. Each migration file contains SQL commands that create and configure the database tables, security policies, and other database objects.

To understand the database schema:
1. Review the migration files in chronological order
2. Use `supabase migration list` to see applied migrations
3. Check generated TypeScript types in `src/types/supabase.ts`

## 🔒 Authentication Flow

1. Users can sign up/login using:
   - Email/Password
   - Social providers (GitHub, Google)
   - Magic links

2. After authentication:
   - User profile is created
   - Default settings are initialized
   - Free tier access is granted

## 💳 Subscription System

- **Free Tier**: Basic AI assistance
- **Premium Tier**: 
  - Full access to starter kits
  - Unlimited chat history
  - Discord community access
  - Priority support

## 🛡️ Security Features

- Row Level Security (RLS) policies
- Secure API endpoints
- Protected routes
- Type-safe database queries
- Environment variable validation

## 📝 API Integration

### OpenAI Integration
- Chat completion API
- Token usage tracking
- Rate limiting
- Error handling

### Stripe Integration
- Subscription management
- Usage-based billing
- Webhook handling
- Payment processing

## 🧪 Development

```bash
# Start Supabase locally
supabase start

# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run build
npm run build

# Stop Supabase
supabase stop

# View Supabase logs
supabase logs

# Check Supabase status
supabase status
```

### Database Management

```bash
# Create a new migration
supabase migration new your_migration_name

# List all migrations
supabase migration list

# Push database changes
supabase db push

# Revert last migration
supabase db reset --db-only

# View diff between local and remote
supabase db diff
```

## 📚 Documentation

For detailed documentation, visit:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI Documentation](https://platform.openai.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support, email support@composers.dev or join our [Discord community](https://discord.gg/HmCecGnRAt).