# Original bilingual learning notes

100 authored learning entries supplement the WordNet corpus and the existing
36 curated expressions. The TSV contains expression, Japanese gloss, original
English explanation, original example, and Japanese example translation.
These are selected learning senses, not exhaustive dictionary entries.
Dictionary search links are reference lookups, not attribution for copied text.

Run: python scripts/build_learning_idioms.py
The generated JSON contains canonical entries and bounded, explicit inflection
and pronoun aliases. Aliases do not count as new expressions.
Never turn arbitrary full sentences or unknown words into an assumed match.

Existing WordNet senses remain available when a learning note overlaps a corpus
entry. New entries use the existing search, meaning selection, speech, and save
paths, with Japanese text supplied directly rather than machine translated.
