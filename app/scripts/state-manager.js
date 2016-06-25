const remote = require('electron').remote;
const app = remote.app;

const tempFile = app.getPath('appData') + '/temp.json';

const nconf = require('nconf').file({file: tempFile});

function StateManager() {
  const self = this;
  this.generateCSV = () => {
    // loop and build!
  };
};

StateManager.prototype = {
  init() {
    const self = this;
    nconf.load(function() {
      if (!nconf.get('inputs')) { nconf.set('inputs', {}); }
      if (!nconf.get('dimensions')) { nconf.set('dimensions', {}); }
      if (!nconf.get('categories')) { nconf.set('categories', {}); }
      self.refresh();
    });
  },
  refresh(type) {
    if (type) {
      this[type] = nconf.get(type);
    } else {
      this.inputs = nconf.get('inputs');
      this.dimensions = nconf.get('dimensions');
      this.categories = nconf.get('categories');
    }
  },
  getAll(type) {
    return this[type];
  },
  getById(type, id) {
    let ret = null;
    try {
      ret = this[type][id];
    } catch (e) {
      // doesn't exist
    }
    return ret;
  },
  set(type, id, key, value) {
    const self = this;
    return new Promise(function(resolve, reject) {
      let obj = null;
      try {
        obj = getById(type, id);
      } catch (e) {
        self[type][id] = {};
      }
      self[type][id][key] = value;
      nconf.set(type, self[type]);
      nconf.save();
      self.refresh(type);
      resolve();
    });
  },
  createInput() {
    const id = Math.floor(Math.random() * Math.pow(10, 16));
    const selections = [];
    this.dimensions.forEach(d => selections.push({dimensionId: d.id, selected: -1}));
    return {
      id: id,
      selections: selections
    }
  },
  createDimension(name) {
    const id = Math.floor(Math.random() * Math.pow(10, 16));
    return {
      id: id,
      name: name,
      categories: []
    };
  },
  createCategory(name, dimensionId) {
    const id = Math.floor(Math.random() * Math.pow(10, 16));
    return {
      id: id,
      name: name,
      parent: dimensionId
    }
  },
  clear() {
    const self = this;
    nconf.set('inputs', {});
    nconf.set('dimensions', {});
    nconf.set('categories', {});
    nconf.save();
    self.refresh();
  }
}

module.exports = StateManager;
