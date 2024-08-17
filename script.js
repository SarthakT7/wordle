import { LENGTH_OF_THE_WORD, MAX_ATTEMPTS, WORDS } from "./constants.js";


const loadAllWordsFromAPI = async () => {
    try {
        // GitHub raw file URL
        const fileUrl = 'https://raw.githubusercontent.com/cymplecy/5letterWords/main/files/5letterWords.txt';

        // Fetch the data using fetch API
        const response = await fetch(fileUrl);

        // Ensure the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Read the response as text
        const data = await response.text();

        // Split content by new lines to get each word
        const words = data.split('\n').filter(line => line.trim() !== '');

        return words;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        return [];
    }
};

const getRandomWord = () => {

    const randomIndex = Math.floor(Math.random() * WORDS.length);

    const word = WORDS[randomIndex];

    return word.toUpperCase();
}


let CORRECT_WORD = getRandomWord();

let input = document.querySelectorAll('.input1');
let inputField = document.querySelector('.inputfield1');

let currentAttempt = 1;
let finalInput = "", inputCount = 0;

const allWords = await loadAllWordsFromAPI();
const calculateUserSubmission = () => {

    finalInput = finalInput.toUpperCase();
    if (finalInput.length !== LENGTH_OF_THE_WORD)
        return;

    const colors = [];
    for (let i = 0; i < LENGTH_OF_THE_WORD; i++) {

        if (finalInput[i] === CORRECT_WORD[i])
            colors.push('GREEN');

        else {
            const index = CORRECT_WORD.indexOf(finalInput[i]);
            index == -1 ? colors.push('BLACK') : colors.push('YELLOW')
        }
    }

    return colors;

}

const attachEventListeners = (inputs) => {


    inputs.forEach((element) => {
        element.removeEventListener("input", handleInput); // Remove existing listeners to avoid duplicates
        element.removeEventListener("keyup", handleKeyup);

        element.addEventListener("input", handleInput);
        element.addEventListener("keyup", handleKeyup);
    });
}

const handleInput = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');
}

const handleKeyup = (e) => {
    e.target.value = e.target.value;
    let { value } = e.target;

    if (value.length == 1) {
        updateInputConfig(e.target, true);
        if (inputCount < LENGTH_OF_THE_WORD && e.key != "Backspace") {
            finalInput += value;
            if (inputCount < LENGTH_OF_THE_WORD - 1) {
                updateInputConfig(e.target.nextElementSibling, false);
            }
        }
        inputCount += 1;
    } else if (value.length == 0 && e.key == "Backspace") {
        finalInput = finalInput.substring(0, finalInput.length - 1);
        if (inputCount == 0) {
            updateInputConfig(e.target, false);
            return false;
        }
        updateInputConfig(e.target, true);
        e.target.previousElementSibling.value = "";
        updateInputConfig(e.target.previousElementSibling, false);
        inputCount -= 1;
    } else if (value.length > 1) {
        e.target.value = value.split("")[0];
    }
}

const openDialog = () => {
    document.getElementById('dialog').style.display = 'block';
}

const closeDialog = () => {
    const inputs = document.querySelectorAll('input[type="text"]');
    const classesToRemove = ['yellow', 'green', 'black'];

    inputs.forEach(input => {
        input.value = '';
        classesToRemove.forEach(className => {
            input.classList.remove(className);
        });
    });
    document.getElementById('dialog').style.display = 'none';

}

const checkIfAllGreens = (colors) => {
    for (let color of colors)
        if (color != 'GREEN')
            return false;

    return true;
}
const handleWindowKeyUp = (e) => {
    if (currentAttempt > MAX_ATTEMPTS) {
        return;
    }

    if (currentAttempt <= MAX_ATTEMPTS && inputCount >= LENGTH_OF_THE_WORD) {

        if (e.key == "Backspace") {
            finalInput = finalInput.substring(0, finalInput.length - 1);
            updateInputConfig(inputField.lastElementChild, false);
            inputField.lastElementChild.value = "";
            inputCount -= 1;
        }
    
        if (!allWords.includes(finalInput)) {
            const snackbar = document.getElementById('snackbar')
            snackbar.className = "show";
            setTimeout(function () { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
            return;
        }


        const colors = calculateUserSubmission();
        let i = 0;
        input.forEach((element) => {
            element.classList.remove('yellow', 'black', 'green');
            element.classList.add('flip')
            if (colors[i] === 'YELLOW') element.classList.add('yellow');
            if (colors[i] === 'BLACK') element.classList.add('black');
            if (colors[i] === 'GREEN') element.classList.add('green');

            i++;
        });

        if (checkIfAllGreens(colors)) {
            window.removeEventListener("keyup", handleWindowKeyUp);
            const messageDiv = document.getElementById('message')
            const correctWord = document.getElementById('CORRECT_WORD')

            messageDiv.textContent = `Congratulations! You solved the wordle.`
            correctWord.textContent = `The word was ${CORRECT_WORD}`

            openDialog();
        }

        currentAttempt++;

        if (currentAttempt <= MAX_ATTEMPTS) {
            inputField = document.querySelector(`.inputfield${currentAttempt.toString()}`);
            input = document.querySelectorAll(`.input${currentAttempt.toString()}`);
            startInput();
        } else {
            window.removeEventListener("keyup", handleWindowKeyUp);
            const messageDiv = document.getElementById('message')
            const correctWord = document.getElementById('CORRECT_WORD')

            correctWord.textContent = `You couldn't solve the Wordle. Better luck next time!`
            messageDiv.textContent = `The word was ${CORRECT_WORD}`

            openDialog();

        }
    }
};

window.addEventListener("keyup", handleWindowKeyUp);



const updateInputConfig = (element, status) => {
    element.disabled = status;
    status == false ? element.focus() : element.blur();
}
const startInput = () => {
    inputCount = 0;
    finalInput = "";

    attachEventListeners(input);
    input.forEach((element) => element.value = "");
    updateInputConfig(inputField.firstElementChild, false);
}

window.onload = startInput;

window.onclick = function (event) {
    if (event.target === document.getElementById('dialog')) {
        closeDialog();
    }
}

document.querySelector('.close-button').addEventListener('click', () => { closeDialog() })
