# Derived WordNet multiword dictionary

Source: Princeton WordNet 3.0, distributed in the NLTK data archive:
https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip

Copyright 2006 Princeton University. Full redistribution terms are in LICENSE.txt.
This is a derived subset, not a complete or current English dictionary. It includes
multiword verb, adverb and adjective entries (including compounds), not every idiom.
Noun compounds and proper names are excluded. Original sense order is retained.
Glosses are the original English definitions; Japanese translations are supplied
separately by the application's existing translation service and may be imperfect.
Examples shared with synonyms are omitted unless they contain the exact expression.
No example is generated to fill a missing field.

Regenerate with:
`python scripts/build_wordnet_phrases.py /path/to/wordnet.zip`
The manifest records the source archive SHA-256 and expression/sense totals.
The small verb-exceptions.json subset is extracted from verb.exc for first-word
inflection resolution. The full source archive is not required at runtime.

Citation: Princeton University, WordNet 3.0; George A. Miller (1995),
WordNet: A Lexical Database for English, Communications of the ACM 38(11):39–41.
