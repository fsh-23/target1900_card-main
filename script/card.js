const card = (settings) => {
    const cardContainer = document.getElementById("cardSection");
    cardContainer.style.display = "flex";

    const firstArray = settings.weakOnly === 0 ? createAllWordArray(settings) : createWeakWordArray(settings);
    if (!firstArray.length) location.reload();
    const secondArray = settings.order === 0 ? firstArray : arrayShuffle(firstArray);

    if (settings.direction === 0) {
        enToJa(secondArray);
    } else {
        jaToEn(secondArray);
    }
};

const arrayShuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const createAllWordArray = (settings) => {
    const array = [];
    for (let i = 0; i < settings.end - settings.start + 1; i++) {
        array.push(WORDS[i + settings.start]);
    }
    return array;
};

const createWeakWordArray = (settings) => {
    const weakList = getLocalStorage("words");
    const array = [];
    for (let i = 0; i < settings.end - settings.start + 1; i++) {
        if (weakList[`${i + settings.start}`]) {
            array.push(WORDS[i + settings.start]);
        }
    }
    return array;
};

const enToJa = (wordList) => {
    let index = 0;
    let mean = false;
    const weakList = [getLocalStorage("words"), getLocalStorage('tyoe')];

    const card = document.getElementById("card");
    const wordSpace = document.getElementById("wordText");
    const meanSpace = document.getElementById("meanText");
    const numberSpace = document.getElementById("numberText");
    const showWeak = document.getElementById("isWeak");
    const showNumber = document.getElementById("showNumber");
    wordSpace.textContent = wordList[0].word;
    if (weakList[0][`${wordList[0].number}`]) {
        showWeak.classList.remove("weak-false");
        showWeak.classList.add("weak-true");
    } else {
        showWeak.classList.remove("weak-true");
        showWeak.classList.add("weak-false");
    }
    numberSpace.textContent = wordList[index].number;
    showNumber.textContent = `${index + 1} / ${wordList.length}`;
    const utterance = new SpeechSynthesisUtterance(wordList[index].word);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);

    card.addEventListener("touchend", (e) => {
        e.preventDefault();

        if (mean) {
            index++;
            if (index >= wordList.length) {
                cardEnd();
                return;
            }
            numberSpace.textContent = wordList[index].number;
            showNumber.textContent = `${index + 1} / ${wordList.length}`;
            mean = false;
            wordSpace.textContent = wordList[index].word;
            meanSpace.textContent = "";
            const utterance = new SpeechSynthesisUtterance(wordList[index].word);
            utterance.lang = "en-US";
            utterance.rate = 1;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
            if (weakList[0][`${wordList[index].number}`]) {
                showWeak.classList.remove("weak-false");
                showWeak.classList.add("weak-true");
            } else {
                showWeak.classList.remove("weak-true");
                showWeak.classList.add("weak-false");
            }
        } else {
            mean = true;
            meanSpace.textContent = wordList[index].mean;
        }
    });

    showWeak.addEventListener("touchend", (e) => {
        e.preventDefault();

        if (showWeak.classList.contains("weak-false")) {
            showWeak.classList.remove("weak-false");
            showWeak.classList.add("weak-true");
            weakList[0][`${wordList[index].number}`] = true;
            weakList[1][`${wordList[index].number}`] = true;
        } else {
            showWeak.classList.remove("weak-true");
            showWeak.classList.add("weak-false");
            weakList[0][`${wordList[index].number}`] = false;
            weakList[1][`${wordList[index].number}`] = false;
        }
    });
};

