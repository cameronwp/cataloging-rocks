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
    const self = this;
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

    // console.log(inputs);

    let inputArr = [];
    objectLoop(inputs, (key, value) => {
      let input = [];
      objectLoop(value.selections, (k, v) => {
        let ret = {};
        let dimension = self.getById('dimensions', k).name;
        let category = self.getById('categories', v).name;
        ret[dimension] = category;
        input.push(ret);
      });
      inputArr.push(input);
    });

    var factorialMatrix = getCombinations(dimensionMatrix, dimensionMatrix.length);

    console.log(inputArr);

    // index of a match
    let matches = [];

    inputArr.forEach(input => {
      factorialMatrix.forEach((fm, index) => {
        if (deepCompare(input, fm)) {
          matches.push(index);
        }
      })
    });

    // set up the matches column
    factorialMatrix.forEach(fm => {
      fm.push({matches: 0});
    });

    // console.log(matches);

    matches.forEach(match => {
      // console.log(factorialMatrix[match]);
      let length = factorialMatrix[match].length;
      factorialMatrix[match][length - 1].matches += 1;
    });

    let headers = [];
    objectLoop(dimensions, (key, value) => {
      headers.push({header: value.name});
    });
    headers.push({header: 'matches'});
    factorialMatrix.unshift(headers);

    // console.log(factorialMatrix);


    // console.log(factorialMatrix);

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

function deepCompare() {
  var i, l, leftChain, rightChain;

  function compare2Objects (x, y) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
      return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
      return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
      (x instanceof Date && y instanceof Date) ||
      (x instanceof RegExp && y instanceof RegExp) ||
      (x instanceof String && y instanceof String) ||
      (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
      return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
      return false;
    }

    if (x.constructor !== y.constructor) {
      return false;
    }

    if (x.prototype !== y.prototype) {
      return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
       return false;
    }

    // Quick checking of one object beeing a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      }
      else if (typeof y[p] !== typeof x[p]) {
        return false;
      }
    }

    for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false;
      }
      else if (typeof y[p] !== typeof x[p]) {
        return false;
      }

      switch (typeof (x[p])) {
        case 'object':
        case 'function':
          leftChain.push(x);
          rightChain.push(y);

          if (!compare2Objects (x[p], y[p])) {
            return false;
          }

          leftChain.pop();
          rightChain.pop();
          break;

        default:
          if (x[p] !== y[p]) {
            return false;
          }
          break;
      }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {

    leftChain = []; //Todo: this can be cached
    rightChain = [];

    if (!compare2Objects(arguments[0], arguments[i])) {
      return false;
    }
  }
  return true;
}

module.exports = stateManager;
