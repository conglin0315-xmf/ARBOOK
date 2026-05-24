import type { Book } from "./types";
import generatedArCatalog from "./generatedArCatalog.json";

export type LocalCatalogBook = Book & {
  sourceName: string;
  sourceUrl?: string;
  arRangeMin: number;
  arRangeMax: number;
  verificationStatus?: string;
};

export const mobilePublicLibraryBl01To09: LocalCatalogBook[] = [
  {
    id: "mpl-001-rosies-walk",
    title: "Rosie's Walk",
    author: "Pat Hutchins",
    themes: ["animals", "farm", "funny"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  },
  {
    id: "mpl-001-pigeon-wants-a-puppy",
    title: "The Pigeon Wants a Puppy!",
    author: "Mo Willems",
    series: "Pigeon",
    themes: ["funny", "animals", "dialog"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  },
  {
    id: "mpl-001-little-critter-storybook",
    title: "Little Critter Storybook Collection",
    author: "Mercer Mayer",
    series: "Little Critter",
    themes: ["family", "funny", "school"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  },
  {
    id: "mpl-001-itchy-itchy-chicken-pox",
    title: "Itchy, Itchy Chicken Pox",
    author: "Grace Maccarone",
    themes: ["family", "health", "funny"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  },
  {
    id: "mpl-001-i-lost-my-tooth",
    title: "I Lost My Tooth!",
    author: "Mo Willems",
    series: "Unlimited Squirrels",
    themes: ["funny", "friendship", "comic"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  },
  {
    id: "mpl-001-eye-book",
    title: "The Eye Book",
    author: "Dr. Seuss",
    series: "Bright and Early Books",
    themes: ["rhyming", "concepts", "funny"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  },
  {
    id: "mpl-001-i-am-going",
    title: "I Am Going!",
    author: "Mo Willems",
    series: "Elephant & Piggie",
    themes: ["funny", "friendship", "dialog"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  },
  {
    id: "mpl-001-david-goes-to-school",
    title: "David Goes to School",
    author: "David Shannon",
    series: "David",
    themes: ["school", "funny", "behavior"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  },
  {
    id: "mpl-001-biscuit",
    title: "Biscuit",
    author: "Alyssa Satin Capucilli",
    series: "Biscuit",
    themes: ["animals", "friendship", "gentle"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B316%5D=316",
    arRangeMin: 0.1,
    arRangeMax: 0.9
  }
];

export const mobilePublicLibraryBl10To19: LocalCatalogBook[] = [
  {
    id: "mpl-wacky-wednesday",
    title: "Wacky Wednesday",
    author: "Dr. Seuss",
    series: "Beginner Books",
    themes: ["funny", "school", "rhyming"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-ten-apples-up-on-top",
    title: "Ten Apples Up On Top!",
    author: "Dr. Seuss",
    series: "Beginner Books",
    themes: ["funny", "counting", "animals"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-sheep-in-a-jeep",
    title: "Sheep in a Jeep",
    author: "Nancy E. Shaw",
    series: "Sheep",
    themes: ["funny", "animals", "rhyming"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-pigeon-wants-a-puppy",
    title: "The Pigeon Wants a Puppy!",
    author: "Mo Willems",
    series: "Pigeon",
    themes: ["funny", "animals", "dialog"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-pete-saves-christmas",
    title: "Pete the Cat Saves Christmas",
    author: "Eric Litwin",
    series: "Pete the Cat",
    themes: ["funny", "music", "holiday"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-one-fish-two-fish",
    title: "One Fish Two Fish Red Fish Blue Fish",
    author: "Dr. Seuss",
    series: "Beginner Books",
    themes: ["funny", "rhyming", "animals"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-mr-brown-can-moo",
    title: "Mr. Brown Can Moo! Can You?",
    author: "Dr. Seuss",
    series: "Bright and Early Books",
    themes: ["funny", "sounds", "rhyming"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-hop-on-pop",
    title: "Hop on Pop",
    author: "Dr. Seuss",
    series: "Beginner Books",
    themes: ["funny", "rhyming", "family"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-green-eggs-and-ham",
    title: "Green Eggs and Ham",
    author: "Dr. Seuss",
    series: "Beginner Books",
    themes: ["funny", "food", "rhyming"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-go-dog-go",
    title: "Go, Dog. Go!",
    author: "P. D. Eastman",
    series: "Beginner Books",
    themes: ["animals", "funny", "vehicles"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-super-fly-guy",
    title: "Super Fly Guy",
    author: "Tedd Arnold",
    series: "Fly Guy",
    themes: ["funny", "animals", "school"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-i-am-going",
    title: "I Am Going!",
    author: "Mo Willems",
    series: "Elephant & Piggie",
    themes: ["funny", "friendship", "dialog"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-clifford-big-red-dog",
    title: "Clifford the Big Red Dog",
    author: "Norman Bridwell",
    series: "Clifford",
    themes: ["animals", "friendship", "family"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  },
  {
    id: "mpl-brown-bear",
    title: "Brown Bear, Brown Bear, What Do You See?",
    author: "Bill Martin Jr.",
    themes: ["animals", "colors", "repetition"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B317%5D=317",
    arRangeMin: 1.0,
    arRangeMax: 1.9
  }
];

export const mobilePublicLibraryBl20To29: LocalCatalogBook[] = [
  {
    id: "mpl-10-great-day-for-up",
    title: "Great Day for Up!",
    author: "Dr. Seuss",
    series: "Bright and Early Books",
    themes: ["funny", "rhyming", "concepts"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-grace-for-president",
    title: "Grace for President",
    author: "Kelly DiPucchio",
    themes: ["school", "leadership", "friendship"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-go-otto-go",
    title: "Go, Otto, Go!",
    author: "David Milgrim",
    series: "The Adventures of Otto",
    themes: ["funny", "friendship", "robots"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-go-dog-go",
    title: "Go, Dog. Go!",
    author: "P. D. Eastman",
    series: "Beginner Books",
    themes: ["animals", "funny", "vehicles"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-gingerbread-girl",
    title: "The Gingerbread Girl",
    author: "Lisa Campbell Ernst",
    themes: ["funny", "folk tales", "adventure"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-foot-book",
    title: "The Foot Book",
    author: "Dr. Seuss",
    series: "Bright and Early Books",
    themes: ["funny", "rhyming", "opposites"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-super-fly-guy",
    title: "Super Fly Guy",
    author: "Tedd Arnold",
    series: "Fly Guy",
    themes: ["funny", "animals", "school"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-first-day-jitters",
    title: "First Day Jitters",
    author: "Julie Danneberg",
    series: "Jitters",
    themes: ["school", "funny", "feelings"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-dog-man",
    title: "Dog Man",
    author: "Dav Pilkey",
    series: "Dog Man",
    themes: ["funny", "animals", "comics"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-diary-of-a-worm",
    title: "Diary of a Worm",
    author: "Doreen Cronin",
    series: "Diary of...",
    themes: ["funny", "animals", "school"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-click-clack-moo",
    title: "Click, Clack, Moo",
    author: "Doreen Cronin",
    series: "Click, Clack",
    themes: ["funny", "animals", "farm"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-cat-in-the-hat",
    title: "The Cat in the Hat",
    author: "Dr. Seuss",
    series: "Beginner Books",
    themes: ["funny", "rhyming", "family"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-bad-seed",
    title: "The Bad Seed",
    author: "Jory John",
    series: "Food Group",
    themes: ["funny", "feelings", "friendship"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  },
  {
    id: "mpl-10-bad-kitty",
    title: "Bad Kitty",
    author: "Nick Bruel",
    series: "Bad Kitty",
    themes: ["funny", "animals", "alphabet"],
    interestLevel: "LG",
    sourceName: "Mobile Public Library AR list",
    sourceUrl: "https://www.mobilepubliclibrary.org/ar/book-list?combine=&field_br_category_target_id%5B318%5D=318",
    arRangeMin: 2.0,
    arRangeMax: 2.9
  }
];

type GeneratedArCatalogRow = {
  id: string;
  title: string;
  author: string;
  arLevel: number;
  arPoints?: number | null;
  sourceName: string;
  sourceUrl?: string | null;
  verificationStatus?: string | null;
};

export const generatedWorkbookArCatalog: LocalCatalogBook[] = (generatedArCatalog as GeneratedArCatalogRow[]).map((book) => ({
  id: book.id,
  title: book.title,
  author: book.author,
  arLevel: book.arLevel,
  arPoints: book.arPoints ?? undefined,
  themes: [],
  sourceName: book.sourceName,
  sourceUrl: book.sourceUrl ?? undefined,
  arRangeMin: book.arLevel,
  arRangeMax: book.arLevel,
  verificationStatus: book.verificationStatus ?? undefined
}));

export const localArCatalog = [...mobilePublicLibraryBl01To09, ...mobilePublicLibraryBl10To19, ...mobilePublicLibraryBl20To29, ...generatedWorkbookArCatalog];
