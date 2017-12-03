'use strict';

class DefaultVariableStorage {
  constructor() {
    this.data = {};
  }

  set(name, value) {
    this.data[name] = value;
  }

  get(name) {
    return this.data[name];
  }
}

module.exports = DefaultVariableStorage;
