const url = 'https://recruitment.hal.skygate.io/'

function getData(url) {
    fetch(url + "companies")
        .then(response => response.json())
        .then(data => loadDataIntoTable(data))
        .catch(err => console.log(err));
}

async function getTotalIncome(url) {
    let total;
    await fetch(url)
        .then(response => response.json())
        .then(company => total = company.incomes.reduce((a, b) => a + parseFloat(b.value), 0).toFixed(2))
        .catch(err => console.log(err));
    return total
}

async function loadDataIntoTable(data) {
    let id = [];
    let name = [];
    let city = [];
    let total_income = [];

    data.forEach(company => {
        id.push(company.id);
        name.push(company.name);
        city.push(company.city);
        total_income.push(getTotalIncome(url + "incomes/" + company.id));
    });

    total_income = await Promise.all(total_income);

    let tableRows = document.getElementById('table-rows');

    let html = '';

    for (let i = 0; i < id.length; i++) {
        html += '<tr>';
        html += '<td>' + id[i] + '</td>';
        html += '<td>' + name[i] + '</td>';
        html += '<td>' + city[i] + '</td>';
        html += '<td>' + total_income[i] + '</td>';
        html += '</td>';
    }

    tableRows.innerHTML = html;

    sortByIncomesDsc()
}

function sortByIncomesDsc() {

    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) => v1 - v2)(getCellValue(asc ? b : a, idx), getCellValue(asc ? a : b, idx));

    document.querySelector('thead')
    const table = document.querySelector('tbody');
    console.log()
    Array.from(table.querySelectorAll('tr:nth-child(n+1)'))
        .sort(comparer(3, this.asc = !this.asc))
        .forEach(tr => table.appendChild(tr));

}

function init() {
    getData(url)
}

init();