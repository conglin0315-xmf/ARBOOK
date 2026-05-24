import type { AppData } from "./types";

export const seedData: AppData = {
  selectedChildId: "child-max",
  children: [
    {
      id: "child-max",
      name: "Max",
      age: 5,
      grade: "Pre-K / Kindergarten",
      currentComfortArMin: 0.8,
      currentComfortArMax: 1.4,
      favoriteThemes: ["animals", "funny", "friendship", "school"],
      favoriteSeries: ["Biscuit", "Pete the Cat"]
    }
  ],
  books: [
    {
      id: "book-biscuit",
      title: "Biscuit",
      author: "Alyssa Satin Capucilli",
      series: "Biscuit",
      arLevel: 0.7,
      interestLevel: "LG",
      themes: ["animals", "friendship"]
    },
    {
      id: "book-brown-bear",
      title: "Brown Bear, Brown Bear, What Do You See?",
      author: "Bill Martin Jr.",
      arLevel: 1.5,
      interestLevel: "LG",
      themes: ["animals", "colors"]
    },
    {
      id: "book-pete-white-shoes",
      title: "Pete the Cat: I Love My White Shoes",
      author: "Eric Litwin",
      series: "Pete the Cat",
      arLevel: 1.5,
      interestLevel: "LG",
      themes: ["funny", "music", "school"]
    },
    {
      id: "book-caterpillar",
      title: "The Very Hungry Caterpillar",
      author: "Eric Carle",
      arLevel: 2.9,
      interestLevel: "LG",
      themes: ["animals", "food"]
    },
    {
      id: "book-frog-toad",
      title: "Frog and Toad Are Friends",
      author: "Arnold Lobel",
      arLevel: 2.9,
      interestLevel: "LG",
      themes: ["friendship", "animals"]
    },
    {
      id: "book-elephant-piggie-fly",
      title: "Elephant & Piggie: Today I Will Fly!",
      author: "Mo Willems",
      series: "Elephant & Piggie",
      arLevel: 0.7,
      interestLevel: "LG",
      themes: ["funny", "friendship"]
    },
    {
      id: "book-fly-guy",
      title: "Fly Guy",
      author: "Tedd Arnold",
      series: "Fly Guy",
      arLevel: 1.5,
      interestLevel: "LG",
      themes: ["funny", "animals"]
    },
    {
      id: "book-henry-mudge",
      title: "Henry and Mudge: The First Book",
      author: "Cynthia Rylant",
      series: "Henry and Mudge",
      arLevel: 2.7,
      interestLevel: "LG",
      themes: ["friendship", "animals"]
    },
    {
      id: "book-little-bear",
      title: "Little Bear",
      author: "Else Holmelund Minarik",
      series: "Little Bear",
      arLevel: 2.4,
      interestLevel: "LG",
      themes: ["animals", "family"]
    },
    {
      id: "book-magic-tree-house-dinosaurs",
      title: "Magic Tree House: Dinosaurs Before Dark",
      author: "Mary Pope Osborne",
      series: "Magic Tree House",
      arLevel: 2.6,
      interestLevel: "LG",
      themes: ["adventure", "dinosaurs"]
    }
  ],
  logs: [
    {
      id: "log-1",
      childId: "child-max",
      bookId: "book-biscuit",
      readDate: "2026-05-10",
      readingMode: "read_aloud",
      likedScore: 5,
      difficulty: "just_right",
      quizCompleted: false,
      notes: "Asked to read it again."
    },
    {
      id: "log-2",
      childId: "child-max",
      bookId: "book-pete-white-shoes",
      readDate: "2026-05-13",
      readingMode: "parent_assisted",
      likedScore: 5,
      difficulty: "a_bit_hard",
      quizCompleted: false
    },
    {
      id: "log-3",
      childId: "child-max",
      bookId: "book-brown-bear",
      readDate: "2026-05-17",
      readingMode: "independent",
      likedScore: 4,
      difficulty: "just_right",
      quizCompleted: false
    }
  ]
};
