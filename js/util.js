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

if (profile) {
    profile.addEventListener("focus", () => focusProfile(false));
    profile.addEventListener("blur", () => focusProfile(true));
    optionLogin.addEventListener("click", () => displayModal("login"));
    optionSignup.addEventListener("click", () => displayModal("signup"));
}
arrow.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
modalCloseBtn.addEventListener("click", closeModal);
signupForm.addEventListener("submit", validatePassword);
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

function toggleSelected(event) {
    event.preventDefault();
    const btn = event.target;
    const block = event.target.parentElement.children[0];
    block.classList.toggle("fav-btn-block-active");
    btn.classList.add("hover-fav-btn");
}

function validatePassword(event) {
    const password1 = signupForm["password1"].value;
    const password2 = signupForm["password2"].value;

    if (password1 === password2) {
        alert("회원가입이 완료되었습니다.");
    } else {
        alert("패스워드가 일치하지 않습니다.");
        event.preventDefault();
    }
}
