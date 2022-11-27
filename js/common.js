const searchForm = document.getElementById("search-box");
const filterBtn = document.getElementsByTagName("select")[0];
const insideContainer = document.getElementById("inside-container");
const listTitle = document.getElementById("list-title");
let token = getCookie("token");

let dataSet = [];
let q = new URLSearchParams(window.location.search).get("q");
if (q === null) {
    q = "";
}
const urlBase =
    "https://openapi.foodsafetykorea.go.kr/api/453d17302d4f4fedac86/COOKRCP01/json/";
const PAGE_SIZE = 16;
let page = 1;

if (searchForm) {
    searchForm.addEventListener("submit", searchRecipe);
    filterBtn.addEventListener("change", () => {
        page = 1;
        createRecipeCards();
    });
}
window.addEventListener("load", handleWindowLoad);

async function handleWindowLoad() {
    const notFirstTimeHome = localStorage.getItem("firstTimeHome");
    const notFirstTimeFavs = localStorage.getItem("firstTimeFavs");
    const path = window.location.pathname;

    if (token === "") {
        document.getElementById("log-out").style.display = "none";
        document.getElementById("favs").style.display = "none";
    } else {
        document.getElementById("profile").style.display = "none";
    }

    if (path !== "/html/detail.html") {
        searchForm["q"].value = q;
        removeElementById("paginator-container");
        displayLoadingScreen();
        if (notFirstTimeFavs === null && path === "/html/favs.html") {
            await searchFavs();
            localStorage.setItem("firstTimeFavs", false);
        }

        if (notFirstTimeHome === null && path === "/html/home.html") {
            await searchRecipe();
            localStorage.setItem("firstTimeHome", false);
        }
        await createRecipeCards();
    }
}

async function searchFavs() {
    localStorage.clear();
    dataSet = [];
    removeElementById("empty-container");
    removeElementById("paginator-container");
    removeElementById("loading-container");
    displayLoadingScreen();

    await getAPI("*", false).then(getAPI("*", true));

    if (token !== "") {
        await getUserFavs(token);
    }
    const list = await localStorage.getItem("favs").split(",");

    dataSet = dataSet.filter((data) => {
        for (const index in list) {
            if (data.RCP_SEQ === list[index]) {
                return true;
            }
        }
        return false;
    });
    for (const index in dataSet) {
        localStorage.setItem(index, JSON.stringify(dataSet[index]));
    }
}

function createList() {
    const recipeList = document.createElement("div");
    recipeList.id = "list";
    insideContainer.appendChild(recipeList);

    return recipeList;
}

