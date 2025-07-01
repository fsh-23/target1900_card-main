const typing = (settings) => {
    const firstArray = settings.weakOnly === 0 ? createAllWordArray(settings) : createWeakWordArray(settings);
    if (!firstArray.length) location.reload();
    const secondArray = settings.order === 0 ? firstArray : arrayShuffle(firstArray);

    question(secondArray);
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

const arrayShuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const createTypingDisplay = () => {
    const display = document.querySelector(".typing-display");
    display.innerHTML = `
    <div class="keyboard">
            <div class="key-row">
                <button class="key" data-value="q">Q</button>
                <button class="key" data-value="w">W</button>
                <button class="key" data-value="e">E</button>
                <button class="key" data-value="r">R</button>
                <button class="key" data-value="t">T</button>
                <button class="key" data-value="y">Y</button>
                <button class="key" data-value="u">U</button>
                <button class="key" data-value="i">I</button>
                <button class="key" data-value="o">O</button>
                <button class="key" data-value="p">P</button>
            </div>
            <div class="key-row">
                <button class="key" data-value="a">A</button>
                <button class="key" data-value="s">S</button>
                <button class="key" data-value="d">D</button>
                <button class="key" data-value="f">F</button>
                <button class="key" data-value="g">G</button>
                <button class="key" data-value="h">H</button>
                <button class="key" data-value="j">J</button>
                <button class="key" data-value="k">K</button>
                <button class="key" data-value="l">L</button>
            </div>
            <div class="key-row">
                <button class="key" data-value="z">Z</button>
                <button class="key" data-value="x">X</button>
                <button class="key" data-value="c">C</button>
                <button class="key" data-value="v">V</button>
                <button class="key" data-value="b">B</button>
                <button class="key" data-value="n">N</button>
                <button class="key" data-value="m">M</button>
                <button class="delete" data-value="delete">⌫</button>
            </div>
            <div class="key-row">
                <button class="space" data-value=" "></button>
                <button class="enter" data-value="enter">決定</button>
            </div>
        </div>

        <div class="typing-container" id="typingSection">
            <button class="back-button" id="backBtn" onclick="backBtnClick()">← 設定に戻る</button>
            <div class="typing">
                <div id="meanText" class="mean-space"> </div>
                <div class="typing-space">
                    <div id="typingSpace" class="type-text"></div>
                    <div class="cursor visible"></div>
                </div>
            </div>
            <div class="show-number1" id="showNumber"></div>

            <div class="show-typing-weak weak-false" id="isWeak">苦手</div>
        </div>
    </div>
    `;
};

const question = (wordList) => {
    const weakList = getLocalStorage("type");
    createTypingDisplay();
    let index = 0;
    let next = false;
    const missList = [];

    const meanSpace = document.getElementById("meanText");
    const typeSpace = document.getElementById("typingSpace");
    const showWeak = document.getElementById("isWeak");
    const showNumber = document.getElementById("showNumber");
    showNumber.textContent = `${1} / ${wordList.length}`;
    meanSpace.textContent = wordList[0].mean;
    if (weakList[`${wordList[0].number}`]) {
        showWeak.classList.remove("weak-false");
        showWeak.classList.add("weak-true");
    } else {
        showWeak.classList.remove("weak-true");
        showWeak.classList.add("weak-false");
    }

    const keyboard = document.querySelector(".keyboard");
    keyboard.style.display = "block";
    keyboard.addEventListener("touchend", (e) => {
        e.preventDefault();
        const text = e.target.getAttribute("data-value");
        if (text === null) return;
        if (text === "delete") {
            typeSpace.textContent = typeSpace.textContent.slice(0, -1);
        } else if (text === "enter") {
            enter();
        } else if (!next) {
            typeSpace.textContent += text;
        }
        e.target.classList.add("key-active");
        setTimeout(() => {
            e.target.classList.remove("key-active");
        }, 150);
    });

    const cursor = document.querySelector(".cursor");
    const enterKey = document.querySelector(".enter");
    const enter = () => {
        if (next) {
            index++;
            if (index >= wordList.length) {
                typingEnd(wordList, missList);
                return;
            }
            showNumber.textContent = `${index + 1} / ${wordList.length}`;
            next = false;
            meanSpace.textContent = wordList[index].mean;
            typeSpace.textContent = "";
            if (weakList[`${wordList[index].number}`]) {
                showWeak.classList.remove("weak-false");
                showWeak.classList.add("weak-true");
            } else {
                showWeak.classList.remove("weak-true");
                showWeak.classList.add("weak-false");
            }
            enterKey.textContent = "決定";
            typeSpace.style.color = "#333333";
            typeSpace.parentNode.style.backgroundColor = "#ffffff";
            cursor.classList.add("visible");
        } else {
            next = true;

            const utterance = new SpeechSynthesisUtterance(wordList[index].word);
            utterance.lang = "en-US";
            utterance.rate = 1;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);

            cursor.classList.remove("visible");

            enterKey.textContent = "次へ";

            if (typeSpace.textContent === wordList[index].word) {
                typeSpace.parentElement.style.backgroundColor = "#75cad5";
                typeSpace.style.color = "#ffffff";
            } else {
                typeSpace.parentNode.style.backgroundColor = "#f67171";
                showWeak.classList.remove("weak-false");
                showWeak.classList.add("weak-true");
                weakList[`${wordList[index].number}`] = true;
                setLocalStorage("type", weakList);
                missList.push(wordList[index]);
                setTimeout(() => {
                    if (next) {
                        typeSpace.style.color = "#ffffff";
                        typeSpace.textContent = wordList[index].word;
                    }
                }, 1000);
            }

            setTimeout(() => {
                if (next) enter();
            }, 2500);
        }
    };

    showWeak.addEventListener("touchend", (e) => {
        e.preventDefault();
        if (showWeak.classList.contains("weak-false")) {
            showWeak.classList.remove("weak-false");
            showWeak.classList.add("weak-true");
            weakList[`${wordList[index].number}`] = true;
            setLocalStorage("type", weakList);
        } else {
            showWeak.classList.remove("weak-true");
            showWeak.classList.add("weak-false");
            weakList[`${wordList[index].number}`] = false;
            setLocalStorage("type", weakList);
        }
    });
};

