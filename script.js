import { LENGTH_OF_THE_WORD, MAX_ATTEMPTS, WORDS } from "./constants.js";


const getWordofTheDay = () => {
    const GAME_EPOCH_IN_MS = new Date('2022-01-01').getTime();
    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

    const NOW_IN_MS = new Date().getTime();

    const index = Math.floor((NOW_IN_MS - GAME_EPOCH_IN_MS) / ONE_DAY_IN_MS);

    const word = WORDS[index + 1 % WORDS.length];

    return word.toUpperCase();

}

let WORD_OF_THE_DAY = getWordofTheDay();

let input = document.querySelectorAll('.input1');
let inputField = document.querySelector('.inputfield1');

let currentAttempt = 1;
let finalInput = "", inputCount = 0;

const calculateUserSubmission = () => {

    finalInput = finalInput.toUpperCase();
    if (finalInput.length !== LENGTH_OF_THE_WORD)
        return;

    const colors = [];
    for (let i = 0; i < LENGTH_OF_THE_WORD; i++) {

        if (finalInput[i] === WORD_OF_THE_DAY[i])
            colors.push('GREEN');

        else {
            const index = WORD_OF_THE_DAY.indexOf(finalInput[i]);
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
            const wordOfTheDay = document.getElementById('word_of_the_day')

            messageDiv.textContent = `Congratulations! You solved the wordle.`
            wordOfTheDay.textContent = `The word was ${WORD_OF_THE_DAY}`

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
            const wordOfTheDay = document.getElementById('word_of_the_day')

            wordOfTheDay.textContent = `You couldn't solve the Wordle. Better luck next time!`
            messageDiv.textContent = `The word was ${WORD_OF_THE_DAY}`

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