function removeElementById(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

function displayEmptyList() {
    const emptyContainer = document.createElement("div");
    emptyContainer.id = "empty-container";
    insideContainer.appendChild(emptyContainer);

    const notFoundImage = document.createElement("img");
    notFoundImage.id = "not-found-image";
    notFoundImage.src = "/images/error.png";
    emptyContainer.appendChild(notFoundImage);

    const notFoundText = document.createElement("span");
    notFoundText.id = "not-found-text";
    notFoundText.innerText = "찾으시는 레시피가 없습니다";
    emptyContainer.appendChild(notFoundText);
}

function createRecipeCards() {
    recipeJson = getLocalStorageItems(filterBtn.value);

    window.scrollTo({ top: 0 });
    removeElementById("list");
    removeElementById("empty-container");
    removeElementById("loading-container");
    removeElementById("paginator-container");
    if (recipeJson.length === 0) {
        displayEmptyList();
        return;
    }
    listTitle.style.display = "flex";

    const recipeList = createList();
    const pageIdx = PAGE_SIZE * (page - 1);

    for (let index = 0; index < PAGE_SIZE && recipeJson[index + pageIdx]; index++) {
        const recipe = recipeJson[index + pageIdx];
        recipeList.appendChild(createRecipeCard(recipe));
    }
    favBtns = document.getElementsByClassName("fav-btn");
    favBtnInit(favBtns);

    displayPaginator(recipeJson);
}

function getPageSide(isPrev) {
    const pageSide = document.createElement("a");
    pageSide.className = "page-side";
    pageSide.href = "javascript:;";

    const icon = document.createElement("i");
    pageSide.appendChild(icon);

    if (isPrev) {
        pageSide.id = "page-prev";
        icon.className = "fi fi-bs-angle-left";
    } else {
        pageSide.id = "page-next";
        icon.className = "fi fi-bs-angle-right";
    }
    icon.style.zIndex = "-1";

    pageSide.addEventListener("click", handlepageSideClick);

    return pageSide;
}

function handlepageSideClick(event) {
    if (event.target.id === "page-prev") page--;
    else page++;
    createRecipeCards();
}

function displayPaginator(jsonArr) {
    const paginatorContainer = document.createElement("div");
    paginatorContainer.id = "paginator-container";
    insideContainer.appendChild(paginatorContainer);
    const maxPage = Math.ceil(jsonArr.length / PAGE_SIZE);
    const paginationSize = 7;

    const pagePrev = getPageSide(true);
    paginatorContainer.appendChild(pagePrev);
    if (page === 1) {
        pagePrev.classList.add("page-side-disabled");
        pagePrev.removeEventListener("click", handlepageSideClick);
    }

    const paginator = document.createElement("div");
    paginator.id = "paginator";
    paginatorContainer.appendChild(paginator);

    let count = 0;
    let diffnum = 3;
    const pageDiff = page - maxPage;
    if (pageDiff >= -3) diffnum += pageDiff + 3;

    for (
        let index = page - diffnum;
        count < paginationSize && index <= maxPage;
        index++
    ) {
        if (index >= 1) {
            paginator.appendChild(createPageBtn(index));
            count++;
        }
    }

    const pageNext = getPageSide(false);
    paginatorContainer.appendChild(pageNext);
    if (page === maxPage) {
        pageNext.classList.add("page-side-disabled");
        pageNext.removeEventListener("click", handlepageSideClick);
    }
}

function createPageBtn(num) {
    const pageBlock = document.createElement("button");
    pageBlock.innerText = num;

    if (page === num) {
        pageBlock.id = "page-block-cur";
    } else {
        pageBlock.className = "page-block";
    }

    pageBlock.addEventListener("click", () => {
        page = num;
        createRecipeCards();
    });

    return pageBlock;
}

function checkFav(pk) {
    let favList = localStorage.getItem("favs");
    if (favList !== null) {
        favList = favList.split(",");
        for (const index in favList) {
            if (favList[index] === pk) {
                return true;
            }
        }
    }
    return false;
}

function createRecipeCard(recipe) {
    const recipePK = recipe.RCP_SEQ;
    let imageURL = recipe.ATT_FILE_NO_MAIN;
    const recipeName = recipe.RCP_NM;

    const isFav = checkFav(recipePK);

    const a = document.createElement("a");
    a.href = `./detail.html?pk=${recipePK}&q=${q}`;

    const recipeCard = document.createElement("span");
    recipeCard.className = "recipe-card";
    a.appendChild(recipeCard);

    recipeCard.pk = recipePK;

    const recipeThumbnail = document.createElement("div");
    recipeThumbnail.className = "recipe-thumbnail";
    imageURL = handleThumbnailDoesntExist(imageURL, recipe);
    recipeThumbnail.style.backgroundImage = `url(${imageURL})`;
    recipeCard.appendChild(recipeThumbnail);

    const i1 = document.createElement("i");
    i1.className = "fi fi-ss-heart fav-btn-block";
    recipeThumbnail.appendChild(i1);

    const i2 = document.createElement("i");
    i2.className = "fi fi-rs-heart fav-btn";
    recipeThumbnail.appendChild(i2);

    if (isFav) {
        i1.classList.add("fav-btn-block-active");
        i2.classList.add("hover-fav-btn");
    }
    const recipeInfo = document.createElement("div");
    recipeInfo.className = "recipe-info";
    recipeCard.appendChild(recipeInfo);

    const recipeTitle = document.createElement("span");
    recipeTitle.className = "recipe-title";
    recipeTitle.innerText = recipeName;
    recipeInfo.appendChild(recipeTitle);

    return a;
}

function getLocalStorageItems(filter) {
    recipeJson = [];
    for (let index = 0; localStorage.getItem(index); index++) {
        const recipe = JSON.parse(localStorage.getItem(index));
        if (filter === "전체" || recipe.RCP_PAT2 === filter) {
            recipeJson.push(recipe);
        }
    }
    return recipeJson;
}

function favBtnInit(favBtns) {
    for (const btn of favBtns) {
        const block = btn.parentElement.children[0];
        btn.addEventListener("mouseover", () => {
            btn.classList.add("hover-fav-btn-c");
            btn.classList.add("hover-fav-btn");
            block.classList.add("hover-fav-btn-c");
        });
        btn.addEventListener("mouseout", () => {
            btn.classList.remove("hover-fav-btn-c");
            block.classList.remove("hover-fav-btn-c");
            if (!block.classList.contains("fav-btn-block-active")) {
                btn.classList.remove("hover-fav-btn");
            }
        });
        btn.addEventListener("click", toggleSelected);
    }
}

async function fetcha(page, q) {
    const data = await fetch(`${urlBase}${1 + page}/${1000 + page}/RCP_NM=${q}`)
        .then((response) => response.json())
        .catch(() => setTimeout(() => fetcha(page, q), 200));

    if (typeof (await data) === "number") {
        return await fetcha(page, q);
    }
    return await data;
}

async function getAPI(q, isLast) {
    let page = 0;
    if (isLast) page = 1000;
    await fetcha(page, q).then((data) => {
        const jsonList = data.COOKRCP01.row;
        if (typeof jsonList !== "undefined") {
            for (const index in jsonList) {
                dataSet.push(jsonList[index]);
            }
        }
    });
}

async function getUserFavs() {
    const data = {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: {
            "Content-Type": "application/json",
        },
    };

    fetch("/user/recipe", data)
        .then((response) => response.json())
        .then((data) => {
            const list = data.list.toString();
            localStorage.setItem("favs", list);
        });
}

async function searchRecipe(event) {
    q = "*";
    if (typeof event !== "undefined") {
        event.preventDefault();
        q = searchForm["q"].value;
    }
    localStorage.clear();
    dataSet = [];
    removeElementById("empty-container");
    removeElementById("paginator-container");
    removeElementById("loading-container");
    displayLoadingScreen();

    await getAPI(q, false).then(getAPI(q, true));
    for (const index in dataSet) {
        localStorage.setItem(index, JSON.stringify(dataSet[index]));
    }
    if (token !== "") {
        // await getUserFavs(token);
    }
    if (typeof event !== "undefined") {
        await window.location.replace(`search.html?q=${q}`);
    }
}

async function displayLoadingScreen() {
    listTitle.style.display = "none";

    removeElementById("list");
    const loadingContainer = document.createElement("div");
    loadingContainer.id = "loading-container";
    insideContainer.appendChild(loadingContainer);

    const loadingGif = document.createElement("img");
    loadingGif.id = "loading-gif";
    loadingGif.src = "/images/spin.gif";
    loadingContainer.appendChild(loadingGif);

    const loadingText = document.createElement("span");
    loadingText.id = "loading-text";
    loadingText.innerText = "레시피를 찾는 중입니다";
    loadingContainer.appendChild(loadingText);
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

function getCookie(key) {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var keys = cookies[i].split("=");
        if (keys[0].trim() == key) {
            if (keys[1].trim() != "") {
                return keys[1].trim();
            }
        }
    }
    return "";
}
