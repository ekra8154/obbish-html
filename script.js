const englishInput = document.getElementById('english-input');
const obbishInput = document.getElementById('obbish-input');

let voicesLoaded = false;

let compoundWords = {};
fetch('silent-e-compound-words.json')
    .then(response => response.json())
    .then(data => {
        compoundWords = data;
        console.log('JSON data loaded!');  // Add this line
    })
    .catch(error => console.error('Error loading compound words:', error));

const vowelSounds = [
    "oo", "ee", "ea", "ou", "ay", "oi", "oy", "au", "aw", "ow",
    "ei", "ey", "ai", "ew", "ue", "ui", "ie", "oa",
    "a", "e", "i", "o", "u", "y"
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

    let vowelSoundCount = 0;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        const isVowelSound = vowelSounds.some(vowel => 
            part.toLowerCase().includes(vowel.toLowerCase())
        );
    
        const isUpperCase = letter => letter === letter.toUpperCase();

        if (isVowelSound) {
            vowelSoundCount++;
        }
    
        // Capitalize Obb if a vowel is capitalized eg. Epic --> Obbepobbic!
        if (isVowelSound && isUpperCase(part[0])) {
            wordParts.push('Obb' + part[0].toLowerCase() + part.slice(1));
        }
        // treat all mid-end word y's as vowels
        else if (part === 'y' && i == 0) {
            wordParts.push(part);
        }
        // words like bottle and eagle. 
        else if (part.includes("le")) {
            wordParts.push(part[0].toLowerCase() + 'obb' + part.slice(1));
        }
        // no obb for silent e (when there is more than 1 vowel in the word)
        else if (part === 'e' && i == parts.length - 1 && vowelSoundCount > 1) {
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

function preloadVoice() {
    const voices = window.speechSynthesis.getVoices();
    const ukMaleVoice = voices.find(voice => 
        voice.name === 'Google UK English Male'
    );
    
    if (ukMaleVoice) {
        voicesLoaded = true;
    } else {
        // If voices aren't loaded yet, try again
        setTimeout(preloadVoice, 100);
    }
}
// Call it when the page loads
document.addEventListener('DOMContentLoaded', preloadVoice);

// Wait for voices to be loaded
window.speechSynthesis.onvoiceschanged = () => {
    voicesLoaded = true;
};

function speakObbish(text) {
    // If voices aren't loaded yet, wait a bit and try again
    if (!voicesLoaded) {
        setTimeout(() => speakObbish(text), 100);
        return;
    }

    // Create a new speech synthesis instance
    const speech = new SpeechSynthesisUtterance(text);
    
    // Get all available voices
    const voices = window.speechSynthesis.getVoices();

    const ukMaleVoice = voices.find(voice => 
        voice.name === 'Google UK English Male'
    );

    if (ukMaleVoice) {
        speech.voice = ukMaleVoice;
    } 
    else {
        // Fallback to any British English voice
        const britishVoice = voices.find(voice => 
            voice.lang === 'en-GB'
        );
        if (britishVoice) {
            speech.voice = britishVoice;
        }
    }
    
    speech.rate = parseFloat(document.getElementById('speed-slider').value);
    speech.pitch = 1.7; // Pitch
    speech.volume = 1.0; // Volume
    
    speech.onstart = () => {
        const gif = document.getElementById('speaking-gif');
        updateGifHeight(); // Update height before showing
        gif.style.display = 'block';
    };
    
    speech.onend = () => {
        document.getElementById('speaking-gif').style.display = 'none';
    };

    window.speechSynthesis.speak(speech);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('speed-slider').addEventListener('input', function(e) {
        document.getElementById('speed-value').textContent = e.target.value;
    });
});

function updateGifHeight() {
    const content = document.querySelector('.content');
    const gif = document.getElementById('speaking-gif');
    gif.style.height = content.offsetHeight + 'px';
}

// Call it when the page loads
document.addEventListener('DOMContentLoaded', updateGifHeight);

// Call it when the window resizes
window.addEventListener('resize', updateGifHeight);
