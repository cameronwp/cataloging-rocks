const remote = require('electron').remote;
const app = remote.app;
const fs = require('fs');
const csv = require('csv');

const tempFile = app.getPath('appData') + '/temp.json';
const nconf = require('nconf').file({file: tempFile});

function StateManager() {};

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
    return new Promise(function(resolve) {
      let obj = null;
      try {
        obj = self.getById(type, id);
      } catch (e) {
        self[type][id] = {};
      }

      if (typeof value === 'undefined') {
        self[type][id] = key;
      } else {
        self[type][id][key] = value;
      }

      nconf.set(type, self[type]);
      nconf.save(function() {
        self.refresh();
        resolve();
      });
    });
  },
  delete(type, id, key) {
    const self = this;
    return new Promise(function(resolve) {
      if (!key) {
        delete self[type][id];
      } else {
        delete self[type][id][key];
      }

      nconf.set(type, self[type]);
      nconf.save(function() {
        self.refresh();
        resolve();
      });
    });
  },
  createInput() {
    const id = Date.now();
    const selections = {};
    return {
      id: id,
      selections: selections
    }
  },
  createDimension(name) {
    const id = Date.now();
    return {
      id: id,
      name: name,
      categories: []
    };
  },
  createCategory(name, dimensionId) {
    const id = Date.now();
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
  },
  loadFile(file) {
    console.log(file);
  },
  saveFile(file) {
    console.log(file);
  },
  generateCSV(file) {
    let dimensions = this.getAll('dimensions');
    let inputs = this.getAll('inputs');

    const tempD = [];
    objectLoop(dimensions, (key, value) => {
      let categories = [];
      objectLoop(value.categories, (k, v) => {
        let cat = {};
        cat[value.name] = v.name;
        categories.push(cat);
      });
      tempD.push(categories);
    });

    const dimensionMatrix = tempD;

    // http://stackoverflow.com/questions/18233874/get-all-the-combinations-of-n-elements-of-multidimensional-array
    function getCombinations(arr, n) {
      var i, j, k, elem, l = arr.length, childperm, ret=[];
      if (n == 1) {
        for(var i = 0; i < arr.length; i++) {
          for(var j = 0; j < arr[i].length; j++) {
            ret.push([arr[i][j]]);
          }
        }
        return ret;
      } else {
        for (i = 0; i < l; i++) {
          elem = arr.shift();
          for (j = 0; j < elem.length; j++) {
            childperm = getCombinations(arr.slice(), n-1);
            for (k = 0; k < childperm.length; k++) {
              ret.push([elem[j]].concat(childperm[k]));
            }
          }
        }
        return ret;
      }
      i = j = k = elem = l = childperm = ret = [] = null;
  }

    var factorialMatrix = getCombinations(dimensionMatrix, dimensionMatrix.length);
    let headers = [];
    objectLoop(dimensions, (key, value) => {
      headers.push({header: value.name});
    });
    factorialMatrix.unshift(headers);

    // csv.stringify(factorialMatrix, function(err, data) {
    //   // process.stdout.write(data);
    //   console.log(data);
    // });
    var fileContent = '';
    csv.transform(factorialMatrix, function(data) {
      return data.map(function(value, index) {
        let key = Object.keys(value)[0];
        return value[key];
      });
    }, function(err, data){
      csv.stringify(data, {header: true}, function(err, data) {
        fileContent = fileContent + data;
        // console.log(fileContent);
        fs.writeFileSync(file, fileContent);
      });
    });
  }
}

var stateManager = new StateManager();
stateManager.init();

function objectLoop(object, callback) {
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      callback(key, object[key]);
    }
  }
}

module.exports = stateManager;
