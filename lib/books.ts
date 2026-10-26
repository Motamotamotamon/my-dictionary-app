export type Book = { id: string; name: string };
export const defaultBooks: Book[] = [{ id: "Book1", name: "Book1" }, { id: "Book2", name: "Book2" }, { id: "Unsorted", name: "未分類" }];
export const validBookName = (name: unknown): name is string => typeof name === "string" && name.trim().length > 0 && name.trim().length <= 60;
