// Now we represent the sounds in English using feature vectors.
// Sounds are labelled using their International Phonetic Alphabet (IPA) symbols.

// A feature vector is conceptually the same an embedding in machine learning,
// except each dimension represents a specific feature, instead of the dimensions being generated during training. 
// This isn't complete. Some of the IPA symbols common in english, like ɚ and ʔ, aren't represented in the pronunciation dictionary
let phonemes =
    "ɑ æ ʌ ɔ aʊ ə ɚ aɪ ɛ ɝ eɪ ɪ ɨ i oʊ ɔɪ ʊ u ʉ b tʃ d ð ɾ l̩ m̩ n̩ f ɡ h dʒ k l m n ŋ p ʔ ɹ s ʃ t θ v w ʍ j z ʒ".split(' ');

// Some vectors should be worth more than others. The difference between a plosive and continuant seems more significant than front vs back.
let properties = [
    // General
    "- + - - +  - - +  - - +  - - - +  +  - - - - -  - - - - - - - - - -  - - - - - - - - - - - - - - - - - -", // dipthong
    "+ + + + +  + + +  + + +  + + + +  +  + + + - -  - - - + + + - - - -  - + + + - - - + - - - - - + - + - -", // sonorant
    "+ + + + +  + + +  + + +  + + + +  +  + + + + -  + + + + + + - + - +  - + + + + - - + - - - + + + - + + +", // voice
    "- - - - -  - + -  - + -  - - - -  -  - - - - -  - - - - - - - - - -  - - - - - - - + - - - - - - - - - -", // rhotic

    // Place of articulation
    // subcategoriest could be added https://en.wikipedia.org/wiki/Place_of_articulation
    "- - - + +  - - -  - - -  - - - +  x  + + + + -  - - - - + - + - - -  - - + - - + - - - - - - + - - - - -", // labial
    "- - - - -  - - -  - - -  - - - -  -  - - - - +  + + + + - + - - - +  - + - + - - - + + + + + - - - - + +", // coronal
    "+ + + + +  + + +  + + +  + + + +  +  + + + - -  - - - - - - - + + -  + - - - + - - - - - - - - + + + - -", // dorsal

    // // Consonant exclusive (airflow)
    // "- - - - -  - - -  - - -  - - - -  -  - - - - +  - - - - - - - - - +  - - - - - - - - - - - - - - - - - -", // plosive
    // "- - - - -  - - -  - - -  - - - -  -  - - - + -  + - - - - - - + - +  + - - - - + + - - - + - - - - - - -", // affricative
    "- - - - -  - - -  - - -  - - - -  -  - - - p a  p - - - - - - p - a  p - - - - p p - - - p - - - - - - -", // plosive or affricative. Combined since they're mutually exclusive
    "- - - - -  - - -  - - -  - - - -  -  - - - - +  - + - - - - + - - -  - - - - - - - - + + - + + - + - + +", // fricative
    "- - - - -  - - -  - - -  - - - -  -  - - - - -  - - - - + + - - - -  - - + + - - - - - - - - - - - - - -", // nasal

    // Vowel exclusive
    "- - - + +  - - -  - - -  - - - +  x  + + + X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X", // round
    "- - - - x  - - x  - - x  + + + x  x  + + + X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X", // high
    "+ + - - x  - - x  - - -  - - - -  -  - - - X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X", // low
    "+ - + + +  + + x  - + -  - + - +  x  + + + X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X", // back
    "+ - - + +  r r +  - + +  - r + +  +  - + + X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X", // tense (r for reduced)
    

    // These would duplicate other fields, so are omitted
    // "- - - - -  - - -  - - -  - - - -  -  - - - + +  + + + + + + + + - +  + + + + + + + + + + + + + + + + + +", // consonantal
    // "+ + + + +  + + +  + + +  + + + +  +  + + + - -  - - - - - - - - - -  - - - - - - - - - - - - - - - - - -", // vowel
    ].map(x=>x.replace(/ /g,''));

