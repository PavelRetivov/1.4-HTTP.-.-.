class Table {

  #config;

  constructor(config){
    this.config = config;
    this.controller.dataTable(this.config);
    this.boundCloseModalClick = this.controller.closeModalClick.bind(this);
    this.boundKeyPress = this.controller.keyPressEnter.bind(this); 
  }

  view = {
    drawTable: (parent, columns, data)=>{
      const div = document.querySelector(parent);
      const table = document.createElement('table');
      const originData = data[0];
      
      if('input' in this.config.columns[0]){
        const buttonAdd = document.createElement('button');
        buttonAdd.textContent = 'Додати';
        buttonAdd.dataset.id = 'add';
        buttonAdd.className = 'buttonAdd';
        buttonAdd.onclick = this.controller.addUser;
        div.appendChild(buttonAdd);
      }
      
      table.className = 'table';
      div.appendChild(table);
      this.view.drawTableHead(table, columns);
      this.view.drawTableBody(table, originData, columns);
      
    },
     drawTableHead: (table, columns) => {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
  
        columns.map((column) => {
        let th = document.createElement('th');
        th.className = 'tableStyle';
        th.innerHTML = column.title;
        th.id = column.value; 
        tr.appendChild(th)
      })     
      tr.appendChild(this.view.thAction());
    
      thead.appendChild(tr);
      table.appendChild(thead);
    },

     drawTableBody: (table, data, columns) => {
      const tbody = document.createElement('tbody');
      const arrayData = Object.entries(data); 
      table.appendChild(tbody);

      arrayData.map((user) => {
        this.view.createTrElement(user, columns, tbody);
      })
    },
    createTrElement: (user, columns, tbody) => {
      const tr = tbody.insertRow();
      columns.map((column) => {
       const th = tr.insertCell();
       th.className = 'tableStyle';
       const value = typeof column.value === 'function'? column.value(user[1]) : user[1][column.value];
       th.innerHTML = value;
      })
      tr.appendChild(this.view.thDelete(user[0]));
    },
    updateTableAfterRemove: (data) => {
      const originData = Object.keys(data[0]);
      const allButton = document.querySelectorAll(this.config.parent + ' button:not(.buttonAdd)');
      for(const button of allButton){ 
       const id = button.dataset.id;
       const identity = this.view.checkIdentity(id, originData);

       if(!identity){
         const trElement = button.parentElement.parentElement;
         trElement.remove(); 

         break;
       }
      }
    },
    checkIdentity: (id, originData) =>{
      for(const data of originData){
        if(data === id){
          return true;
        }
      }
      return false;
    },
    thAction: () => {
      const th = document.createElement('th');

      th.id = 'action';
      th.innerHTML = 'Дії';
      th.className = 'tableStyle';  

      return th;
    },
    thDelete: (indexUser) => {
      const th = document.createElement('th');
      const button = document.createElement('button');
  
      th.appendChild(button);
      th.id = 'delete';
      th.className = 'tableStyle';
      button.textContent = 'Видалити';
      button.dataset.id = indexUser;
      button.onclick = this.controller.deleteItem;
  
      return th;
    },
    createInput: (div, column, title, value) => {
      const input = document.createElement('input');
      const divGroup = document.createElement('div');
      input.className = 'inputList';
      divGroup.style.padding = '20px 10px 20px 5px'
      divGroup.style.width = '100wh'
      let label;
      if(!column.label){
      input.setAttribute('placeholder', title);
      }
      if(column.type){
      input.type = column.type;
      }
      if(column.name){
      input.name = column.name;
      }else{
      input.name = value;
      }
      if(column.label){
        input.setAttribute('placeholder', input.name);
        label = document.createElement('label');
        label.setAttribute('for', input.name);  
        label.textContent = column.label;
        divGroup.appendChild(label);
      }
      divGroup.appendChild(input);
      div.appendChild(divGroup);
      if(label){
      input.parentNode.insertBefore(label, input);
     }
   }, 
   updateTableAfterAdd: (data) => {
    const originData = Object.keys(data[0]);
    const allButton = document.querySelectorAll(this.config.parent + ' button:not(.buttonAdd)');
    for(const idData of originData){
     const result = this.view.checkId(idData, allButton);
     if(!(result === -1)){
      const tbody = document.querySelector(`${this.config.parent} tbody`);
      const arrayIndexData =  Object.entries(data[0]);
      arrayIndexData.map((user) => {
        if(user[0] === result){
          this.view.createTrElement(user, this.config.columns, tbody);
        }
      })
     }
    }
   },
   checkId: (idData, allButton) => {
    for(const button of allButton){ 
      const id = button.dataset.id; 
      if(idData === id){
        return -1;
      }
    }return idData;
   }
  }
  
 model = {
      dataBase: async (apiUrl) => {
      let result = await fetch(apiUrl);
      return result.json();
    }
  }
  
  controller = {
    isOpen: false,
    isCreate: false,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    button: null,
    press:false,
    divInput: document.createElement('div'),
    dataTable: async (config) => {
      const data = await this.model.dataBase(config.apiUrl);
      if(data){
        this.view.drawTable(config.parent, config.columns, Object.values(data));
      }
    },
     deleteItem: async (event) => {
         const target = event.target;
         const id = target.dataset.id;
         const apiUrl = this.config.apiUrl;
         const res = await this.controller.delete(`${apiUrl}/${id}`);
         const data = await this.model.dataBase(this.config.apiUrl);
         this.controller.updatingTableAfterRemoves();
     },
     delete: async (apiUrl) => {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }); 
      return await response.json();
     },
    updatingTableAfterRemoves: async () => {
      const data = await this.model.dataBase(this.config.apiUrl);
      if(data){
        this.view.updateTableAfterRemove(Object.values(data));
      }
    },
    addUser: (event) =>{
      this.controller.button = event.target;
      this.controller.divInput.className = 'modal-overlay';
      if(!this.controller.isOpen){
      this.config.columns.map((column) => 
       {
         if(!(column.input.length === undefined)){
           for(const input of column.input){
             this.view.createInput(this.controller.divInput, input, column.title, column.value);
           }   
         }else{
           this.view.createInput(this.controller.divInput, column.input, column.title, column.value);
         }
       })
       const body = document.getElementsByTagName('body');
       body[0].appendChild(this.controller.divInput);
       this.controller.isCreate = !this.controller.isCreate;
        this.controller.divInput.style.display = 'flex';
        const positionDivInput = this.controller.divInput.getBoundingClientRect(); 
        this.controller.divInput.style.top = `${this.controller.innerHeight/2- positionDivInput.height/2}px`;
        this.controller.divInput.style.left = `${this.controller.innerWidth/2-positionDivInput.width/2}px`;
      }
      if(this.controller.isOpen){
        this.controller.divInput.innerHTML = '';
        this.controller.divInput.remove();
      }
      this.controller.isOpen=!this.controller.isOpen;
      this.controller.update();
   },
   closeModalClick: (event) => {
      if(document.querySelector('div.modal-overlay')){
      const modal = document.querySelector('div.modal-overlay');
      if(event.target!==this.controller.divInput && event.target !== this.controller.button && this.controller.button!==null &&
      !modal.contains(event.target)){
      if(this.controller.divInput.style.display==='flex'){
        this.controller.closeModalWindow();
        window.removeEventListener('click', this.boundCloseModalClick);
        window.removeEventListener('keypress', this.boundKeyPress);
       }
     }
  };
   },
   closeModalWindow: () =>{
    this.controller.divInput.innerHTML ='';
    this.controller.divInput.remove();
    this.controller.isOpen = !this.controller.isOpen;
   },
   keyPressEnter: async (event) => {
     if(event.key === 'Enter'){
      const inputs = document.querySelectorAll('div.modal-overlay div input');
      if(this.controller.checkFilledCells(inputs)){
      this.controller.closeModalWindow();
      const data = {};  
      inputs.forEach((input) => {
        data[input.name] = input.type === 'number'? Number(input.value) : input.value;
      })
  
      this.controller.addDataOnServer(this.config.apiUrl, data);
     }
    }
   },
   checkFilledCells: (inputs) =>{
    let result = true;
    inputs.forEach((input) => {
      if(input.value === ''){
        input.className = 'red';
        result = false;
      }else{
        input.className= 'green';
      }
    })
    return result;
   },
   searchFreeIndex: (index, busyIndexes) =>{
    busyIndexes.forEach((busyIndex) =>{
      if(index === busyIndex){
        return -1;
      }
    })
    return index;
   },
   updateTableAfterAddDate: async () =>{
    const data = await this.model.dataBase(this.config.apiUrl);
    if(data){
      this.view.updateTableAfterAdd(Object.values(data));
    }
   },
   update: () => {
     if(this.controller.isOpen){
      window.addEventListener('click', this.boundCloseModalClick);
      window.addEventListener('keypress', this.boundKeyPress);
      

      window.addEventListener('resize', ()=>{
         if(document.querySelector('div.modal-overlay')){
           const positionDivInput = this.controller.divInput.getBoundingClientRect(); 
           this.controller.innerHeight = window.innerHeight,
           this.controller.innerWidth = window.innerWidth,
           this.controller.divInput.style.top = `${this.controller.innerHeight/2- positionDivInput.height/2}px`;
           this.controller.divInput.style.left = `${this.controller.innerWidth/2-positionDivInput.width/2}px`;
         }
       });
       }},
   addDataOnServer: async (apiUrl, data) =>{
    try{
    this.controller.closeModalWindow();
    const result = await fetch(apiUrl,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
      console.log('Response status:', result.status); // Код статуса
      console.log('Response status text:', result.statusText); // Текст статуса
      console.log('Response headers:', [...result.headers]); // Заголовки ответа
      if(result.status === 200){
          this.controller.updateTableAfterAddDate();
      }
    }catch(error){
      console.log('error' + error.message);
    }
      }    
     }
   }

