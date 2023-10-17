function fetchCarsBeforeYear() {
    const year = document.getElementById('year-input').value;

    fetch(`/cars-before-year/${year}`)
        .then(response => response.json())
        .then(data => {
            createTable(data);
        });
}document.getElementById('search-btn').addEventListener('click', fetchCarsBeforeYear);


function createTable(data) {
    const resultsDiv = document.getElementById('results');
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    data.forEach(item => {
        const tr = document.createElement('tr');
        Object.values(item).forEach(val => {
            const td = document.createElement('td');
            td.textContent = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(table);
}
