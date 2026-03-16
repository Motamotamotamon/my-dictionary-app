"use client";
import Link from "next/link";
type Props = {
  word: string;
  definition?: string;
  partOfSpeech?: string;
  jp?: string;
  onRemove?: () => void;
};

export default function WordCard({
  word,
  definition,
  partOfSpeech,
  jp,
  onRemove
}:Props){

  const speak = () => {

    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);

  };

  return (

    <div className="border rounded-lg p-4 shadow-sm space-y-2">

      <div className="flex justify-between items-center">

        <Link href={`/?word=${word}`}>

  <h3 className="text-xl font-semibold hover:underline cursor-pointer">
    {word}
  </h3>

</Link>

        <button
          onClick={speak}
          className="text-xl"
        >
          🔊
        </button>

      </div>

      {jp && (
        <p className="text-blue-600 font-medium">
          🇯🇵 {jp}
        </p>
      )}

      {partOfSpeech && (
        <p className="text-sm text-gray-500">
          {partOfSpeech}
        </p>
      )}

      {definition && (
        <p>
          {definition}
        </p>
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          className="text-red-500 text-sm"
        >
          Remove
        </button>
      )}

    </div>

  );
}