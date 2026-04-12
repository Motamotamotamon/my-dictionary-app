"use client";

type Item = {
  id:number
  content:string
  meanings?:any[]
  phonetic?:string
  book?:string
};

type Props = {
  item: Item;
  open: {[key:string]:boolean};
  toggle: (word:string)=>void;
  speak: (word:string)=>void;
  goDetail: (word:string)=>void;
  removeWord: (word:string)=>void;
  updateBook: (word:string,book:string)=>void;
  translations: {[key:string]: string};
};

export default function VocabularyCard({
  item,
  open,
  toggle,
  speak,
  goDetail,
  removeWord,
  updateBook,
  translations
}: Props){

  return(

    <div className="border rounded p-4 mb-3 bg-white shadow-sm">

      <div className="flex justify-between items-center">

        <button
          onClick={()=>goDetail(item.content)}
          className="text-xl font-bold text-left hover:underline"
        >
          📖 {item.content}
        </button>

        <div className="flex items-center gap-2">

          {open[item.content] && (
            <button onClick={()=>speak(item.content)} className="text-lg">
              🔊
            </button>
          )}

          <button
            onClick={()=>toggle(item.content)}
            className="text-lg"
          >
            {open[item.content] ? "▲" : "▼"}
          </button>

        </div>

      </div>

      {open[item.content] && (

        <div className="mt-3">

          {item.phonetic && (
            <p className="text-gray-500">{item.phonetic}</p>
          )}

          {item.meanings?.map((m:any,i:number)=>{

            const posJP = {
              noun:"名詞",
              verb:"動詞",
              adjective:"形容詞",
              adverb:"副詞"
            }[m.partOfSpeech] || m.partOfSpeech;

            return(

              <div key={i} className="mt-3">

                <p className="font-semibold">{posJP}</p>

                <ul className="list-disc ml-5">

                  {m.definitions.slice(0,2).map((d:any,j:number)=>{

                    const key = `${item.content}-${i}-${j}`;

                    return(

                      <li key={j}>
                        {d.definition}
                        <div className="text-gray-600 text-sm">
                          {translations[key]}
                        </div>
                      </li>

                    );

                  })}

                </ul>

              </div>

            );

          })}

        </div>

      )}

      <div className="flex gap-3 mt-4">

        <button
          onClick={()=>removeWord(item.content)}
          className="text-red-600 font-semibold hover:underline"
        >
          🗑 Remove
        </button>

        <button
          onClick={()=>updateBook(item.content,"Book1")}
          className="bg-blue-100 px-2 py-1 rounded text-sm"
        >
          📘 Book1
        </button>

        <button
          onClick={()=>updateBook(item.content,"Book2")}
          className="bg-green-100 px-2 py-1 rounded text-sm"
        >
          📗 Book2
        </button>

      </div>

    </div>

  );
}