function getAge(date){
return new Date(date);
}
function getColorLabel(color){
  return `<span class="spanColor" style="background-color: ${color};"></span>`;
}

const config1 = {
  parent: '#usersTable',
  columns: [
    {title: 'Ім’я', value: 'name'},
    {title: 'Прізвище', value: 'surname'},
    {title: 'Вік', value: (user) => getAge(user.birthday)}, // функцію getAge вам потрібно створити
    {title: 'Фото', value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>` }
  ],
  apiUrl: "https://mock-api.shpp.me/pretivov/users"
};

const config2 = {
  parent: '#productsTable',
  columns: [
    {
      title: 'Назва', 
      value: 'title', 
      input: { type: 'text' }
    },
    {
      title: 'Ціна', 
      value: (product) => `${product.price} ${product.currency}`,
      input: [
        { type: 'number', name: 'price', label: 'Ціна' },
        { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
      ]
    },
    {
      title: 'Колір', 
      value: (product) => getColorLabel(product.color), // функцію getColorLabel вам потрібно створити
      input: { type: 'color', name: 'color' }
    }, 
  ],
  apiUrl: "https://mock-api.shpp.me/pretivov/products"
};
const config3 = {
  parent: '#productsTablee',
  columns: [
    {
      title: 'Назвівіва', 
      value: 'title', 
      input: { type: 'text' }
    },
    {
      title: 'Ціна', 
      value: (product) => `${product.price} ${product.currency}`,
      input: [
        { type: 'number', name: 'price', label: 'Ціна' },
        { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
      ]
    },
    {
      title: 'Колір', 
      value: (product) => getColorLabel(product.color), // функцію getColorLabel вам потрібно створити
      input: { type: 'color', name: 'color' }
    }, 
  ],
  apiUrl: "https://mock-api.shpp.me/pretivov/products"
};

const conf = new Table(config1);
const conf2 = new Table(config2);
const conf3 = new Table(config3);
