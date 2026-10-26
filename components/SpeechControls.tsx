"use client";
import { useEffect, useRef, useState } from "react";
let stopActive: (() => void) | null = null;

export default function SpeechControls({ text, label = "英語" }: { text: string; label?: string }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    setSupported("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => { stopRef.current?.(); };
  }, [text]);
  const play = (rate: number) => {
    if (!supported || !text.trim()) return;
    stopActive?.();
    setError("");
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.lang = "en-US";
    utterance.rate = rate;
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.replace("_", "-").toLowerCase() === "en-us")
      || voices.find(v => /^en[-_]/i.test(v.lang));
    if (voice) utterance.voice = voice;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setPlaying(false);
      if (utteranceRef.current === utterance) utteranceRef.current = null;
      if (stopActive === stop) stopActive = null;
      if (stopRef.current === stop) stopRef.current = null;
    };
    const stop = () => {
      if (finished) return;
      finish();
      synth.cancel();
    };
    utterance.onend = finish;
    utterance.onerror = event => {
      if (finished) return;
      finish();
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setError("読み上げできませんでした。端末の音量・英語音声を確認して再試行してください。");
      }
    };
    stopActive = stop;
    stopRef.current = stop;
    setPlaying(true);
    try { synth.cancel(); synth.speak(utterance); }
    catch { stop(); setError("読み上げできませんでした。もう一度お試しください。"); }
  };
  if (supported === false) return <span className="text-sm text-gray-500">この環境は読み上げに対応していません。</span>;
  return <span className="inline-flex flex-wrap items-center gap-2 text-sm font-normal">
    <button type="button" disabled={!supported || !text.trim()} onClick={() => play(1)} aria-label={`${label}を読み上げる`} className="border rounded px-2 py-1">🔊 再生</button>
    <button type="button" disabled={!supported || !text.trim()} onClick={() => play(0.75)} aria-label={`${label}をゆっくり読み上げる`} className="border rounded px-2 py-1">ゆっくり</button>
    {playing && <button type="button" onClick={() => stopRef.current?.()} aria-label={`${label}の読み上げを停止`} className="border rounded px-2 py-1">■ 停止</button>}
    {error && <span role="alert" className="text-red-600">{error}</span>}
  </span>;
}
