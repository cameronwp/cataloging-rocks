const csv = require('csv');
const StateManager = require('./state-manager');
const stateManager = new StateManager();

var currentDimensions = document.querySelector('.current-dimensions');
var dimensionToAdd = document.querySelector('input#add-dimension');
var dimensionDisplay = document.querySelector('#dimension-display');
var editDimensionsToggle = document.querySelector('#edit');
var clearDimensions = document.querySelector('#clear');
var generateCSV = document.querySelector('#generate');
var editDimensions = document.querySelector('.edit-dimensions');
var dataEntry = document.querySelector('.data-entry');

editDimensionsToggle.onclick = () => {
  editDimensions.classList.toggle('hide');
};

clearDimensions.onclick = () => {
  stateManager.clear();
  refreshDisplay();
};

generateCSV.onclick = () => stateManager.generateCSV();

function createDimensionEdit(dimension) {
  const container = document.createElement('div');
  container.classList.add('dimension-container');

  const name = document.createElement('div');
  name.classList.add('dimension-name');
  name.innerHTML = 'Dimension: ' + dimension.name;

  const removeDimension = document.createElement('button');
  removeDimension.classList.add('left');
  removeDimension.innerText = 'X';

  removeDimension.onclick = function(e) {
    stateManager.removeDimension(dimension.name);
    refreshDisplay();
  };

  name.appendChild(removeDimension);

  const categories = document.createElement('div');
  categories.classList.add('categories');

  function createCategory(cName) {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('create-category');
    const category = document.createElement('span');
    category.innerHTML = 'Category: ' + cName;

    const removeCategory = document.createElement('button');
    removeCategory.classList.add('left');
    removeCategory.innerText = 'X';
    removeCategory.onclick = function(e) {
      stateManager.removeCategory(dimension.name, cName);
      refreshDisplay();
    };

    categoryContainer.appendChild(category);
    categoryContainer.appendChild(removeCategory);

    return categoryContainer;
  }

  dimension.categories.forEach(c => categories.appendChild(createCategory(c)));

  const addCategory = document.createElement('input');
  addCategory.classList.add('add-category');
  addCategory.placeholder = 'new category';

  addCategory.onkeyup = function(e) {
    if (e.keyCode === 13) {
      const category = addCategory.value;
      stateManager.addCategory(dimension.name, category);
      refreshDisplay();
    }
  };

  container.appendChild(name);
  container.appendChild(categories);
  container.appendChild(addCategory);

  return container;
}

function refreshDisplay() {
  dimensionToAdd.value = '';

  if (stateManager.getDimensions().length > 0) {
    const dimensions = stateManager.getDimensions();
    currentDimensions.innerHTML = '';
    dimensionDisplay.innerHTML = '';
    dimensions.forEach(dimension => {
      currentDimensions.appendChild(createDimensionEdit(dimension))
      let tr = document.createElement('tr');
      tr.innerHTML = dimension.name + '<br>' + dimension.categories.map(c => '<em>' + c + '</em>').join('<br>');
      dimensionDisplay.appendChild(tr);
      updateDatalist(dimension);
    });
  } else {
    dimensionDisplay.innerHTML = 'none';
    currentDimensions.innerHTML = 'No dimensions yet';
  }
};

const dataLists = new Proxy({}, {
  set: (obj, prop, value) => {
    if (!obj[prop]) {
      const dl = document.createElement('datalist');
      const info = { element: dl, options: [], id: '_' + value.name + '-datalist' };
      dl.id = info.id;

      value.categories.forEach(c => {
        const o = document.createElement('option');
        o.for = value.name;
        o.value = c;
        dl.appendChild(o);

        info.options.push(c);
      });

      document.body.appendChild(info.element);

      obj[prop] = info;
    } else {
      let info = obj[prop];
      value.categories.forEach(c => {
        if (info.options.indexOf(c) === -1) {
          const o = document.createElement('option');
          o.for = value.name;
          o.value = c;
          info.element.appendChild(o);

          info.options.push(c);
        }
      });
    }
  },
  get: (obj, prop) => obj[prop]
});

function updateDatalist(dimension) {
  dataLists[dimension.name] = dimension;
}

refreshDisplay();

dimensionToAdd.onkeyup = function(e) {
  if (e.keyCode === 13) {
    var dimension = dimensionToAdd.value;
    stateManager.addDimension(dimension);
    refreshDisplay();
  }
};

function addEntryRow() {
  const row = document.createElement('div');
  row.classList.add('input-row');

  stateManager.getDimensions().forEach(dimension => {
    let input = document.createElement('input');
    input.placeholder = dimension.name;
    input.setAttribute('list', dataLists[dimension.name].id);

    row.appendChild(input);
  });

  dataEntry.appendChild(row);
}

addEntryRow();
// input.onkeyup = stateManager.saveInput
