import type { Item, Tag } from '../models';

const tagMovies: Tag = { id: 'tag-movies', name: 'movies' };
const tagToWatch: Tag = { id: 'tag-to-watch', name: 'to-watch' };
const tagArchitecture: Tag = { id: 'tag-architecture', name: 'architecture' };
const tagReadLater: Tag = { id: 'tag-read-later', name: 'read-later' };
const tagProductIdea: Tag = { id: 'tag-product-idea', name: 'product-idea' };
const tagShopping: Tag = { id: 'tag-shopping', name: 'shopping' };
const tagTravel: Tag = { id: 'tag-travel', name: 'travel' };
const tagFood: Tag = { id: 'tag-food', name: 'food' };
const tagToVisit: Tag = { id: 'tag-to-visit', name: 'to-visit' };

export const mockItems: Item[] = [
  // 1. Screenshot of a movie recommendation
  {
    id: 'item-1',
    title: 'Everything Everywhere All At Once — recommended by Jess',
    type: 'movie',
    category: 'entertainment',
    createdAt: '2026-08-02T19:41:00.000Z',
    updatedAt: '2026-08-02T19:41:00.000Z',
    captureType: 'screenshot',
    sourceName: 'iMessage',
    mediaUri: 'file:///var/mobile/screenshots/IMG_4821.png',
    originalText:
      "Jess: you HAVE to watch Everything Everywhere All At Once, it's on Netflix now. trust me",
    summary:
      'Jess recommended the movie "Everything Everywhere All At Once", now streaming on Netflix.',
    relevantInfo: [
      { label: 'Title', value: 'Everything Everywhere All At Once' },
      { label: 'Streaming on', value: 'Netflix' },
      { label: 'Recommended by', value: 'Jess' },
    ],
    tags: [tagMovies, tagToWatch],
    entities: ['Everything Everywhere All At Once', 'Jess', 'Netflix'],
    whySaved: 'Want to watch this weekend',
  },

  // 2. An article
  {
    id: 'item-2',
    title: 'The Case for Local-First Software',
    type: 'article',
    category: 'software engineering',
    createdAt: '2026-07-28T09:12:00.000Z',
    updatedAt: '2026-07-28T09:12:00.000Z',
    captureType: 'url',
    sourceName: 'inkandswitch.com',
    sourceUrl: 'https://www.inkandswitch.com/local-first/',
    summary:
      'Argues for "local-first" software that keeps data on-device for speed and ownership while still supporting real-time collaboration.',
    relevantInfo: [
      { label: 'Author', value: 'Ink & Switch research lab' },
      { label: 'Core idea', value: 'Combine offline-first storage with CRDTs for multi-device sync' },
    ],
    tags: [tagArchitecture, tagReadLater],
    entities: ['Ink & Switch'],
    whySaved: 'Relevant to how Commonplace should sync data across devices',
  },

  // 3. A manually entered idea
  {
    id: 'item-3',
    title: 'Weekly "forgotten items" digest',
    type: 'idea',
    category: 'product idea',
    createdAt: '2026-08-05T21:03:00.000Z',
    updatedAt: '2026-08-05T21:03:00.000Z',
    captureType: 'manual',
    originalText:
      "Send a weekly email that resurfaces 3-5 saved items the user hasn't opened in a while, picked by relevance to what they've saved recently.",
    tags: [tagProductIdea],
    whySaved: 'Came up during a walk, want to prototype this for Commonplace v2',
  },

  // 4. A product screenshot
  {
    id: 'item-4',
    title: 'AeroPress Go — camping coffee maker',
    type: 'product',
    category: 'shopping',
    createdAt: '2026-08-04T14:27:00.000Z',
    updatedAt: '2026-08-04T14:27:00.000Z',
    captureType: 'screenshot',
    sourceName: 'Instagram',
    mediaUri: 'file:///var/mobile/screenshots/IMG_4903.png',
    originalText:
      'AeroPress Go Travel Coffee Press — $39.95 — compact all-in-one coffee maker for travel and camping',
    summary: 'Product listing for the AeroPress Go, a compact travel coffee maker.',
    relevantInfo: [
      { label: 'Product', value: 'AeroPress Go Travel Coffee Press' },
      { label: 'Price', value: '$39.95' },
    ],
    tags: [tagShopping, tagTravel],
    entities: ['AeroPress'],
    whySaved: 'Want to buy before our camping trip',
  },

  // 5. A restaurant/place recommendation
  {
    id: 'item-5',
    title: 'Café Kitsuné — recommended for brunch',
    type: 'place',
    category: 'restaurant',
    createdAt: '2026-08-06T11:58:00.000Z',
    updatedAt: '2026-08-06T11:58:00.000Z',
    captureType: 'text',
    sourceName: 'Text from Maria',
    originalText:
      "Maria: you need to try Café Kitsuné if you're near Nolita, their matcha latte and brunch is amazing",
    summary: 'Maria recommended Café Kitsuné in Nolita for brunch and matcha lattes.',
    relevantInfo: [
      { label: 'Name', value: 'Café Kitsuné' },
      { label: 'Neighborhood', value: 'Nolita, New York' },
      { label: 'Recommended for', value: 'Brunch, matcha latte' },
    ],
    tags: [tagFood, tagToVisit],
    entities: ['Café Kitsuné', 'Maria'],
    whySaved: "Try next time we're downtown",
  },
];
