// Now we represent the sounds in English using feature vectors.
// Sounds are labelled using their International Phonetic Alphabet (IPA) symbols.

// A feature vector is conceptually the same an embedding in machine learning,
// except each dimension represents a specific feature, instead of the dimensions being generated during training. 
// This isn't complete. Some of the IPA symbols common in english, like ɚ and ʔ, aren't represented in the pronunciation dictionary
let phonemes =
    "ɑ æ ʌ ɔ aʊ ə ɚ aɪ ɛ ɝ eɪ ɪ ɨ i oʊ ɔɪ ʊ u b tʃ d ð ɾ l̩ m̩ n̩ f ɡ h dʒ k l m n ŋ p ʔ ɹ s ʃ t θ v w ʍ j z ʒ".split(' ');

// Some vectors should be worth more than others. The difference between a plosive and continuant seems more significant than front vs back.
let properties = {
    // General
    "dipthong":    "- + - - +  - - +  - - +  - - - +  +  - - - -  - - - - - - - - - -  - - - - - - - - - - - - - - - - - -",
    "sonorant":    "+ + + + +  + + +  + + +  + + + +  +  + + - -  - - - + + + - - - -  - + + + - - - + - - - - - + - + - -",
    "voiced":      "+ + + + +  + + +  + + +  + + + +  +  + + + -  + + + + + + - + - +  - + + + + - - + - - - - + + - + + +",
    "rhotic":      "- - - - -  - + -  - + -  - - - -  -  - - - -  - - - - - - - - - -  - - - - - - - + - - - - - - - - - -",

    // Place of articulation
    // subcategories could be added https://en.wikipedia.org/wiki/Place_of_articulation
    "labial":      "- - - + +  - - -  - - -  - - - +  x  + + + -  - - - - + - + - - -  - - + - - + - - - - - - + + - - - -",
    "coronal":     "- - - - -  - - -  - - -  - - - -  -  - - - +  + + + + - + - - - +  - + - + - - - + + + + + - - - - + +",
    "dorsal":      "+ + + + +  + + +  + + +  + + + +  +  + + - -  - - - - - - - + + -  + - - - + - - - - - - - - + + + - -",

    // Consonant exclusive (airflow). Note that this is a single categorical variable "manner", which is one-hot encoded
    // In effect, this one-hot encoding adds more weight to the "manner" variable, since each dimension is equally weighted
    "plosive":     "- - - - -  - - -  - - -  - - - -  -  - - - -  - - - - - - - + - -  + - - - - - - - - - - - - - - - - -",
    "affricative": "- - - - -  - - -  - - -  - - - -  -  - - + -  + - - - - - - - - +  - - - - - + + - - - + - - - - - - -",
    "fricative":   "- - - - -  - - -  - - -  - - - -  -  - - - +  - + - - - - + - - -  - - - - - - - - + + - + + - + - + +",
    "nasal":       "- - - - -  - - -  - - -  - - - -  -  - - - -  - - - - + + - - - -  - - + + - - - - - - - - - - - - - -",

    // Vowel exclusive
    // In the case of ʃ and ʒ, these are only partially round
    "round":       "- - - + +  - - -  - - -  - - - +  x  + + X X  X X X X X X X X X X  X X X X X X X X X + X X X + + X X +",
    "high":        "- - - - x  - - x  - - x  + + + x  x  + + X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X",
    "low":         "+ + - - x  - - x  - - -  - - - -  -  - - X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X",
    "back":        "+ - + + +  + + x  - + -  - + - +  x  + + X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X",
    "tense":       "+ - - + +  r r +  - + +  - r + +  +  - + X X  X X X X X X X X X X  X X X X X X X X X X X X X X X X X X",
    
    // These would duplicate other fields, so are omitted
    // "consonant": "- - - - -  - - -  - - -  - - - -  -  - - + +  + + + + + + + + - +  + + + + + + + + + + + + + + + + + +",
    // "vowel":     "+ + + + +  + + +  + + +  + + + +  +  + + - -  - - - - - - - - - -  - - - - - - - - - - - - - - - - - -",
    };

// Remove the spaces from properties, since they're only there to help code legibility and interfere with comparing vectors
properties = Object.fromEntries(
    Object.entries(properties).map(
        (x,y)=>[x[0], x[1].replace(/ /g, '')]
    )
) 

// Flip properties to be a vector for each phoneme
let vectors = phonemes.reduce((dict, phoneme, i) => {
    dict[phoneme] = Object.values(properties).map(x=>x[i]);
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

IPADescription = {
    "ɑ":  "a as in calm",
    "æ":  "a as in bat",
    "ʌ":  "u as in bluff",
    "ɔ":  "a as in all",
    "aʊ": "ou as in bout",
    "ə":  "a as in about",
    "ɚ":  "er as in letter",
    "aɪ": "i as in bite",
    "ɛ":  "e as in bet",
    "ɝ":  "ir as in mirth",
    "eɪ": "a as in face",
    "ɪ":  "i as in bit",
    "ɨ":  "u as in rude",
    "i":  "ea as in beat",
    "oʊ": "oa as in boat",
    "ɔɪ": "oy as in boy",
    "ʊ":  "oo as in book",
    "u":  "oo as in boot",
    // "ʉ":  "u as in dude", // Unused
    "b":  "b as in buy",
    "tʃ": "ch as in chain",
    "d":  "d as in dog",
    "ð":  "th as in those",
    "ɾ":  "r as in butter",
    "l̩":  "l as in bottle",
    "m̩":  "m as in rhythm",
    "n̩":  "n as in button",
    "f":  "f as in fight",
    "ɡ":  "g as in goose",
    "h":  "h as in hat",
    "dʒ": "j as in jury",
    "k":  "k as in kite",
    "l":  "l as in lie",
    "m":  "m as in my",
    "n":  "n as in night",
    "ŋ":  "ng as in sing",
    "p":  "p as in pen",
    "ʔ":  "the pause in uh-oh",
    "ɹ":  "r as in rye",
    "s":  "s as in sigh",
    "ʃ":  "sh as in shine",
    "t":  "t as in tie",
    "θ":  "th as in thick",
    "v":  "v as in vote",
    "w":  "w as in wise",
    "ʍ":  "wh as in why",
    "j":  "y as in yacht",
    "z":  "z as in zoo",
    "ʒ":  "s as in pleasure"
}

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
    // "UX":  "ʉ",   // dude Unused
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
        const word = line[0];
        const phonemesAndStresses = line.slice(1);
        const stress = phonemesAndStresses.map(function (x) {
            let lastChar = x.at(-1);
            return "012".includes(lastChar) ? lastChar : "-";
        });

        const phonemes = phonemesAndStresses
            .map(x=>x.replace(/[012]$/,''))
            .map(x=>arpabetToIP[x]);

        // These get joined together so the stress of different words can be compared for equality quickly
        const stressSimple = stress.filter(x=> x != "-").join('');

        const rhyme = phonemes.slice(stress.lastIndexOf("1")).join('');

        return {
            "word": word,
            "phonemes": phonemes,
            "stress": stress.join(''), 
            "stressSimple": stressSimple,
            "rhyme": rhyme,
        }
    })



    if (!res.ok) {
        throw new Error(`Failed to load word list: ${response.status} ${response.statusText}`);
    }
}