const englishInput = document.getElementById('english-input');
const obbishInput = document.getElementById('obbish-input');

englishInput.addEventListener('input', () => {
    const englishText = englishInput.value;
    const obbishText = translateToObbish(englishText);
    obbishInput.value = obbishText;
});

function translateToObbish(englishText) {
    const words = englishText.split(' ');
    const obbishWords = words.map(word => {
        word = translateWordToObbish(word);
        return word;
    });
    return obbishWords.join(' ');
}

function translateWordToObbish(word) {
    const vowelSounds = [
        "eau", "igh", "oo", "ea", "ou", "ay", "oi", "oy", "au", "aw", "ow",
        "ei", "ey", "ai", "ew", "ue", "ui", "ie", "oa",
        "a", "e", "i", "o", "u"
    ]

    const vowelPattern = new RegExp(`(${vowelSounds.join('|')})`, 'gi');
    const splitOnVowels = word => word.split(vowelPattern).filter(part => part !== '');

    const parts = splitOnVowels(word).map(part => {
        const isVowelSound = vowelSounds.some(vowel => 
            part.toLowerCase().includes(vowel.toLowerCase())
        );

        const isUpperCase = letter => letter === letter.toUpperCase();

        if (isVowelSound && isUpperCase(part[0])) {
            return 'Obb' + part[0].toLowerCase() + part.slice(1);
        }
        else if (isVowelSound) {
            return 'obb' + part;
        }

        return part;
    });
    return parts.join('');
}
