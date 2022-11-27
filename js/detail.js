const urlParameter = window.location.search;
const paramPK = new URLSearchParams(urlParameter).get("pk");
const terminalSection = document.getElementById("terminal-section");
q = new URLSearchParams(urlParameter).get("q");

if (q) {
    const prevPageBtn = document.createElement("a");
    prevPageBtn.className = "nav-terminal";
    if (localStorage.getItem("favs") !== null) {
        prevPageBtn.href = "./favs.html";
    } else {
        prevPageBtn.href = `./search.html?q=${q}`;
    }

    const prevIcon = document.createElement("i");
    prevIcon.className = "fi fi-rr-arrow-small-left";
    prevIcon.style.fontSize = "45px";
    prevPageBtn.appendChild(prevIcon);

    terminalSection.appendChild(prevPageBtn);
}

const homeBtn = document.createElement("a");
homeBtn.className = "nav-terminal";
homeBtn.href = `./home.html`;

const homeIcon = document.createElement("i");
homeIcon.className = "fi fi-rr-home";
homeIcon.style.top = "0";
homeBtn.appendChild(homeIcon);

terminalSection.appendChild(homeBtn);

let recipe = null;
for (let index = 0; localStorage.getItem(index); index++) {
    const recipeElem = JSON.parse(localStorage.getItem(index));
    if (recipeElem.RCP_SEQ === paramPK) {
        recipe = recipeElem;
        break;
    }
}

if (recipe !== null) {
    displayRecipeDetail();
} else {
    displayEmptyPage();
}

function displayEmptyPage() {
    const errorBox = document.createElement("div");
    errorBox.id = "error-box";
    insideContainer.appendChild(errorBox);

    const img = document.createElement("img");
    img.src = "/images/error.png";
    img.id = "not-found-image";
    errorBox.appendChild(img);

    const text = document.createElement("span");
    text.innerText = "찾으시는 레시피가 없습니다";
    text.id = "not-found-text";
    errorBox.appendChild(text);
}

function displayRecipeDetail() {
    const recipeInfoContainer = document.createElement("div");
    recipeInfoContainer.id = "recipe-info-container";
    insideContainer.appendChild(recipeInfoContainer);

    const recipeSummary = createRecipeSummary();
    recipeInfoContainer.appendChild(recipeSummary);

    const recipeSteps = createRecipeSteps();
    recipeInfoContainer.appendChild(recipeSteps);
}

function createRecipeSummary() {
    const recipeSummary = document.createElement("div");
    recipeSummary.id = "recipe-summary";

    const mainImage = document.createElement("div");
    mainImage.id = "main-image";
    let image = recipe.ATT_FILE_NO_MAIN;
    image = handleThumbnailDoesntExist(image, recipe);
    mainImage.style.backgroundImage = `url("${image}")`;
    recipeSummary.appendChild(mainImage);

    const recipeName = document.createElement("div");
    recipeName.id = "recipe-name";
    recipeName.innerText = recipe.RCP_NM;
    recipeSummary.appendChild(recipeName);

    const nutritionInformation = createRecipeInformation("영양 정보", true);
    recipeSummary.appendChild(nutritionInformation);

    const ingredientInformation = createRecipeInformation("재료", false);
    recipeSummary.appendChild(ingredientInformation);

    return recipeSummary;
}

function createRecipeInformation(innerText, isNutrition) {
    const recipeInformation = document.createElement("div");
    recipeInformation.className = "recipe-information";

    const recipeTitle = document.createElement("div");
    recipeTitle.className = "recipe-title";
    recipeTitle.innerText = innerText;
    recipeInformation.appendChild(recipeTitle);

    let list = [];
    if (isNutrition) {
        list = getNutritionList();
    } else {
        list = getIngredientList();
    }

    const recipeDetails = document.createElement("ul");
    recipeDetails.className = "recipe-details";
    recipeInformation.appendChild(recipeDetails);

    for (const key in list) {
        const li = document.createElement("li");
        recipeDetails.appendChild(li);

        const span1 = document.createElement("span");
        span1.className = "detail-title";
        span1.innerText = list[key]["key"];
        li.appendChild(span1);

        const span2 = document.createElement("span");
        span2.className = "detail-data";
        span2.innerText = list[key]["value"];
        li.appendChild(span2);
    }

    return recipeInformation;
}

