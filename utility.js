
/**
 * @param {Object} x - An object containing a glove vector
 * @param {Object} y - An object containing a glove vector
 */
function cosineSimilarity(x,y) {
    const vector1 = x.vector;
    const vector2 = y.vector;
    let acc = 0;
    for (let i = 0; i < 25; i++) {
        acc += vector1[i] * vector2[i];
    }
    return acc / (x.magnitude * y.magnitude);
}

function comparePhonemes (x, y) {
    // Phoneme vectors have one of three values. + for present, - for absent, and X for unapplicable.
    // This calculates a vector of where two phonemes are equal, then returns the average of that vector
    // to give a similarity between 0 and 1
    // p and b have a similarity of .92, whereas k and aɪ are only .5
    return average(x.map((_,i) => x[i] == y[i] ? 1 : 0))
}

function magnitude (x) {
    return Math.sqrt(x.reduce((x,a) => x + a, 0))
}

function average (x) {
    return x.reduce((x,a) => x + a) / x.length
}


function formatNumber(x) {
    // Round down so non-identical words never get a similarity of 1
    return Math.floor(x * 100_000) / 100_000
}

function lookupWord (target) {
    // TODO replace this with binary search
    return phonology.words.filter(x=>x.word==target)[0];
}

function compareWords (word1, word2) {
    // TODO compare average with harmonic mean
    const range = -1 * Math.min(word1.phonemes.length, word2.phonemes.length);
    const phonemes1 = word1.phonemes.slice(range);
    const phonemes2 = word2.phonemes.slice(range);

    // Without this, light would match lite and blight equally
    const lengthPenalty = .02 * Math.abs(word1.phonemes.length - word2.phonemes.length);
    return average(phonemes1.map((x,i)=>lookup[x][phonemes2[i]])) - lengthPenalty;
}

/**
 * Return words sorted by overall similarity
 * @param {float} semanticWeight - How heavily to weigh semantic similarity in the overall score
 */
function similarWords (target, words, semanticWeight) {
    const targetEmbedding = glove[target.word];
    return words.map(function (x) {
        let score = compareWords(target, x);
        
        if (semanticWeight) {
            let embedding = glove[x.word];
            if (!embedding) return [x.word, 0];
            score = (score * (1 - semanticWeight)) + cosineSimilarity(targetEmbedding, embedding) * semanticWeight;
        }

        return [x.word, score];
    }).sort((x,y) => y[1] - x[1]);
}

function throttle(fn, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// This matches at the start

// And this one matches at the end