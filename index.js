const url = 'https://recruitment.hal.skygate.io/'

let modal = document.getElementById('modal');

document.getElementById('input').addEventListener('keyup', filterByName);

document.getElementById('closeBtn').addEventListener('click', closeCompanyDetails);

window.addEventListener('click', clickOutside);

// fetching data from url and inducing loadDataIntoTable function
function getData(url) {
    fetch(url + "companies")
        .then(response => response.json())
        .then(data => loadDataIntoTable(data))
        .catch(err => console.log(err));
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
        total_income.push(
            getCompanyTotalIncome(url + "incomes/" + company.id)
        )
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

// fetching and calculating incomes of specific compamny by id
async function getCompanyTotalIncome(url) {
    let total;
    await fetch(url)
        .then(response => response.json())
        .then(company => {
            total = company.incomes.reduce((a, b) => a + parseFloat(b.value), 0).toFixed(2);
        })
        .catch(err => console.log(err));
    return total
}

async function getCompanyIncomesData(url) {
    let avarage;
    let last_month_income;
    let incomes;
    await fetch(url)
        .then(response => response.json())
        .then(company => {
            avarage = (company.incomes.reduce((a, b) => a + parseFloat(b.value), 0) / company.incomes.length).toFixed(2);

            const today = new Date();
            let lastMonth = today.getMonth() === 0 ? 12 : (today.getMonth() > 9 ? today.getMonth() : "0" + today.getMonth())
            let yearOfLastMonth = (lastMonth === 12) ? today.getFullYear() - 1 : today.getFullYear();

            last_month_income = company.incomes.reduce(function (prev, curr) {
                if (curr.date.includes(yearOfLastMonth + "-" + lastMonth)) {
                    return prev + parseFloat(curr.value)
                }
                else { return "no income last month (" + (yearOfLastMonth + "-" + lastMonth) + ")" }
            }, 0);

            incomes = company.incomes
                // .map(a => a.date.slice(0, 10))
                .sort((a, b) => {
                    if (a.date < b.date) { return -1 }
                    if (a.date < b.date) { return 1 }
                    return 0
                });
            console.log(incomes)
        })

        .catch(err => console.log(err));
    return [avarage, last_month_income, incomes]
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

async function showCompanyDetails() {
    [avg, last, incomes] = await getCompanyIncomesData(url + "incomes/" + this.children[0].textContent);

    html = '<div>'
    html += "<div> ID: " + this.children[0].textContent + "</div>"
    html += "<div> NAME: " + this.children[1].textContent + "</div>"
    html += "<div> CITY: " + this.children[2].textContent + "</div>"
    html += "<div> TOTAL INCOME: " + this.children[3].textContent + "</div>"
    html += "<div> AVARAGE INCOME: " + avg + "</div>"
    html += "<div> LAST MONTH INCOME (sum): " + last + "</div>"
    html += "</div>"
    modal.children[0].children[1].innerHTML = html

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