function getNutritionList() {
    const tagList = {
        ENG: "열량",
        CAR: "탄수화물",
        PRO: "단백질",
        FAT: "지방",
        NA: "나트륨",
    };

    const list = [];

    for (const tag in tagList) {
        const key = tagList[tag];
        const value = recipe[`INFO_${tag}`];
        list.push({
            key: key,
            value: value,
        });
    }
    return list;
}

function getIngredientList() {
    const regex =
        /([ㄱ-ㅎ가-힣]+\s*[ㄱ-ㅎ가-힣]+\([^)]+\)\s[0-9]+[A-z가-힣])|([ㄱ-ㅎ가-힣]+\s*[ㄱ-ㅎ가-힣]+\([^)]+\)|\,$)|([ㄱ-ㅎ가-힣]+\s([ㄱ-ㅎ가-힣]+\s)*[0-9\./]+[A-zㄱ-ㅎ가-힣]+)/g;
    const string = recipe.RCP_PARTS_DTLS;
    const ingredientList = string.match(regex);
    const keyReGex = /[가-힣]+((\s[가-힣]+)|\([A-z가-힣]+\))*/;
    const valueReGex = /[0-9/\.½¼]+[가-힣A-z]+/;

    const list = [];

    for (let index = 0; index < ingredientList.length; index++) {
        const key = ingredientList[index].match(keyReGex)[0];
        const value = ingredientList[index].match(valueReGex)[0];

        list.push({
            key: key,
            value: value,
        });
    }

    return list;
}

function createRecipeSteps() {
    const recipeSteps = document.createElement("div");
    recipeSteps.id = "recipe-steps";

    const stepsTitle = document.createElement("div");
    stepsTitle.id = "steps-title";
    stepsTitle.innerText = "조리 순서";
    recipeSteps.appendChild(stepsTitle);

    const list = getStepsList();

    for (const index in list) {
        const step = document.createElement("div");
        step.className = "step";
        recipeSteps.appendChild(step);

        const stepImage = document.createElement("div");
        stepImage.className = "step-img";
        stepImage.style.backgroundImage = `url("${list[index].img}")`;
        step.appendChild(stepImage);

        const stepInfo = document.createElement("div");
        stepInfo.className = "step-info";
        step.appendChild(stepInfo);

        const stepNum = document.createElement("span");
        stepNum.className = "step-num";
        stepNum.innerText = `Step ${list[index].num}`;
        stepInfo.appendChild(stepNum);

        const stepDetail = document.createElement("p");
        stepDetail.className = "step-detail";
        stepDetail.innerHTML = list[index].text;
        stepInfo.appendChild(stepDetail);
    }

    return recipeSteps;
}

function getStepsList() {
    const list = [];

    let index = 0;
    let indexStr = "";
    let manual;
    do {
        index++;
        indexStr = String(index).padStart(2, "0");
        manual = replaceAll(recipe[`MANUAL${indexStr}`], "\n", "<br>").substring(2);
        manualImage = recipe[`MANUAL_IMG${indexStr}`];

        list.push({
            num: index,
            text: manual,
            img: manualImage,
        });
    } while (manual !== "");
    list.pop();
    return list;
}

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

function handleThumbnailDoesntExist(imageURL, recipe) {
    if (imageURL === "" || imageURL === "http://www.foodsafetykorea.go.kr/") {
        let index = 0;
        let indexStr = "";
        let prevImage;
        while (true) {
            index++;
            indexStr = String(index).padStart(2, "0");
            if (recipe[`MANUAL_IMG${indexStr}`] === "") {
                imageURL = prevImage;
                break;
            }
            prevImage = recipe[`MANUAL_IMG${indexStr}`];
        }
    }
    return imageURL;
}
