export type ReadingMode =
  | "independent"
  | "read_aloud"
  | "listened"
  | "parent_assisted";

export type Difficulty =
  | "too_easy"
  | "just_right"
  | "a_bit_hard"
  | "too_hard";

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  grade: string;
  currentComfortArMin: number;
  currentComfortArMax: number;
  favoriteThemes: string[];
  favoriteSeries: string[];
};

export type Book = {
  id: string;
  title: string;
  author: string;
  shelf?: "reading" | "wishlist" | "archive";
  isbn?: string;
  series?: string;
  arLevel?: number;
  interestLevel?: string;
  lexile?: string;
  arPoints?: number;
  coverUrl?: string;
  themes: string[];
};

export type ReadingLog = {
  id: string;
  childId: string;
  bookId: string;
  createdAt?: string;
  readDate: string;
  readingMode: ReadingMode;
  likedScore: 1 | 2 | 3 | 4 | 5;
  difficulty: Difficulty;
  quizCompleted: boolean;
  quizScore?: number;
  notes?: string;
};

export type AppData = {
  children: ChildProfile[];
  books: Book[];
  logs: ReadingLog[];
  selectedChildId?: string;
};

export type RecommendationKind = "comfort" | "next_step" | "repeat";

export type BookRecommendation = {
  book: Book;
  kind: RecommendationKind;
  score: number;
  reason: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceArRange?: string;
};
