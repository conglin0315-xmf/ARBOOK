# Children's AR Reading Tracker

A parent-facing MVP web app for tracking a child's English reading history, book levels, rereads, favorite themes/series, and simple book recommendations.

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Product Overview

Parents can:

- Create and edit child profiles.
- Add books manually, including an optional AR Level / ATOS Level.
- Log reading sessions, including rereads of the same book.
- See dashboard stats like total books, reading sessions, average AR level, most-read book, favorite series, and current reading range.
- Get simple rules-based recommendations grouped as Comfort Reads, Next Step Books, and Repeat Favorites.
- Export and import all local data as JSON.

Important: this MVP does not scrape AR Bookfinder or any proprietary Accelerated Reader database. AR/ATOS level is entered by the parent and should be verified with your school or official book lookup tools.

## Data Model

### Child Profile

- `id`
- `name`
- `age`
- `grade`
- `currentComfortArMin`
- `currentComfortArMax`
- `favoriteThemes`
- `favoriteSeries`

### Book

- `id`
- `title`
- `author`
- `isbn`
- `series`
- `arLevel`
- `interestLevel`
- `lexile`
- `arPoints`
- `coverUrl`
- `themes`

### Reading Log

- `id`
- `childId`
- `bookId`
- `readDate`
- `readingMode`
- `likedScore`
- `difficulty`
- `quizCompleted`
- `quizScore`
- `notes`

## Persistence

The app stores data in browser localStorage under:

```text
ar-reading-tracker-v1
```

Seed data is loaded on first launch and includes Max, starter books, and a few sample reading sessions.

## Recommendation Rules

The recommendation engine:

- Uses the child's recent average AR level from the last 10 sessions.
- Falls back to the profile comfort range if no history exists.
- Creates a Comfort Reads range at recent average minus/plus 0.2.
- Creates a Next Step Books range at recent average +0.1 to +0.4.
- Boosts books matching favorite themes or favorite series.
- Penalizes books already read more than 3 times for new recommendations.
- Shows already-read favorites separately as Repeat Favorites.
- Lowers the range by 0.2 if 3+ of the last 5 logs were too hard.
- Raises the range by 0.2 if 3+ of the last 5 logs were too easy.

## Supabase Migration Notes

The app is Supabase-ready by keeping domain types and data operations separated from UI components:

- Replace `lib/storage.ts` localStorage methods with Supabase client calls.
- Map `children`, `books`, and `logs` to Supabase tables.
- Keep `lib/types.ts` as the shared contract or generate types from Supabase.
- Move create/update/read operations from `AppContext` to async repository functions.
- Add row-level security once authentication is introduced.

No authentication is included in this MVP.
