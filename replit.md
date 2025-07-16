# YouTube Search Application

## Overview

This is a full-stack YouTube search application built with React, Express, and TypeScript. The application allows users to search for YouTube videos, view video details, maintain a watchlist, and track search history. It features a modern UI built with shadcn/ui and Tailwind CSS, with both light and dark theme support.

## System Architecture

The application follows a monorepo structure with a clear separation between client, server, and shared code:

- **Frontend**: React SPA with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage as fallback)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state, React Context for theme management

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: 
  - React Query for API calls and caching
  - Local storage fallback for offline functionality
  - Context API for theme management
- **Build Tool**: Vite with TypeScript support

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **API Proxy**: YouTube Data API v3 proxy to handle CORS and API key management
- **Storage Strategy**: 
  - Primary: In-memory storage (MemStorage class)
  - Future: PostgreSQL with Drizzle ORM (configuration ready)
- **Session Management**: Prepared for PostgreSQL sessions with connect-pg-simple

### Database Schema
The application defines three main entities:
- **Users**: Authentication and user management
- **Search History**: Track user search queries with timestamps
- **Watchlist**: Save videos for later viewing

### API Structure
- `GET /api/youtube/search` - Proxy YouTube search API with CORS handling
- `GET /api/search-history` - Retrieve user search history
- `POST /api/search-history` - Add search query to history
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add video to watchlist
- `DELETE /api/watchlist/:videoId` - Remove video from watchlist

## Data Flow

1. **Search Flow**: User enters search query → Frontend calls YouTube API proxy → Results displayed with video cards
2. **Watchlist Flow**: User clicks bookmark → API call to add/remove from watchlist → UI updates with optimistic updates
3. **History Flow**: Search queries automatically saved to history → Accessible via sidebar
4. **Theme Flow**: Theme preference stored in localStorage → Applied via CSS classes

## External Dependencies

### Core Dependencies
- **YouTube Data API v3**: Video search and metadata retrieval
- **Neon Database**: PostgreSQL hosting (configured for future use)
- **shadcn/ui & Radix UI**: Component library and accessibility primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database operations

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Server-side bundling for production

## Deployment Strategy

The application is configured for Replit deployment with:
- **Development**: Vite dev server with HMR and Express API proxy
- **Production**: Static files served by Express with API routes
- **Build Process**: 
  - Frontend: Vite builds to `dist/public`
  - Backend: ESBuild bundles server to `dist/index.js`
- **Environment Variables**: YouTube API key and database URL management

## Changelog

- June 29, 2025. Initial setup with YouTube search functionality
- June 29, 2025. Major redesign: Removed login requirement, added trending videos homepage, implemented sidebar with Shorts/History/Discover sections, added search filters for shorts vs long-form videos, prepared for Google OAuth integration
- June 29, 2025. Final improvements: Implemented icon-only sidebar, Google OAuth with Firebase, OLED black dark mode, card tilt effects on hover, fixed channel click handling, proper section navigation, round profile thumbnails

## User Preferences

- No login required - direct access to homepage with trending videos
- Homepage shows categorized trending videos (changeable by category/country)
- Search functionality with toggle filter for shorts vs long-form videos  
- Sidebar with "Shorts", "Watch History", and "Entdecken" sections
- Google OAuth for personalized features (liked videos, playlists, personalized homepage)
- Minimalistic, privacy-focused design
- App name: "HomeTube"
- Preferred communication style: Simple, everyday language