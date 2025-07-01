const createTable = (data) => {
    const container = document.getElementById("wordList");
    const weakList = getLocalStorage("words");

    container.innerHTML = `
        <div class="row header">
            <div class="cell number">No.</div>
            <div class="cell word">単語</div>
        </div>`;

    for (const word of data) {
        const row = document.createElement("div");
        row.className = "row";
        if (weakList[`${word.number}`]) {
            row.style.backgroundColor = "#b3f5ff";
        }

        const numberCell = document.createElement("div");
        numberCell.className = "cell number";
        numberCell.textContent = word.number;

        const wordCell = document.createElement("div");
        wordCell.className = "cell word";
        wordCell.textContent = word.word;

        row.appendChild(numberCell);
        row.appendChild(wordCell);
        container.appendChild(row);
    }
};

const loadWords = (section) => {
    const first = (section - 1) * 100 + 1;
    const end = section * 100;
    const sectionWords = [];
    for (let i = first; i <= end; i++) {
        const entry = WORDS[i];
        sectionWords.push(entry);
    }

    createTable(sectionWords);
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

const touchEventListener = () => {
    let startY = 0;
    let moved = false;
    const threshold = 10;
    let weakList = getLocalStorage("words");

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
        const parent = target.parentNode;
        const style = getComputedStyle(parent);

        if (target.classList[1] === "word" && target.textContent !== "単語") {
            const number = Number(parent.children[0].textContent);
            showPopUp(number);
        }

        if (target.classList[1] === "number" && target.textContent !== "No.") {
            const number = Number(target.textContent);
            if (style.backgroundColor === "rgb(255, 255, 255)") {
                parent.style.backgroundColor = "#b3f5ff";
                weakList[`${number}`] = true;
            } else {
                parent.style.backgroundColor = "#fff";
                weakList[`${number}`] = false;
            }
            setLocalStorage("words", weakList);
        }
    });
};

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("words") === null) {
        createWeakData("words");
    }

    const selector = document.getElementById("section-select");
    selector.addEventListener("change", () => {
        if (selector.value !== "0") {
            loadWords(selector.value);
        }
    });

    touchEventListener();
});
