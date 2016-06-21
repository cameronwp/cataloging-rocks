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
    if (!dimension || typeof dimension !== 'string') { throw new TypeError(); }
    return self.getDimensions().findIndex(d => d.name === dimension);
  }

  this.getDimensions = () => {
    return nconf.get('dimensions');
  }

  this.addDimension = dimension => {
    const foundIndex = findDimensionIndex(dimension);
    if (foundIndex === -1) {
      nconf.get('dimensions').push({name: dimension, categories: []});
      nconf.save();
    }
  };

  this.removeDimension = dimension => {
    const foundIndex = findDimensionIndex(dimension);
    if (foundIndex > -1) {
      nconf.get('dimensions').splice(foundIndex, 1);
      nconf.save();
    }
  };

  this.addCategory = (dimension, category) => {
    const foundIndex = findDimensionIndex(dimension);

    if (foundIndex > -1) {
      const dimension = nconf.get('dimensions')[foundIndex];
      dimension.categories.push(category);
      nconf.save();
    }
  };

  this.removeCategory = (dimension, category) => {
    const foundIndex = findDimensionIndex(dimension);

    if (foundIndex > -1) {
      const dimension = nconf.get('dimensions')[foundIndex];
      dimension.categories.splice(foundIndex, 1);
      nconf.save();
    }
  };

  this.clear = () => {
    nconf.set('dimensions', []);
    nconf.set('inputs', []);
    nconf.save();
  };
};

module.exports = StateManager;
