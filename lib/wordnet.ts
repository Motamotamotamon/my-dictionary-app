import part_a from "@/data/wordnet/a.json";
import part_b from "@/data/wordnet/b.json";
import part_c from "@/data/wordnet/c.json";
import part_d from "@/data/wordnet/d.json";
import part_e from "@/data/wordnet/e.json";
import part_f from "@/data/wordnet/f.json";
import part_g from "@/data/wordnet/g.json";
import part_h from "@/data/wordnet/h.json";
import part_i from "@/data/wordnet/i.json";
import part_j from "@/data/wordnet/j.json";
import part_k from "@/data/wordnet/k.json";
import part_l from "@/data/wordnet/l.json";
import part_m from "@/data/wordnet/m.json";
import part_n from "@/data/wordnet/n.json";
import part_o from "@/data/wordnet/o.json";
import part_p from "@/data/wordnet/p.json";
import part_q from "@/data/wordnet/q.json";
import part_r from "@/data/wordnet/r.json";
import part_s from "@/data/wordnet/s.json";
import part_t from "@/data/wordnet/t.json";
import part_u from "@/data/wordnet/u.json";
import part_v from "@/data/wordnet/v.json";
import part_w from "@/data/wordnet/w.json";
import part_x from "@/data/wordnet/x.json";
import part_y from "@/data/wordnet/y.json";
import part_z from "@/data/wordnet/z.json";
import part_other from "@/data/wordnet/other.json";
import exceptions from "@/data/wordnet/verb-exceptions.json";
type Definitions = { definition: string; example?: string }[];
type Entry = Record<string, Definitions>;
const entries: Record<string, Entry> = Object.assign({}, part_a, part_b, part_c, part_d, part_e, part_f, part_g, part_h, part_i, part_j, part_k, part_l, part_m, part_n, part_o, part_p, part_q, part_r, part_s, part_t, part_u, part_v, part_w, part_x, part_y, part_z, part_other);
const irregular = exceptions as Record<string, string[]>;
export const corpusWords = Object.keys(entries);
export function corpusEntry(input: string) {
  let word = input;
  if (!Object.prototype.hasOwnProperty.call(entries, word)) {
    const [first, ...rest] = input.split(" ");
    if (!rest.length) return null;
    const bases = new Set<string>(Object.prototype.hasOwnProperty.call(irregular, first) ? irregular[first] : []);
    if (first.endsWith("ies")) bases.add(first.slice(0, -3) + "y");
    if (first.endsWith("s")) bases.add(first.slice(0, -1));
    if (first.endsWith("es")) bases.add(first.slice(0, -2));
    for (const suffix of ["ing", "ed"]) if (first.endsWith(suffix)) {
      const stem = first.slice(0, -suffix.length);
      bases.add(stem); bases.add(stem + "e");
      if (/(.)\1$/.test(stem)) bases.add(stem.slice(0, -1));
      if (suffix === "ed" && stem.endsWith("i")) bases.add(stem.slice(0, -1) + "y");
    }
    const candidates = [...bases].map(base => [base, ...rest].join(" "))
      .filter(candidate => Object.prototype.hasOwnProperty.call(entries, candidate) && entries[candidate].verb);
    if (candidates.length !== 1) return null;
    word = candidates[0];
  }
  const entry = entries[word];
  return { word, phonetics: [], source: "Princeton WordNet 3.0（英語辞書）", sourceUrls: ["https://wordnet.princeton.edu/", "/wordnet-license.txt"],
    meanings: Object.entries(entry).map(([partOfSpeech, definitions]) => ({ partOfSpeech, definitions })),
  };
}