const jaToEn = (wordList) => {
    let index = 0;
    let word = false;
    const weakList = [getLocalStorage("words"), getLocalStorage("tyoe")];

    const card = document.getElementById("card");
    const wordSpace = document.getElementById("wordText");
    const meanSpace = document.getElementById("meanText");
    const numberSpace = document.getElementById("numberText");
    const showWeak = document.getElementById("isWeak");
    const showNumber = document.getElementById("showNumber");
    meanSpace.textContent = wordList[0].mean;
    if (JSON.parse(localStorage.getItem(`${wordList[0].number}`))) {
        showWeak.classList.remove("weak-false");
        showWeak.classList.add("weak-true");
    } else {
        showWeak.classList.remove("weak-true");
        showWeak.classList.add("weak-false");
    }
    numberSpace.textContent = wordList[index].number;
    showNumber.textContent = `${index + 1} / ${wordList.length}`;

    card.addEventListener("touchend", (e) => {
        e.preventDefault();

        if (word) {
            index++;
            if (index >= wordList.length) {
                cardEnd();
                return;
            }
            numberSpace.textContent = wordList[index].number;
            showNumber.textContent = `${index + 1} / ${wordList.length}`;
            word = false;
            meanSpace.textContent = wordList[index].mean;
            wordSpace.textContent = "";
            if (JSON.parse(localStorage.getItem(`${wordList[index].number}`))) {
                showWeak.classList.remove("weak-false");
                showWeak.classList.add("weak-true");
            } else {
                showWeak.classList.remove("weak-true");
                showWeak.classList.add("weak-false");
            }
        } else {
            word = true;
            wordSpace.textContent = wordList[index].word;
            const utterance = new SpeechSynthesisUtterance(wordList[index].word);
            utterance.lang = "en-US";
            utterance.rate = 1;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    });

    showWeak.addEventListener("touchend", (e) => {
        e.preventDefault();

        if (showWeak.classList.contains("weak-false")) {
            showWeak.classList.remove("weak-false");
            showWeak.classList.add("weak-true");
            localStorage.setItem(`${wordList[index].number}`, true);
            localStorage.setItem(`type-${wordList[index].number}`, true);
        } else {
            localStorage.setItem(`${wordList[index].number}`, false);
            localStorage.setItem(`type-${wordList[index].number}`, false);
            showWeak.classList.remove("weak-true");
            showWeak.classList.add("weak-false");
        }
    });
};

const cardEnd = () => {
    const cardContainer = document.getElementById("cardSection");
    cardContainer.style.display = "none";
    const cardEnd = document.getElementById("cardEnd");
    cardEnd.style.display = "flex";

    document.getElementById("cardEnd").addEventListener(
        "click",
        () => {
            location.reload();
        },
        { once: true }
    );
};

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("words") === null) {
        createWeakData("words");
    }

    if (localStorage.getItem("type") === null) {
        createTypeData("type");
    }

    const selector = document.getElementById("range-select");
    selector.addEventListener("change", () => {
        const start = document.getElementById("startIndex");
        const end = document.getElementById("endIndex");
        const section = selector.value;
        if (section !== "0") {
            start.value = (section - 1) * 100 + 1;
            end.value = section * 100;
        } else {
            start.value = 1;
            end.value = 1900;
        }
    });

    const startIndex = document.getElementById("startIndex");
    startIndex.addEventListener("focus", function () {
        this.select();
    });
    const endIndex = document.getElementById("endIndex");
    endIndex.addEventListener("focus", function () {
        this.select();
    });

    document.querySelectorAll(".button-group").forEach((group) => {
        group.addEventListener("touchend", (e) => {
            if (e.target.classList.contains("button-item")) {
                group.querySelectorAll(".button-item").forEach((item) => item.classList.remove("active"));
                e.target.classList.add("active");
            }
        });
    });

    document.getElementById("startBtn").addEventListener("touchend", () => {
        const start = Number(document.getElementById("startIndex").value);
        const end = Number(document.getElementById("endIndex").value);
        if (start > end) return;

        const direction = document.querySelector('[data-group="direction"] .active').dataset.value;
        const order = document.querySelector('[data-group="order"] .active').dataset.value;
        const weakOnly = document.querySelector('[data-group="weakOnly"] .active').dataset.value;

        const settings = document.querySelector(".origin");
        settings.style.display = "none";

        card({
            start: start,
            end: end,
            direction: Number(direction),
            order: Number(order),
            weakOnly: Number(weakOnly),
        });
    });

    document.getElementById("backBtn").addEventListener("click", () => {
        location.reload();
    });
});
