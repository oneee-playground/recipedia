const profile = document.getElementById("profile");
const profileBlocker = document.getElementById("profile-blocker");
const profileOptions = document.getElementById("profile-options");
const optionLogin = document.getElementById("option-login");
const optionSignup = document.getElementById("option-signup");
const arrowContainer = document.getElementById("arrow-container");
const arrow = document.getElementById("arrow-circle");
const modal = document.getElementById("modal");
const modalCloseBtn = document.querySelector("i.fi.fi-br-cross");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const registrationInput = document.getElementsByClassName("registration-input-box");
const logOutBtn = document.getElementById("log-out");

profile.addEventListener("focus", () => focusProfile(false));
profile.addEventListener("blur", () => focusProfile(true));
optionLogin.addEventListener("click", () => displayModal("login"));
optionSignup.addEventListener("click", () => displayModal("signup"));
logOutBtn.addEventListener("click", handleLogOut);
arrow.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
modalCloseBtn.addEventListener("click", closeModal);
signupForm.addEventListener("submit", validatePassword);
loginForm.addEventListener("submit", () =>
    sendAuthorizationRequest(loginForm["username"].value, loginForm["password"].value)
);
window.addEventListener("scroll", displayArrow);

function focusProfile(isFocused) {
    let display = "";
    if (isFocused) {
        display = "none";
    } else {
        display = "block";
    }
    profileBlocker.style.display = display;
    profileOptions.style.display = display;
    return false;
}

function displayArrow() {
    const scrollY = window.scrollY;
    const location = scrollY + window.innerHeight - 150;
    if (scrollY) {
        arrow.style.display = "flex";
        arrowContainer.style.top = `${location}px`;
    } else {
        arrow.style.display = "none";
    }
}

function displayModal(method) {
    modal.style.display = "flex";
    profile.blur();
    if (method === "login") {
        loginForm.style.display = "flex";
    } else if (method === "signup") {
        signupForm.style.display = "flex";
    }
}

function closeModal() {
    modal.style.display = "none";
    signupForm.reset();
    loginForm.reset();
    signupForm.style.display = "none";
    loginForm.style.display = "none";
}

async function handleLogOut() {
    token = getCookie("token");

    const data = {
        method: "DELETE",
        body: JSON.stringify({ token }),
        headers: {
            "Content-Type": "application/json",
        },
    };
    document.cookie = "token=; max-age=0; path=/";

    await fetch("/user/log-out", data);
    await window.location.replace("home.html");
}

function sendRecipeFavRequest(token, pk, isCreation) {
    if (isCreation) {
        const method = "POST";
    } else {
        const method = "DELETE";
    }

    const data = {
        method: method,
        body: JSON.stringify({ token, pk }),
        headers: {
            "Content-Type": "application/json",
        },
    };

    fetch("/recipe/set", data);
}

function toggleSelected(event) {
    event.preventDefault();
    const block = event.target.parentElement.children[0];
    token = getCookie("token");
    if (token !== "") {
        if (block.classList.contains("fav-btn-block-active")) {
            block.classList.remove("fav-btn-block-active");
            sendRecipeFavRequest(token, block.parentElement.parentElement.pk, true);
        } else {
            block.classList.add("fav-btn-block-active");
            sendRecipeFavRequest(token, block.parentElement.parentElement.pk, false);
        }
    } else {
        alert("로그인이 필요합니다");
    }
}

function validatePassword(event) {
    event.preventDefault();
    const password1 = signupForm["password1"].value;
    const password2 = signupForm["password2"].value;

    if (password1 === password2) {
        alert("회원가입이 완료되었습니다.");
    } else {
        alert("패스워드가 일치하지 않습니다.");
        return;
    }

    sendCreateRequest();
}

async function sendCreateRequest() {
    const username = signupForm["username"].value;
    const password = signupForm["password1"].value;

    const data = {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
            "Content-Type": "application/json",
        },
    };

    await fetch("/user/create", data).catch("aa");
    await sendAuthorizationRequest(username, password);
}

async function sendAuthorizationRequest(username, password) {
    const data = {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
            "Content-Type": "application/json",
        },
    };

    await fetch("/user/auth", data)
        .then((response) => response.json())
        .then((data) => {
            document.cookie = `token=${data.token}; max-age=${3600 * 24 * 3}; path=/`;
        });
    await window.location.replace("home.html");
}
