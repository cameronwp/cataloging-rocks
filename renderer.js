const csv = require('csv');
const StateManager = require('./state-manager');

const stateManager = new StateManager();
// stateManager.clear();
var currentDimensions = document.querySelector('.current-dimensions');
var removeDimensionsDatalist = document.querySelector('#dimension-list');
var dimensionToAdd = document.querySelector('input#add-dimension');
var dimensionToRemove = document.querySelector('#dimension-to-remove');

function createDimensionEdit() {
  // needs a name
}

function refreshDisplay() {
  dimensionToAdd.value = '';

  removeDimensionsDatalist.innerHTML = '';
  dimensionToRemove.value = '';

  stateManager.getDimensions().forEach(val => {
    var o = document.createElement('option');
    o.for = "remove-dimension";
    o.value = val.name;
    removeDimensionsDatalist.appendChild(o);
  });
  if (stateManager.getDimensions().length > 0) {
    const dimensions = stateManager.getDimensions();
    const names = dimensions.map(name => name.name);
    currentDimensions.innerHTML = names.join(', ');
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
};

dimensionToRemove.onkeyup = function(e) {
  if (e.keyCode === 13) {
    var dimension = dimensionToRemove.value;
    stateManager.removeDimension(dimension);
    refreshDisplay();
  }
};