const openFormBtn = document.getElementById("add-btn");
const closeFormBtn = document.getElementById("close-btn");
const formContainer = document.getElementById("form-container");
const form = document.getElementById("expense-form");
const expenseListEl = document.getElementById("expense-list");
const emptyText = document.getElementById("empty-text");
const spentEl = document.getElementById("spent-amount");
const balanceEl = document.getElementById("balance-amount");
const budgetEl = document.getElementById("budget-amount");
const budgetInput = document.getElementById("budget-input");
const emptyState = document.getElementById("empty-state");
const themeToggle = document.getElementById("theme-toggle");

const STORAGE_KEY_EXPENSES = "expenses";
const STORAGE_KEY_BUDGET = "budget";
const STORAGE_KEY_THEME = "theme";

let editExpenseId = null;
let budgetValue = parseFloat(localStorage.getItem(STORAGE_KEY_BUDGET)) || 0;

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenseList));
}

function loadExpenses() {
  const data = localStorage.getItem(STORAGE_KEY_EXPENSES);
  return data ? JSON.parse(data) : [];
}

const expenseList = loadExpenses();

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
  renderExpenses();
  initTheme();
  updateBudgetUI();
});

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || "dark";
  document.body.setAttribute("data-theme", savedTheme);
  updateThemeIcons(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
  const sunIcon = themeToggle.querySelector(".sun-icon");
  const moonIcon = themeToggle.querySelector(".moon-icon");
  if (theme === "dark") {
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
  } else {
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  }
}

themeToggle.addEventListener("click", toggleTheme);

function openForm() {
  formContainer.classList.add("active");
  document.body.classList.add("no-scroll");
  document.getElementById("amount").focus();
  document.getElementById("date").valueAsDate = new Date();
}

function closeForm() {
  form.reset();
  editExpenseId = null;
  document.getElementById("form-title").textContent = "Add New Expense";
  document.getElementById("submit-btn").textContent = "Add Expense";
  formContainer.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

openFormBtn.addEventListener("click", openForm);
closeFormBtn.addEventListener("click", closeForm);

formContainer.addEventListener("click", (e) => {
  if (e.target === formContainer) closeForm();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && formContainer.classList.contains("active")) {
    closeForm();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value;

  if (isNaN(amount) || !category || !date) {
    alert("Please fill in all required fields.");
    return;
  }

  if (editExpenseId) {
    let expense = expenseList.find((item) => item.id === editExpenseId);
    if (expense) {
      expense.amount = amount;
      expense.category = category;
      expense.description = description;
      expense.date = date;
    }
    editExpenseId = null;
  } else {
    expenseList.push({
      id: Date.now(),
      amount,
      category,
      description,
      date,
    });
  }

  saveExpenses();
  renderExpenses();
  closeForm();
});

function renderExpenses() {
  expenseListEl.innerHTML = "";

  if (expenseList.length === 0) {
    emptyText.classList.remove("hidden");
  } else {
    emptyText.classList.add("hidden");
    
    // Sort expenses by date (most recent first)
    const sortedExpenses = [...expenseList].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExpenses.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("list-item");

      li.innerHTML = `
        <div class="expense-info">
          <span class="expense-title">${item.description || "No description"}</span>
          <div class="expense-details">
            <span class="category-tag">${item.category}</span>
            <span>${new Date(item.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="expense-actions">
          <span class="price-tag">Rs. ${item.amount.toLocaleString()}</span>
          <button class="icon-btn edit" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="icon-btn delete" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;

      li.querySelector(".delete").addEventListener("click", () => deleteExpense(item.id));
      li.querySelector(".edit").addEventListener("click", () => openEditForm(item));

      expenseListEl.appendChild(li);
    });
  }
  updateTotals();
}

function deleteExpense(id) {
  if (confirm("Are you sure you want to delete this expense?")) {
    const index = expenseList.findIndex((item) => item.id === id);
    if (index !== -1) {
      expenseList.splice(index, 1);
      saveExpenses();
      renderExpenses();
    }
  }
}

function openEditForm(item) {
  editExpenseId = item.id;
  document.getElementById("amount").value = item.amount;
  document.getElementById("category").value = item.category;
  document.getElementById("description").value = item.description;
  document.getElementById("date").value = item.date;

  document.getElementById("form-title").textContent = "Edit Expense";
  document.getElementById("submit-btn").textContent = "Update Expense";
  
  formContainer.classList.add("active");
  document.body.classList.add("no-scroll");
}

function updateBudgetUI() {
  if (budgetValue === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }
  budgetEl.textContent = `Rs. ${budgetValue.toLocaleString()}`;
  updateTotals();
}

function addBudget() {
  const val = parseFloat(budgetInput.value);
  if (isNaN(val) || val <= 0) {
    alert("Please enter a valid budget amount.");
    return;
  }
  budgetValue = val;
  localStorage.setItem(STORAGE_KEY_BUDGET, budgetValue);
  updateBudgetUI();
}

document.getElementById("add-budget-btn").addEventListener("click", addBudget);

// Allow clicking on budget amount to change it
budgetEl.parentElement.addEventListener("click", () => {
    const newVal = prompt("Enter new monthly budget:", budgetValue);
    if (newVal !== null) {
        const parsed = parseFloat(newVal);
        if (!isNaN(parsed) && parsed > 0) {
            budgetValue = parsed;
            localStorage.setItem(STORAGE_KEY_BUDGET, budgetValue);
            updateBudgetUI();
        }
    }
});

function updateTotals() {
  const total = expenseList.reduce((sum, item) => sum + item.amount, 0);
  const balance = budgetValue - total;

  spentEl.textContent = `Rs. ${total.toLocaleString()}`;
  balanceEl.textContent = `Rs. ${balance.toLocaleString()}`;

  // Visual cues for budget status
  if (total > budgetValue && budgetValue > 0) {
    spentEl.style.color = "var(--danger)";
  } else {
    spentEl.style.color = "var(--success)";
  }

  if (balance < 0) {
    balanceEl.style.color = "var(--danger)";
  } else {
    balanceEl.style.color = "var(--success)";
  }
}