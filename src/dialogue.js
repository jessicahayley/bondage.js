'use strict';

const EventEmitter = require('events');
const Runner = require('./runner.js').Runner;
const results = require('./results.js');

class Dialogue extends EventEmitter {
  constructor() {
    super();
    this.runner = new Runner();
  }

  /**
  * Return an iterator over the dialogue results. Each dialogue result is yielded after the event
  * is emitted
  * @param {string} [startNode=Start] - Name of the node to start the dialogue from
  * @return {*DialogueResult} An iterator that returns the next DialogueResult in sequence
  */
  * run(startNode) {
    let node = startNode;
    if (node === undefined) {
      node = 'Start';
    }

    this.emit('start');

    for (const result of this.runner.run(node)) {
      if (result instanceof results.LineResult) {
        this.emit('line', result);
      } else if (result instanceof results.OptionsResult) {
        this.emit('options', result);
      } else if (result instanceof results.CommandResult) {
        this.emit('command', result);
      } else if (result instanceof results.NodeCompleteResult) {
        this.emit('nodecomplete', result);
      } else {
        throw Error(`Unrecognized dialogue result: ${result}`);
      }

      yield result;
    }

    this.emit('finish');
  }

  /**
  * Loads the given yarn data. If data has already been loaded, all new nodes
  * will be added, while any nodes that already existed will be updated
  * @param [object] data - Object of exported yarn JSON data
  */
  load(data) {
    this.runner.load(data);
  }
}

module.exports = {
  Dialogue: Dialogue,
};
