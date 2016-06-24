const remote = require('electron').remote;
const app = remote.app;
const fs = require('fs');

var tempFile = null;
if (!process.env.testing) {
  tempFile = app.getPath('appData') + '/temp.json';
} else {
  tempFile = app.getPath('temp') + '/temp.json';
}

const nconf = require('nconf').file({file: tempFile});

nconf.load();
if (!nconf.get('dimensions')) { nconf.set('dimensions', []); }
if (!nconf.get('inputs')) { nconf.set('inputs', []); }

function StateManager() {
  const self = this;

  function findDimensionIndex(dimension) {
    if (!dimension) { throw new TypeError(); }
    const isMatch = self.getDimensions().findIndex(d => d.id === dimension.id || d.name === dimension || d.name === dimension.name);
    return isMatch;
  }

  this.getDimensions = () => {
    return nconf.get('dimensions');
  };

  this.getDimension = dimension => {
    const foundIndex = findDimensionIndex(dimension);
    return this.getDimensions()[foundIndex];
  };

  this.saveDimension = dimension => {
    const foundIndex = findDimensionIndex(dimension);
    if (foundIndex === -1) {
      nconf.get('dimensions').push({
        name: dimension.name,
        categories: dimension.categories || [],
        id: Math.floor(Math.random() * Math.pow(10, 16))
      });
    } else {
      nconf.get('dimensions')[foundIndex] = {
        name: dimension.name,
        categories: dimension.categories || [],
        id: dimension.id
      };
    }
    nconf.save();
  };

  this.removeDimension = dimension => {
    const foundIndex = findDimensionIndex(dimension);
    if (foundIndex > -1) {
      nconf.get('dimensions').splice(foundIndex, 1);
      nconf.save();
    }
  };

  this.saveCategory = (dimension, category) => {
    const dimensionIndex = findDimensionIndex(dimension);

    if (dimensionIndex > -1) {
      const dimension = nconf.get('dimensions')[dimensionIndex];
      
      const categoryIndex = dimension.categories.findIndex(c => +c.id === +category.id);

      if (categoryIndex === -1) {
        dimension.categories.push({
          name: category.name,
          id: Math.floor(Math.random() * Math.pow(10, 16))
        });
      } else {
        dimension.categories[categoryIndex] = category;
      }
        nconf.save();
    }
  };

  this.removeCategory = (dimension, category) => {
    const foundIndex = findDimensionIndex(dimension);

    if (foundIndex > -1) {
      const dimension = nconf.get('dimensions')[foundIndex];
      const categoryIndex = dimension.categories.findIndex(c => +c.id === +category.id);
      const removed = dimension.categories.splice(categoryIndex, 1);
      nconf.save();
    }
  };

  this.getInputs = () => nconf.get('inputs');

  function findInputIndex(input) {
    if (!input) { throw new TypeError(); }
    const isMatch = self.getDimensions().findIndex(d => d.timestamp === input.timestamp);
    return isMatch;
  }

  this.saveInput = input => {
    if (!input.timestamp) { input.timestamp = Date.now(); }
    const inputIndex = findInputIndex(input);

    if (inputIndex === -1) {
      const i = {
        timestamp: input.timestamp
      };
      i[input.property] = input.value;
      nconf.get('inputs').push(i);
    } else {
      nconf.get('inputs')[inputIndex][input.property] = input.value;
    }
    nconf.save();
  };

  this.generateCSV = () => {
    // loop and build!
  };

  this.clear = () => {
    nconf.set('dimensions', []);
    nconf.set('inputs', []);
    nconf.save();
  };
};

module.exports = StateManager;