const typingEnd = (wordList, missList) => {
    removeTypingDisplay();
    createTable(wordList, missList);
    wordTouchEvent();
    const endPart = document.querySelector(".display");
    const select = document.querySelector(".select-destiny");
    endPart.style.display = "block";

    select.addEventListener(
        "click",
        (e) => {
            endPart.style.display = "none";
            if (e.target.textContent === "設定に戻る") {
                location.reload();
                return;
            } else if (e.target.textContent === "もう一度") {
                question(wordList);
                return;
            } else {
                if (missList.length > 0) {
                    question(missList);
                    return;
                } else {
                    location.reload();
                    return;
                }
            }
            location.reload();
        },
        { once: true }
    );
};

const removeTypingDisplay = () => {
    const display = document.querySelector(".typing-display");
    display.innerHTML = "";
};

const createTable = (data, missList) => {
    const parent = document.getElementById("table-container");
    parent.innerHTML = `<div class="container" id="wordList"></div>`;
    const container = document.getElementById("wordList");
    const weakList = [getLocalStorage("words"), getLocalStorage("type")];

    container.innerHTML = `
        <div class="row header">
            <div class="cell number">No.</div>
            <div class="cell word">単語</div>
        </div>`;

    for (const word of data) {
        const row = document.createElement("div");
        row.className = "row";
        if (weakList[0][`${word.number}`]) {
            row.style.backgroundColor = "#b3f5ff";
        }
        if (weakList[1][`${word.number}`]) {
            row.style.backgroundColor = "#cbffb3";
        }

        const numberCell = document.createElement("div");
        numberCell.className = "cell number";

        const numberText = document.createElement("p");
        numberText.className = "number-p number";
        numberText.textContent = word.number;

        const wordCell = document.createElement("div");
        wordCell.className = "cell word";
        wordCell.textContent = word.word;

        for (const miss of missList) {
            if (miss.number === word.number) {
                numberText.style.backgroundColor = "#f67171";
                numberText.style.color = "#ffffff";
                break;
            }
        }

        numberCell.appendChild(numberText);
        row.appendChild(numberCell);
        row.appendChild(wordCell);
        container.appendChild(row);
    }
};

const showPopUp = (number) => {
    const wordBox = document.getElementById("pop-word");
    const meanBox = document.getElementById("pop-mean");
    wordBox.textContent = WORDS[number].word;
    meanBox.textContent = WORDS[number].mean;
    document.querySelector(".pop-overlay").style.display = "block";
    document.querySelector(".pop-up").style.display = "block";
};

const closePopUp = () => {
    document.querySelector(".pop-overlay").style.display = "none";
    document.querySelector(".pop-up").style.display = "none";
};

const wordTouchEvent = () => {
    const weakList = [getLocalStorage("words"), getLocalStorage("type")];
    let startY = 0;
    let moved = false;
    const threshold = 10;

    const container = document.getElementById("wordList");

    container.addEventListener("touchstart", (e) => {
        startY = e.touches[0].clientY;
        moved = false;
    });

    container.addEventListener("touchmove", (e) => {
        const currentY = e.touches[0].clientY;
        if (Math.abs(currentY - startY) > threshold) {
            moved = true;
        }
    });

    container.addEventListener("touchend", (e) => {
        if (moved) return;
        e.preventDefault();

        const target = e.target;
        let parent = target.parentNode;
        let style = getComputedStyle(parent);

        if (target.classList[1] === "word" && target.textContent !== "単語") {
            const number = Number(parent.children[0].textContent);
            showPopUp(number);
        }

        if (target.classList[1] === "number" && target.textContent !== "No.") {
            if (e.target.classList[0] === "number-p") {
                parent = parent.parentNode;
                style = getComputedStyle(parent);
            }
            const number = Number(target.textContent);
            if (style.backgroundColor === "rgb(255, 255, 255)" || style.backgroundColor === "rgb(179, 245, 255)") {
                parent.style.backgroundColor = "#cbffb3";
                weakList[1][`${number}`] = true;
                setLocalStorage("type", weakList[1]);
            } else {
                weakList[1][`${number}`] = false;
                setLocalStorage("type", weakList[1]);

                if (weakList[0][`${number}`]) {
                    parent.style.backgroundColor = "#b3f5ff";
                } else {
                    parent.style.backgroundColor = "#fff";
                }
            }
        }
    });
};

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("words") === null) {
        createWeakData("words");
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

        const order = document.querySelector('[data-group="order"] .active').dataset.value;
        const weakOnly = document.querySelector('[data-group="weakOnly"] .active').dataset.value;

        const settings = document.querySelector(".origin");
        settings.style.display = "none";

        typing({
            start: start,
            end: end,
            order: Number(order),
            weakOnly: Number(weakOnly),
        });
    });

    if (localStorage.getItem("type") === null) {
        createTypeData("type");
    }
});

const backBtnClick = () => {
    location.reload();
};
