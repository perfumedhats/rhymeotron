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
    return average(word1.phonemes.map((x,i)=>lookup[x][word2.phonemes[i]]))
}

// Return words sorted by overall similarity
// Only works on targets that are the same length
// we it to work for words that are different lengths
function similarWords (target, words) {
    length = target.phonemes.length;
    potential = words.filter(x => x.phonemes.length == length);
    return potential.map(x=>[x.word, compareWords(target, x)]).sort((x,y) => y[1] - x[1]);
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