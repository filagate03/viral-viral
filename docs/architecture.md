# YouTube Scraper App Architecture

## Project Structure
```
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   └── Header.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Progress.tsx
│   │   ├── Slider.tsx
│   │   ├── Tabs.tsx
│   │   ├── Tag.tsx
│   │   └── Accordion.tsx
│   └── features/
│       ├── QueryForm.tsx
│       ├── ProgressPanel.tsx
│       ├── VideoGrid.tsx
│       ├── AnalysisPanel.tsx
│       ├── ScenarioPanel.tsx
│       └── TipsAccordion.tsx
├── context/
│   └── ScraperContext.tsx
├── hooks/
│   └── useScraper.ts
├── services/
│   ├── apiClient.ts
│   ├── openAiService.ts
│   ├── youtubeService.ts
│   └── scraperPipeline.ts
├── types/
│   └── index.ts
├── utils/
│   ├── format.ts
│   └── progress.ts
└── styles/
    └── theme.ts
```

## Data Flow
1. **User Input** – `QueryForm` captures `searchQuery` and `requestCount` and triggers `startScrape` from context.
2. **Scraper Pipeline** – `useScraper` orchestrates sequential mutations:
   - `generateQueries` (OpenAI) → `fetchTrendingVideos` (YouTube) → `analyzePopularity` (OpenAI) → `createScenarios` & `generateShootingTips` (OpenAI).
3. **State Distribution** – `ScraperContext` stores the latest payload (`queries`, `videos`, `analysis`, `scenarios`, `tips`, `progress`), exposing selectors for feature components.
4. **UI Updates** – Feature panels subscribe to context slices and render loading, success, or empty states using shared UI primitives.
5. **Error & Retry** – Failures captured per stage with actionable messages surfaced in `ProgressPanel` and toast notifications.

## Component Responsibilities
### Layout
- **AppLayout** – page shell with background gradient, responsive padding, and global providers.
- **Header** – top navigation with brand mark, status indicators, and utility actions (settings/help placeholders).

### UI Primitives
- **Button** – semantic variants (`primary`, `secondary`, `ghost`) with loading and icon slots.
- **Card** – grouped surface with density modifiers for compact cards in grid.
- **Input** – label, helper, and validation message support; integrates with `react-hook-form`.
- **Slider** – accessible range input bound to form via RHF controller.
- **Progress** – radial and linear progress variations.
- **Tabs** – segmented control for switching between data views on small screens.
- **Accordion** – disclosure component for shooting tips.
- **Tag** – pill element for metadata badges.

### Features
- **QueryForm** – handles search form, validation (Zod), and mutation triggers; displays API quota usage summary.
- **ProgressPanel** – visualizes pipeline stage status, including retries and durations.
- **VideoGrid** – displays fetched videos with thumbnails, metrics, and trend badges.
- **AnalysisPanel** – highlights popularity drivers with severity indicators.
- **ScenarioPanel** – outlines AI-generated storyboard scenarios with CTA to export.
- **TipsAccordion** – lists production tips grouped by category with copy actions.

## State & Side Effects
- React Query handles async orchestration with sequential mutations managed inside `useScraper.startPipeline`.
- Context value keeps derived progress metrics computed via `calculateProgress` utility.
- Toast notifications emitted via `useToast` helper (lightweight implementation using context and timeouts).
- Local storage persists most recent query for convenience.

## API Integration
- `apiClient` wraps Axios with interceptors for auth headers and rate-limit logging.
- `youtubeService.fetchVideos` calls `https://www.googleapis.com/youtube/v3/search` with paginated batching respecting `requestCount`.
- `openAiService` targets `https://api.openai.com/v1/responses` using assistants-style payloads keyed by environment variables.
- `scraperPipeline` exposes high-level methods that aggregate the lower-level services and transform responses into internal types.
- All API keys are provided via Vite env vars (`VITE_OPENAI_API_KEY`, `VITE_OPENAI_PROJECT_ID`, `VITE_YOUTUBE_API_KEY`) and injected through headers.

## Error Handling & Observability
- Each stage throws typed errors (`ScraperError`) with `stage`, `message`, and `hint` fields.
- Failures update context state, show toast, and allow user to retry the single failed stage.
- `ProgressPanel` logs timestamps; additional hook `useStageTimer` records durations.

## Performance & UX Considerations
- Skeleton placeholders for videos and cards while loading.
- `IntersectionObserver` within `VideoGrid` delays heavy thumbnail rendering until in view.
- `useMemo` caches derived analytics; `React.memo` wraps list items.
- Responsive design uses CSS grid breakpoints and a mobile-first column layout mirroring provided design.

## Deployment Notes
- Tailwind JIT and React Query Devtools disabled in production builds.
- Netlify: add build command `npm run build`, publish directory `dist`, env vars configured via Netlify dashboard.
- Recommended to enable Netlify edge caching for `/api/youtube` proxy endpoints if backend deployed separately.
