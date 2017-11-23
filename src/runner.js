'use strict';

const results = require('./results.js');
const parser = require('./parser/parser.js');

class Runner {
  constructor() {
    this.nodes = {};
  }

  /**
  * Loads the node data into this.nodes and strips out unneeded information
  * @param [object] data - Object of exported yarn JSON data
  */
  load(data) {
    for (const node of data) {
      this.nodes[node.title] = {
        tags: node.tags,
        body: node.body,
      };
    }
  }

  /**
  * Generator to return each sequential dialogue result starting from the given node
  * @param {string} [startNode] - The name of the node to begin at
  */
  * run(startNode) {
    const curNode = this.nodes[startNode];

    if (curNode === undefined) {
      throw Error(`Node "${startNode}" does not exist`);
    }

    // Dictionary of option text -> name of destination node
    const options = {};
    for (const statement of parser.parse(curNode.body)) {
      switch (statement.type) {
        case 'text':
          yield new results.LineResult(statement.text);
          break;
        case 'option':
          if (statement.text !== undefined) {
            options[statement.text] = statement.dest;
          } else {
            // If we found an option with no text, just make the text the dest as well for now
            // TODO: to follow yarnspinner, we should automatically follow a textless option
            options[statement.dest] = statement.dest;
          }
          break;
        case 'command':
          yield new results.CommandResult(statement.text);
          break;
        default:
          throw Error(`Unknown statement: ${statement}`);
      }
    }

    let nextNode = null;

    if (Object.keys(options).length > 0) {
      const result = new results.OptionsResult(Object.keys(options));
      let choice = null;
      result.choiceCallback = (option) => {
        // We should be given the text for the option
        choice = option;
      };

      yield result;

      if (choice === null) {
        // TODO: Can I make this so if they call next() again after choosing an option it'll still
        // work? Instead of just completely bailing on an error
        throw Error('No option was selected');
      }

      nextNode = options[choice];

      if (nextNode === undefined) {
        throw Error(`Invalid option selected, valid options are: ${Object.keys(options)}`);
      }
    }

    yield new results.NodeCompleteResult(startNode);

    if (nextNode !== null) {
      yield* this.run(nextNode);
    }
  }
}

module.exports = {
  Runner: Runner,
};
