const csv = require('csv');
const StateManager = require('./state-manager');

const stateManager = new StateManager();
// stateManager.clear();
var currentDimensions = document.querySelector('.current-dimensions');
var dimensionToAdd = document.querySelector('input#add-dimension');

function createDimensionEdit(dimension) {
  const container = document.createElement('div');
  container.classList.add('dimension-container');

  const name = document.createElement('div');
  name.classList.add('dimension-name');
  name.innerHTML = 'Dimension: ' + dimension.name;

  const removeDimension = document.createElement('button');
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
    removeCategory.innerText = 'X';
    removeCategory.onclick = function(e) {
      var category = cName;
      stateManager.removeCategory(dimension.name, category);
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
    dimensions.forEach(dimension => currentDimensions.appendChild(createDimensionEdit(dimension)));
  } else {
    currentDimensions.innerHTML = 'No dimensions yet';
  }
};

refreshDisplay();

dimensionToAdd.onkeyup = function(e) {
  if (e.keyCode === 13) {
    var dimension = dimensionToAdd.value;
    stateManager.addDimension(dimension);
    refreshDisplay();
  }
}
