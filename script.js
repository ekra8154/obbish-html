const englishInput = document.getElementById('english-input');
const obbishInput = document.getElementById('obbish-input');

let compoundWords = {};
fetch('silent-e-compound-words.json')
    .then(response => response.json())
    .then(data => {
        compoundWords = data;
        console.log('JSON data loaded!');  // Add this line
    })
    .catch(error => console.error('Error loading compound words:', error));

const vowelSounds = [
    "oo", "ea", "ou", "ay", "oi", "oy", "au", "aw", "ow",
    "ei", "ey", "ai", "ew", "ue", "ui", "ie", "oa",
    "a", "e", "i", "o", "u"
];

englishInput.addEventListener('input', () => {
    const englishText = englishInput.value;
    const obbishText = translateToObbish(englishText);
    obbishInput.value = obbishText;
});

obbishInput.addEventListener('input', () => {
    const obbishText = obbishInput.value;
    const englishText = translateToEnglish(obbishText);
    englishInput.value = englishText;
});

function translateToObbish(englishText) {
    const words = englishText.split(' ');
    const obbishWords = words.map(word => {
        word = translateWordToObbish(word);
        return word;
    });
    return obbishWords.join(' ');
}

function translateToEnglish(obbishText) {
    const words = obbishText.split(' ');
    const englishWords = words.map(word => {
        word = translateWordToEnglish(word);
        return word;
    });
    return englishWords.join(' ');
}

function translateWordToEnglish(word) {
    const vowelPattern = new RegExp(`(obb(?:${vowelSounds.join('|')}))`, 'gi');
    const splitOnVowels = word => word.split(vowelPattern).filter(part => part !== '');
    const wordParts = [];
    

    console.log(splitOnVowels(word));

    const parts = splitOnVowels(word).map(part => {
        wordParts.push(part.replace(/obb/g, ''));
    });


    return wordParts.join('');
}

// grapple --> grobbappobble, whole --> whobbole, eagle --> obbeagobble
function translateWordToObbish(word) {
    // handle compound words that end with silent e
    if (compoundWords[word.toLowerCase()]) {
        const parts = compoundWords[word.toLowerCase()];
        return parts.map(part => translateWordToObbish(part)).join('');
    }

    const vowelPattern = new RegExp(`(${vowelSounds.join('|')}|[bcdfghklmnprstvz]le$)`, 'gi');
    const splitOnVowels = word => word.split(vowelPattern).filter(part => part !== '');

    const parts = splitOnVowels(word);
    const wordParts = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        const isVowelSound = vowelSounds.some(vowel => 
            part.toLowerCase().includes(vowel.toLowerCase())
        );
    
        const isUpperCase = letter => letter === letter.toUpperCase();
    
        // Capitalize Obb if a vowel is capitalized eg. Epic --> Obbepobbic!
        if (isVowelSound && isUpperCase(part[0])) {
            wordParts.push('Obb' + part[0].toLowerCase() + part.slice(1));
        }
        // words like bottle and eagle. 
        else if (part.includes("le")) {
            wordParts.push(part[0].toLowerCase() + 'obb' + part.slice(1));
        }
        // no obb for silent e
        else if (part === 'e' && i == parts.length - 1) {
            wordParts.push(part);
        }
        else if (isVowelSound) {
            wordParts.push('obb' + part);
        }
        else {
            wordParts.push(part);
        }
    }
    
    return wordParts.join('');
}

function speakObbish(text) {
    // Create a new speech synthesis instance
    const speech = new SpeechSynthesisUtterance(text);
    
    // Get all available voices
    const voices = window.speechSynthesis.getVoices();
    
    const ukMaleVoice = voices.find(voice => 
        voice.name === 'Google UK English Male'
    );
    
    if (ukMaleVoice) {
        speech.voice = ukMaleVoice;
    } else {
        // Fallback to any British English voice
        const britishVoice = voices.find(voice => 
            voice.lang === 'en-GB'
        );
        if (britishVoice) {
            speech.voice = britishVoice;
        }
    }
    
    // Set some properties
    speech.rate = 1.5;  // Speed
    speech.pitch = 2; // Pitch
    speech.volume = 1.0; // Volume
    
    window.speechSynthesis.speak(speech);
}