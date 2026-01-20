const openFormBtn = document.getElementById("add-btn");
const closeFormBtn = document.getElementById("close-btn");
const formContainer = document.getElementById("form-container");
const form = document.getElementById("expense-form");

function openForm() {
  formContainer.classList.remove("hidden");
  document.body.classList.add("no-scroll");
  document.getElementById("amount").focus();
}

function closeForm() {
  form.reset();
  formContainer.classList.add("hidden");
  document.body.classList.remove("no-scroll");
}

openFormBtn.addEventListener("click", openForm);

closeFormBtn.addEventListener("click", closeForm);

formContainer.addEventListener("click", (e) => {
  if (e.target === formContainer) {
    closeForm();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !formContainer.classList.contains("hidden")) {
    closeForm();
  }
});