// Flip properties to be a vector for each phoneme
let vectors = phonemes.reduce((dict, phoneme, i) => {
    dict[phoneme] = properties.map(x=>x[i]);
    return dict;
}, {});

// We're going to be doing a lot of comparisons between phonemes.
// Since there are only 49 * 49 combinations, lets cache the results in a lookup table
const lookup = Object.fromEntries(Object.entries(vectors).map(function ([IPA, vector1]) {
    let similarities = Object.fromEntries(Object.entries(vectors).map(function ([IPA, vector2]) {
        return [IPA, comparePhonemes(vector1, vector2)]
    }))
    return [IPA, similarities]
}))


arpabetToIP = {
    "AA":  "ɑ",   // balm, bot
    "AE":  "æ",   // bat
    "AH":  "ʌ",   // butt
    "AO":  "ɔ",   // bought
    "AW":  "aʊ",  // bout
    "AX":  "ə",   // about
    "AXR": "ɚ",   // letter
    "AY":  "aɪ",  // bite
    "EH":  "ɛ",   // bet
    "ER":  "ɝ",   // bird
    "EY":  "eɪ",  // bait
    "IH":  "ɪ",   // bit
    "IX":  "ɨ",   // roses, rabbit
    "IY":  "i",   // beat
    "OW":  "oʊ",  // boat
    "OY":  "ɔɪ",  // boy
    "UH":  "ʊ",   // book
    "UW":  "u",   // boot
    "UX":  "ʉ",   // dude
    "B":   "b",   // buy
    "CH":  "tʃ",  // China
    "D":   "d",   // die
    "DH":  "ð",   // thy
    "DX":  "ɾ",   // butter
    "EL":  "l̩",   // bottle
    "EM":  "m̩",   // rhythm
    "EN":  "n̩",   // button
    "F":   "f",   // fight
    "G":   "ɡ",   // guy
    "H":   "h",   // high
    "HH":  "h",   // high
    "JH":  "dʒ",  // jive
    "K":   "k",   // kite
    "L":   "l",   // lie
    "M":   "m",   // my
    "N":   "n",   // nigh
    "NX":  "ŋ",   // sing
    "NG":  "ŋ",   // sing
    "P":   "p",   // pie
    "Q":   "ʔ",   // uh-oh
    "R":   "ɹ",   // rye
    "S":   "s",   // sigh
    "SH":  "ʃ",   // shy
    "T":   "t",   // tie
    "TH":  "θ",   // thigh
    "V":   "v",   // vie
    "W":   "w",   // wise
    "WH":  "ʍ",   // why
    "Y":   "j",   // yacht
    "Z":   "z",   // zoo
    "ZH":  "ʒ",   // pleasure
}
// TODO plot a histogram of phoneme similarities

phonology = {
    "words": null,
}

async function loadWords() {
    const res = await fetch("cmudict.small.txt");
    const text = await res.text();
    lines = text.split('\n');

    if (lines.at(-1) == "") {
        lines.pop()
    } 

    phonology.words = lines.map(function (line) {
        line = line.split(" ");
        word = line[0];
        phonemesAndStresses = line.slice(1);
        stress = phonemesAndStresses.map(function (x) {
            let lastChar = x.at(-1);
            return "012".includes(lastChar) ? lastChar : "-";
        });

        phonemes = phonemesAndStresses
            .map(x=>x.replace(/[012]$/,''))
            .map(x=>arpabetToIP[x]);

        // These get joined together so the stress of different words can be compared for equality quickly
        stressSimple = stress.filter(x=> x != "-").join('')

        return {
            "word": word,
            "phonemes": phonemes,
            "stress": stress, 
            "stressSimple": stressSimple
        }
    })



    if (!res.ok) {
        throw new Error(`Failed to load word list: ${response.status} ${response.statusText}`);
    }
}