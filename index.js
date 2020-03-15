const url = 'https://recruitment.hal.skygate.io/'

let modal = document.getElementById('modal');

document.getElementById('input').addEventListener('keyup', filterByName);

document.getElementById('closeBtn').addEventListener('click', closeCompanyDetails);

window.addEventListener('click', clickOutside);


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

    sortByIncomesDsc();
    addButtonsToRows();
}

function sortByIncomesDsc() {

    document.querySelector('thead')
    const table = document.querySelector('tbody');
    console.log()
    Array.from(table.querySelectorAll('tr:nth-child(n+1)'))
        .sort((a, b) => b.children[3].textContent - a.children[3].textContent)
        .forEach(tr => table.appendChild(tr));
}

function addButtonsToRows() {
    const addDetailBtn = document.getElementsByTagName('tr');

    for (i = 0; i < addDetailBtn.length; i++) {
        addDetailBtn[i].addEventListener('click', showCompanyDetails)
    }
}

function showCompanyDetails() {
    console.log(this.children[1].textContent)
    console.log(document.getElementById('modal-data'))
    modal.style.display = 'block';

}

function closeCompanyDetails() {
    modal.style.display = "none"
}
function clickOutside(e) {
    if (e.target == modal) {
        modal.style.display = "none"
    }
}
function filterByName() {
    const filter = this.value.toLowerCase();
    const rows = document.getElementById("table-rows");
    const tr = rows.getElementsByTagName("tr");
    let hits = 0;

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td.innerText.toLowerCase().indexOf(filter) > -1) {
            tr[i].style.display = '';
            hits++
        }
        else { tr[i].style.display = 'none'; }
    }

    console.log(hits + ' records')

}

function init() {
    getData(url)
}

init();