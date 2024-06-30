view = {
  drawTable: (parent, columns, data)=>{
    const div = document.querySelector(parent);
    const table = document.createElement('table');
    div.appendChild(table);
    view.drawTableHead(table, columns);
    view.drawTableBody(table, data, columns);
  },
   drawTableHead: (table, columns) => {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    const tableHead = columns.map((column) => {
      let th = document.createElement('th');
      th.className = 'tableStyle';
      th.innerHTML = column.title;
      th.id = column.value;
      tr.appendChild(th); 
    })     

    thead.appendChild(tr);
    table.appendChild(thead);
  },
   drawTableBody: (table, data, columns) => {
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    data.map((user) => {
      const tr = tbody.insertRow();
      columns.map((column) => {
       const th = tr.insertCell();
       th.className = 'tableStyle';
       value = typeof column.value === 'function'? column.value(user) : user[column.value];
       th.innerHTML = value;
      })
    })
    
  }
}

model = {
  dataBase: async (apiUrl) => {
    let result = await fetch(apiUrl)
    .then(async (data) => {
     return  await data.json();
    })
    return result;
  }
}

controller = {
  
  dataTable: async (config) => {
    data = await model.dataBase(config.apiUrl).then(async (data) => {return await data});
    if(data){
      view.drawTable(config.parent, config.columns, Object.values(data.data));
    }
  },
   
}

function getAge(date){
return new Date(date);
}

function getColorLabel(color){
  return `<span style="background-color: ${color}; width: 100%; height: 100%; display: block"></span>`;
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

controller.dataTable(config1);
controller.dataTable(config2);
