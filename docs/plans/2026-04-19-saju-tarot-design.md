# Saju & Tarot Stateless Service Design

## Overview
A web application providing "Saju (Four Pillars of Destiny) & Tarot Horoscope" services.
The core philosophy is absolute privacy: no database integration, zero persistent state storage. All sensitive data calculations and interactions happen either directly in the client browser memory or are proxied strictly through transient serverless functions without logging.

## Core Principles
1. **Stateless**: The application utilizes React State for temporary data storage. Closing the browser tab destroys all state entirely.
2. **AI Proxy**: The API is strictly a pass-through intermediary to protect API keys. Data is discarded immediately after response.
3. **Immersive Atmosphere**: High-quality dark mode aesthetics, mystical animations.

## Architecture
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Core Tools**: Google GenAI SDK (Gemini Pro), jspdf / html2canvas (Local Export)

## Components & Modules
1. **Saju Engine (Client-side)**: An algorithmic module for Manse-ryeok, generating 8 characters (Palja) and the 5 Elements natively within the browser without communicating with a server to preserve absolute privacy.
2. **Tarot Engine (Client-side)**: A fixed array dataset of 78 tarot cards. Provides 3-card random picker logic, intertwined with Framer Motion animations to simulate physical cards.
3. **Interpretation API (`/api/interpret`) (Serverless)**: Accepts generated Saju JSON and 3 Tarot cards. Injects the LLM persona prompt ("Master of oriental astrology and western Tarot"). Retrieves AI interpretation output as JSON and returns it safely to client.

## Data Flow
1. **Input Phase**: User inputs Birth Data. Client processes it into Saju. User triggers Tarot spread and turns over 3 cards interactively.
2. **Call Phase**: Client sends `{ saju_data, tarot_cards }` to internal Next.js POST endpoint.
3. **AI Phase**: Next.js serverless route injects `.env.local` Gemini Key, fetches LLM result, parses the text stream, and yields the final JSON payload.
4. **Presentation**: Client visualizes the dynamic report using mystical typography and CSS.
5. **Export**: User click triggers local DOM-to-PDF conversion, keeping the offline artifact secure on their local drive space.
