import { prisma } from "@/lib/prisma";
import { defaultBooks, type Book } from "@/lib/books";
// Book metadata uses SavedItem's existing generic item type; word-list APIs only read type=word.
// SavedItem.book holds a stable ID, never the editable display name.
export async function listBooks(): Promise<Book[]> {
  const [metadata, legacy] = await Promise.all([
    prisma.savedItem.findMany({ where: { type: "book" }, orderBy: { id: "desc" } }),
    prisma.savedItem.findMany({ where: { type: "word", book: { not: null } }, distinct: ["book"], select: { book: true } }),
  ]);
  const map = new Map(defaultBooks.map(book => [book.id, { ...book }]));
  for (const item of legacy) if (item.book && !map.has(item.book)) map.set(item.book, { id: item.book, name: item.book });
  const seen = new Set<string>();
  for (const item of metadata) if (!seen.has(item.content)) {
    map.set(item.content, { id: item.content, name: item.jp || item.content }); seen.add(item.content);
  }
  return [...map.values()];
}
export async function bookExists(id: unknown) {
  return typeof id === "string" && (await listBooks()).some(book => book.id === id);
}
