
// Get HTML elements

const form = document.getElementById("transaction-form");

const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const transactionList = document.getElementById("transaction-list");

const totalIncome = document.getElementById("total-income");
const totalExpenses = document.getElementById("total-expenses");
const balance = document.getElementById("balance");

const monthFilter = document.getElementById("month-filter");
const monthlyExpenses = document.getElementById("monthly-expenses");
const topCategory = document.getElementById("top-category");

const expenseChart = document.getElementById("expense-chart");
const filterType = document.getElementById("filter-type");
const filterCategory = document.getElementById("filter-category");


// Transaction data
// Load saved transactions


let transactions = JSON.parse(localStorage.getItem("transactions")) || [];



// Save transactions


function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}



// Add transaction


form.addEventListener("submit", function (event) {

    event.preventDefault();

    const type = typeInput.value;
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const description = descriptionInput.value.trim();


    
    // Validation
    

    if (!type) {
        alert("Please select a transaction type.");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Please enter an amount greater than 0.");
        amountInput.focus();
        return;
    }

    if (!category) {
        alert("Please select a category.");
        categoryInput.focus();
        return;
    }

    if (!date) {
        alert("Please select a date.");
        dateInput.focus();
        return;
    }

    if (!description) {
        alert("Please enter a description.");
        descriptionInput.focus();
        return;
    }


  
    // Create transaction
   

    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        category: category,
        date: date,
        description: description
    };


   
    // Add transaction
    

    transactions.push(transaction);

    // Save to Local Storage
    saveTransactions();


    
    // Update page
  

    displayTransactions();
    updateSummary();
    updateMonthlySummary();


    // Clear form
  

    form.reset();

});


function displayTransactions() {

    transactionList.innerHTML = "";

    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;

    // Filter transactions
    const filteredTransactions = transactions.filter(function (transaction) {

        const typeMatch =
            selectedType === "all" ||
            transaction.type === selectedType;

        const categoryMatch =
            selectedCategory === "all" ||
            transaction.category === selectedCategory;

        return typeMatch && categoryMatch;
    });


    // No transactions
    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <p id="no-transactions">
                No transactions found.
            </p>
        `;

        return;
    }


    // Display filtered transactions
    filteredTransactions.forEach(function (transaction) {

        const transactionItem = document.createElement("div");

        transactionItem.className = "transaction-item";


        transactionItem.innerHTML = `

            <div class="transaction-info">

                <h4>${transaction.description}</h4>

                <p>
                    ${transaction.category} |
                    ${transaction.date}
                </p>

            </div>


            <div class="transaction-amount ${transaction.type}">

                ${transaction.type === "income" ? "+" : "-"}
                ₹${transaction.amount.toFixed(2)}

            </div>


            <div class="transaction-actions">

                <button
                    class="edit-btn"
                    onclick="editTransaction(${transaction.id})">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>

            </div>

        `;


        transactionList.appendChild(transactionItem);

    });

}


// Update income, expenses and balance


function updateSummary() {

    let income = 0;
    let expenses = 0;


    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else {

            expenses += transaction.amount;

        }

    });


    const currentBalance = income - expenses;


    totalIncome.textContent = `₹${income.toFixed(2)}`;

    totalExpenses.textContent = `₹${expenses.toFixed(2)}`;

    balance.textContent = `₹${currentBalance.toFixed(2)}`;

}


// Delete transaction


function deleteTransaction(id) {

    transactions = transactions.filter(function (transaction) {

        return transaction.id !== id;

    });


    // Save updated transactions
    saveTransactions();


    displayTransactions();

    updateSummary();

    updateMonthlySummary();

}


// Edit transaction


function editTransaction(id) {

    const transaction = transactions.find(function (transaction) {

        return transaction.id === id;

    });


    if (!transaction) {
        return;
    }


    // Put transaction values into form

    typeInput.value = transaction.type;

    amountInput.value = transaction.amount;

    categoryInput.value = transaction.category;

    dateInput.value = transaction.date;

    descriptionInput.value = transaction.description;


    // Remove old transaction

    transactions = transactions.filter(function (item) {

        return item.id !== id;

    });


    // Save updated transactions
    saveTransactions();


    displayTransactions();

    updateSummary();

    updateMonthlySummary();


    // Scroll to form

    form.scrollIntoView({
        behavior: "smooth"
    });

}



// Set current month


const today = new Date();

const currentMonth =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0");


monthFilter.value = currentMonth;



// Monthly summary


function updateMonthlySummary() {

    const selectedMonth = monthFilter.value;


    // Get expenses for selected month

    const monthlyTransactions = transactions.filter(function (transaction) {

        return (
            transaction.type === "expense" &&
            transaction.date.startsWith(selectedMonth)
        );

    });


    // Calculate monthly expenses

    let total = 0;


    monthlyTransactions.forEach(function (transaction) {

        total += transaction.amount;

    });


    monthlyExpenses.textContent = `₹${total.toFixed(2)}`;


  
    // Category totals
  

    const categoryTotals = {};


    monthlyTransactions.forEach(function (transaction) {

        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }

        categoryTotals[transaction.category] += transaction.amount;

    });


    
    // Find highest category
    

    let highestCategory = "-";

    let highestAmount = 0;


    for (const category in categoryTotals) {

        if (categoryTotals[category] > highestAmount) {

            highestAmount = categoryTotals[category];

            highestCategory = category;

        }

    }


    topCategory.textContent = highestCategory;


    // Display chart

    displayExpenseChart(categoryTotals);

}



// Category-wise expense chart


function displayExpenseChart(categoryTotals) {

    expenseChart.innerHTML = "";


    const categories = Object.keys(categoryTotals);


    if (categories.length === 0) {

        expenseChart.innerHTML = `
            <p id="no-chart-data">
                No expense data available for this month.
            </p>
        `;

        return;
    }


    const highestAmount =
        Math.max(...Object.values(categoryTotals));


    categories.forEach(function (category) {

        const amount = categoryTotals[category];


        const percentage =
            (amount / highestAmount) * 100;


        const row = document.createElement("div");

        row.className = "chart-row";


        row.innerHTML = `

            <div class="chart-category">
                ${category}
            </div>

            <div class="chart-bar-container">

                <div
                    class="chart-bar"
                    style="width: ${percentage}%">
                </div>

            </div>

            <div class="chart-amount">
                ₹${amount.toFixed(2)}
            </div>

        `;


        expenseChart.appendChild(row);

    });

}



// Change month


monthFilter.addEventListener("change", function () {

    updateMonthlySummary();

});


// Transaction filters


filterType.addEventListener("change", function () {
    displayTransactions();
});

filterCategory.addEventListener("change", function () {
    displayTransactions();
}); 

// Initial display

displayTransactions();

updateSummary();

updateMonthlySummary();