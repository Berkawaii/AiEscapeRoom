# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Gamers, AI puzzle enthusiasts, detective/escape room fans, and software engineers evaluating high-concurrency distributed lock architectures.

## Product Purpose
An asynchronous AI-driven Escape Room Engine that uses Large Language Models (Groq Llama 3.3 70B & Google Gemini) as a dynamic State Machine instead of static branch trees.

## Positioning
A $0 budget, enterprise-grade high-concurrency AI game engine protected against player spam and Race Conditions using Redis Distributed Locking (HTTP 429).

## Operating Context
Web browser control deck featuring real-time HUD (Health, Inventory, Discovered Clues, PostgreSQL JSONB state), multi-language TR/EN support, dynamic world theme transformations (Cyberpunk, Gothic Haunted Manor, Sci-Fi Base, Medieval Dungeon), and an active concurrency benchmark suite.

## Capabilities and Constraints
- **0$ Infrastructure Budget**: Deployed on Render.com free tier, Supabase PostgreSQL free tier, Redis Cloud free tier, and Groq/Gemini AI API free tiers.
- **High Concurrency Protection**: Redis `NX/PX` lock prevents concurrent state mutations on the same room.
- **Multi-Language**: Instant TR 🇹🇷 / EN 🇬🇧 localization for UI and LLM prompts.
- **Dynamic Models**: Supports `GEMINI_MODEL` and `GROQ_MODEL` environment configuration.

## Brand Commitments
- Name: **AI Escape Room Engine**
- Aesthetic Direction: **Vanguard Control Deck** (Awwwards-tier Doppelrand nested enclosures, floating glass island navigation, sinematic noise texture, scenario theme worlds).

## Evidence on Hand
- Live codebase running NestJS TypeScript backend + Redis Cloud + Supabase PostgreSQL.
- Live web dashboard at `http://localhost:3001`.
- GitHub repository at `https://github.com/Berkawaii/AiEscapeRoom.git`.

## Product Principles
1. **Zero Fake Fallbacks**: Pure production mode with real Supabase DB and Redis Cloud.
2. **State Machine Consistency**: Every player action mutates a single authoritative JSONB state object.
3. **Atomic Concurrency Protection**: Any race condition attempt gets instantly rejected with HTTP 429.
4. **Cinematic Immersion**: World themes dynamically transform typography, color palettes, micro-motion, and audio effects.
