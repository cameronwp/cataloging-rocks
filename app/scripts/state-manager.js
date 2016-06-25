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
if (!nconf.get('dimensions')) { nconf.set('dimensions', {}); }
if (!nconf.get('inputs')) { nconf.set('inputs', {}); }

function StateManager() {
  const self = this;

  this.getDimensions = () => {
    return nconf.get('dimensions');
  };

  this.getDimension = dimension => this.getDimensions()[dimension.id];

  this.saveDimension = dimension => {
    if (dimension.id === '') {
      dimension.id = Math.floor(Math.random() * Math.pow(10, 16));
    }
    nconf.get('dimensions')[dimension.id] = {
      name: dimension.name,
      categories: dimension.categories || []
    };
    nconf.save();
  };

  this.removeDimension = dimension => {
    delete nconf.get('dimensions')[dimension.id];
    nconf.save();
  };

  this.saveCategory = (dimensionId, category) => {
    const dbDimension = this.getDimension(dimensionId);

    const categoryIndex = dbDimension.categories.findIndex(c => +c.id === +category.id);

    if (categoryIndex === -1) {
      dbDimension.categories.push({
        name: category.name,
        id: Math.floor(Math.random() * Math.pow(10, 16))
      });
    } else {
      dbDimension.categories[categoryIndex] = category;
    }
    nconf.save();
  };

  this.removeCategory = (dimension, category) => {
    const dbDimension = nconf.get('dimensions')[dimension.id];
    const categoryIndex = dbDimension.categories.findIndex(c => +c.id === +category.id);
    const removed = dbDimension.categories.splice(categoryIndex, 1);
    nconf.save();
  };

  this.getInputs = () => nconf.get('inputs');

  this.saveInput = input => {
    const i = {};
    i[input.property] = input.value;
    nconf.get('inputs')[input.id] = i;
    nconf.save();
  };

  this.removeInput = input => {
    delete nconf.get('inputs')[input.id];
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
