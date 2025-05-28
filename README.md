# Party Venue Directory

A comprehensive UK party venue directory that helps parents find and compare children's party venues with detailed package information, pricing, and parent-focused details.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase and OpenAI keys
   ```

3. **Set up database:**
   - Create a Supabase project
   - Run the SQL in `supabase/schema.sql` in your Supabase dashboard
   - Enable PostGIS extension if not already enabled

4. **Seed test data:**
   ```bash
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Visit the application:**
   - **Homepage**: http://localhost:3000
   - **Venues page**: http://localhost:3000/venues
   - **London venues**: http://localhost:3000/venues/london
   - **Hackney venues**: http://localhost:3000/venues/london/boroughs/hackney
   - **Sample venue detail**: http://localhost:3000/venues/london/abc-soft-play-center-london
   - **Admin login**: http://localhost:3000/admin/login
   - **Admin dashboard**: http://localhost:3000/admin

## Project Status

✅ **Completed (TICKET-001): Next.js Foundation**
- Next.js 15 project with TypeScript and App Router
- Tailwind CSS and shadcn/ui configured
- Core dependencies installed (Supabase, Leaflet, Playwright)
- Environment variables structure set up
- **Build working and development server running**

✅ **Completed (TICKET-002): Database Schema**
- Complete database schema created in `supabase/schema.sql`
- All tables, indexes, and RLS policies defined
- Sample data structure with venues, packages, cities
- Seed script created (requires Supabase setup)

✅ **Partially Completed (TICKET-003): Admin Authentication**
- Admin login page created at `/admin/login`
- Admin dashboard with stats and quick actions
- Simplified auth middleware (full implementation pending)
- Mock authentication for demo purposes

✅ **Complete Frontend Foundation**
- Homepage with working search interface
- Venues browse page with search/filter functionality
- Detailed venue pages with tabs and package information
- City and borough landing pages (London, Hackney)
- Navigation with working links
- Parent-focused design and messaging
- Mobile-responsive layout throughout
- Mock data for demonstration

✅ **Scraping Infrastructure Foundation**
- URL collection script with 40+ search queries and real DuckDuckGo integration
- Playwright-based venue scraper structure
- OpenAI data extraction pipeline with GPT-3.5
- Database integration patterns

## Next Steps

Follow the remaining tickets in `party-venue-tickets.md`:

1. **TICKET-003**: Implement authentication for admin users
2. **TICKET-004**: Complete URL collector with real search integration
3. **TICKET-005**: Finish Playwright scraper implementation
4. **TICKET-006**: Create OpenAI data extraction pipeline
5. **TICKET-007**: Build admin dashboard
6. **Continue with remaining tickets...**

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # TypeScript compilation check

# Database
npm run db:seed      # Seed development data

# Scraping (when implemented)
npm run scrape:urls     # Collect venue URLs
npm run scrape:venues   # Scrape venue content
npm run scrape:extract  # Extract data with OpenAI
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Maps**: Leaflet + OpenStreetMap
- **Scraping**: Playwright + OpenAI API
- **Hosting**: Vercel (planned)

## Architecture

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utilities, database client, types
- `/scripts` - Data collection and processing scripts
- `/supabase` - Database schema and migrations

The platform uses a data pipeline: Search → Scrape → AI Extract → Admin Review → Publish