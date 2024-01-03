import "@babel/polyfill";
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
import { booking } from "./stripe";
const loginBtn = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const updateBtn = document.querySelector(".form-user-data");
const updatepassword = document.querySelector(".form-user-password");
const bookingBtn = document.getElementById("book-tour");

if (loginBtn) {
  loginBtn.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // console.log(email, password);
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
if (updateBtn) {
  updateBtn.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "data");
  });
}
if (updatepassword) {
  updatepassword.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating ....";
    const currentPassword = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { currentPassword, password, passwordConfirm },
      "password"
    );
    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}
if (bookingBtn)
  bookingBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.target.textContent = "Processing....";
    const { tourId } = e.target.dataset;
    // console.log(tourId);
    booking(tourId);
  });
