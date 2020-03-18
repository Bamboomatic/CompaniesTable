const url = 'https://recruitment.hal.skygate.io/'

const modal = document.getElementById('modal');
const btns_container = document.getElementById('pagination');

const ctx = document.getElementById('myChart').getContext('2d');
//created empty chart to resolve issue with overlapping graphs with chart.js
let chart = new Chart(ctx, {});
let range = 300;
let number_of_pages = 10;

// global eventListeners
document.getElementById('input').addEventListener('keyup', filterByName);
document.getElementById('range').addEventListener('submit', reloadRange);
document.getElementById('closeBtn').addEventListener('click', closeCompanyDetails);
window.addEventListener('click', clickOutside);

// fetching data from url and inducing loadDataIntoTable function
function getData(url) {
    fetch(url + "companies")
        .then(response => response.json())
        .then(data => loadDataIntoTable(data))
        .catch(err => console.log(err));
}

//populating table data
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
        html += '<tr class="paginated">';
        html += '<td>' + id[i] + '</td>';
        html += '<td>' + name[i] + '</td>';
        html += '<td>' + city[i] + '</td>';
        html += '<td>' + total_income[i] + '</td>';
        html += '</tr>';
    }

    tableRows.innerHTML = html;

    sortByIncomesDsc();
    addButtonsToRows();
    makePagination(id.length, 0);
    createPaginationButtons(number_of_pages);
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

//getting precise info about incomes with calculations
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
                })
                .map(x => ({ ...x, date: x.date.slice(0, 10) }));
        })

        .catch(err => console.log(err));
    return [avarage, last_month_income, incomes]
}

//table sorting dsc
function sortByIncomesDsc() {

    document.querySelector('thead')
    const table = document.querySelector('tbody');
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

//creating modal popup with detailed information 
async function showCompanyDetails() {
    [avg, last, incomes] = await getCompanyIncomesData(url + "incomes/" + this.children[0].textContent);
    // if (myChart) { myChart.destroy() }
    const sumPerMonth = incomes
        .map(x => ({ value: x.value, date: x.date.slice(0, 7) }))
        .reduce((acc, cur) => {
            acc[cur.date] = acc[cur.date] + parseFloat(cur.value) || parseFloat(cur.value);
            return acc;
        }, {});

    html = '<div class="modal-companies-data">'
    html += "<div id='currentID'> ID: <span>" + this.children[0].textContent + "</span></div>"
    html += "<div> NAME: " + this.children[1].textContent + "</div>"
    html += "<div> CITY: " + this.children[2].textContent + "</div>"
    html += "<div id='totalIncome'> TOTAL INCOME: <b>" + this.children[3].textContent + "</b></div>"
    html += "<div id='avgIncome'> AVARAGE INCOME: <b>" + avg + "</b></div>"
    html += "<div> LAST MONTH INCOME (sum): " + last + "</div>"
    html += "</div>"
    document.getElementById('modal-data').innerHTML = html

    makeChart(sumPerMonth, this.children[1].textContent);

    modal.style.display = 'block';
}

// making chart from data, also destroying last chart to fix overlapping canvas
function makeChart(incomes, name) {

    chart.destroy();
    let labels = Object.keys(incomes);
    let values = Object.values(incomes).map(x => x.toFixed(2));

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: name,
                backgroundColor: 'rgb(60, 200, 170)',
                borderColor: 'rgb(50, 150, 130)',
                data: values,
            }]
        },
        options: {}
    });

}

// calculating total and avarage income by dates
function reloadRange(e) {
    e.preventDefault();


    let start_date = document.getElementById('startDate').value;
    let end_date = document.getElementById('endDate').value;
    let avg = document.getElementById('avgIncome').children[0];
    let total = document.getElementById('totalIncome').children[0];


    let range_total = (incomes.reduce((acc, b) => {
        if ((start_date + "-00") <= b.date && b.date <= (end_date + "-32")) {
            acc += parseFloat(b.value)
        } return acc
    }, 0)).toFixed(2);

    let range_avg = (incomes.reduce((acc, b) => {
        if (start_date <= b.date && b.date <= end_date) {
            acc++
        } return acc
    }, 0)).toFixed(2)

    avg.innerText = range_avg > 0 ? (range_total / range_avg).toFixed(2) + " in " + range_avg + " invoices" : range_total;
    total.innerText = range_total + "  - between " + start_date + " and " + end_date;

}

// close button for modal
function closeCompanyDetails() {
    modal.style.display = "none";
}

//close modal when clicking outside modal if you are to lazy to click X 
function clickOutside(e) {
    if (e.target == modal) {
        modal.style.display = "none"
    }
}

//filtering by name function
function filterByName() {
    const filter = this.value.toLowerCase();

    const rows = document.getElementById("table-rows");
    const tr = rows.getElementsByTagName("tr");
    let hits = 0;

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td.innerText.toLowerCase().indexOf(filter) > -1) {
            tr[i].classList.remove("hidden");
            tr[i].classList.add("paginated");
            hits++
        }
        else {
            tr[i].classList.add("hidden");
            tr[i].classList.remove("paginated")
        }
    }

    console.log(hits + ' records matched!');
    range = hits;
    filter.length ? btns_container.style.display = "none" : makePagination();
}

function makePagination(hits = 300, start = 0) {
    btns_container.style.display = "";
    const rows = document.getElementById("table-rows");
    const tr = rows.getElementsByTagName("tr");
    const rows_per_page = 30;
    let number_of_pages = Math.ceil(hits / rows_per_page);
    let j = 0;

    for (let i = 0; i < tr.length; i++) {
        if (j < start) {
            if (hits < rows_per_page) {
                tr[i].className = "paginated";
                // console.log("printed only rows: " + j)
            }
            if (hits > rows_per_page) {
                // console.log("row " + j + " hidden")
                tr[i].className = "hidden";
            }
        }
        if (j >= start && j < (start + 30)) {
            // console.log("printed only rows: " + j)
            tr[i].className = "paginated";
        }
        if (j >= (start + 30)) {
            // console.log("row " + j + " hidden"); 
            tr[i].className = "hidden";
        }
        j++
    }
}

function createPaginationButtons(number_of_pages) {
    let html = '';
    for (let x = 1; x <= number_of_pages; x++) {
        html += '<button class="paginationBtn">' + x + '</button>';
    }
    btns_container.innerHTML = html;
    addPaginationButtonEvents();
}

function addPaginationButtonEvents() {
    btns = document.getElementsByTagName('button');
    for (i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', handlePaginationButtons);
    }
}

function handlePaginationButtons(e) {
    btns = document.getElementsByTagName('button');
    for (i = 0; i < btns.length; i++) {
        btns[i].classList.remove("active");
    }
    makePagination(range, ((e.target.textContent - 1) * 30))
    e.target.classList.add('active')
}

function init() {
    getData(url);
}

init();