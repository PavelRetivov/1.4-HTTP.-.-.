  async function DataTable(config) {       
        let data; 
        if(config.hasOwnProperty('apiUrl')){
            data = await dataFind(config.apiUrl).then((data) => {return data});
        }
        const queryDiv = document.querySelectorAll(config.parent);  
        const div = queryDiv[0];
        const table = document.createElement('table');
        div.appendChild(table);
        createTableHead(table, config.columns);
        createTableBody(table, Object.values(data.data), config.columns);
 }

  function createTableHead(table, columns){
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    for (objInColumns of columns){
        const th = document.createElement('th');
        th.className = 'tableStyle';
        th.textContent = Object.values(objInColumns)[0];
        th.id = Object.values(objInColumns)[1];
        tr.appendChild(th);
    }
    thead.appendChild(tr);
    table.appendChild(thead);
 }
  function createTableBody(table, data, columns){
    const tbody = document.createElement('tbody');
   data.forEach(user => {
    const tr = tbody.insertRow();
    columns.forEach(element => {
        const td = tr.insertCell(); 
        td.className = className = 'tableStyle';
        const value = typeof element.value === 'function' ? element.value(user) : user[element.value];
        td.innerHTML = value;
    });
   }); 
   table.appendChild(tbody);
 }
  function getAge(date){
       return new Date(date);
    }
  function getColorLabel(color){
     return `<span style="background-color: ${color}; width: 100%; height: 100%; display: block"></span>`
    }

  async function dataFind(urlApi){
    return data = await fetch(urlApi)
    .then((data) => {
        return data.json()
    });

 }
 
  const config1 = {
   parent: '#usersTable',
   columns: [
     {title: 'Ім’я', value: 'name'},
     {title: 'Прізвище', value: 'surname'},
     {title: 'Вік', value: (user) => getAge(user.birthday)}, // функцію getAge вам потрібно створити
     {title: 'Фото', value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>` }
   ],
   apiUrl: "https://mock-api.shpp.me/<nsurname>/users"
 };
  const config2 = {
    parent: '#productsTable',
    columns: [
      {title: 'Назва', value: 'title'},
      {title: 'Ціна', value: (product) => `${product.price} ${product.currency}`},
      {title: 'Колір', value: (product) => getColorLabel(product.color)}, 
    ],
    apiUrl: "https://mock-api.shpp.me/pretivov/products"
  };
   
 DataTable(config1);

 DataTable(config2);
 