import Dexie from 'dexie';

export const db = new Dexie('PersonalAssistant');

db.version(1).stores({
  todos: '++id, title, done, dueDate, createdAt',
  events: '++id, title, date, time, description',
  notes: '++id, title, content, updatedAt',
  journal: '++id, date, content, mood',
  goals: '++id, title, description, progress, deadline, done',
  habits: '++id, title, frequency, completedDates',
  finance: '++id, type, amount, category, description, date',
  bookmarks: '++id, title, url, tags',
  wiki: '++id, title, content, updatedAt',
  learning: '++id, title, url, type, progress, notes',
  entertainment: '++id, title, type, status, rating, notes',
});
