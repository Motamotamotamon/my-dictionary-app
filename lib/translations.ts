// Browser-memory cache: bounded, only successful translations, never saved vocabulary.
const cache = new Map<string, string>();
export function createTranslator(request: (url: string) => Promise<any>, active: () => boolean) {
  const pending = new Map<string, Promise<string | null>>();
  const tasks: (() => Promise<void>)[] = [];
  let running = 0;
  const pump = () => {
    while (running < 3 && tasks.length) {
      const task = tasks.shift()!;
      running++;
      void task().finally(() => { running--; pump(); });
    }
  };
  return (text: string): Promise<string | null> => {
    if (!active()) return Promise.resolve(null);
    if (cache.has(text)) return Promise.resolve(cache.get(text)!);
    if (pending.has(text)) return pending.get(text)!;
    const promise = new Promise<string | null>(resolve => {
      tasks.push(async () => {
        if (!active()) { resolve(null); return; }
        try {
          const json = await request(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ja`);
          const value = json?.responseData?.translatedText;
          if (active() && json?.responseStatus === 200 && typeof value === "string") {
            if (cache.size >= 256) cache.delete(cache.keys().next().value!);
            cache.set(text, value); resolve(value);
          } else resolve(null);
        } catch { resolve(null); }
      });
      pump();
    });
    pending.set(text, promise);
    return promise;
  };
}
