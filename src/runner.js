'use strict';

const parser = require('./parser/parser.js');
const results = require('./results.js');

class Runner {
  constructor() {
    this.yarnNodes = {};
  }

  /**
  * Loads the yarn node data into this.nodes and strips out unneeded information
  * @param {any[]} data Object of exported yarn JSON data
  */
  load(data) {
    for (const node of data) {
      this.yarnNodes[node.title] = {
        tags: node.tags,
        body: node.body,
      };
    }
  }

  /**
  * Generator to return each sequential dialogue result starting from the given node
  * @param {string} [startNode] - The name of the yarn node to begin at
  */
  * run(startNode) {
    const yarnNode = this.yarnNodes[startNode];

    if (yarnNode === undefined) {
      throw new Error(`Node "${startNode}" does not exist`);
    }

    // Parse the entire node
    const parserNodes = Array.from(parser.parse(yarnNode.body));
    yield* this.evalNodes(parserNodes);
  }

  /**
   * Evaluate a list of parser nodes, yielding the ones that need to be seen by
   * the user. Calls itself recursively if that is required by nested nodes
   * @param {any[]} nodes
   */
  * evalNodes(nodes) {
    let selectableNodes = null;


    // Yield the individual user-visible results
    // Need to accumulate all adjacent selectables into one list (hence some of
    //  the weirdness here)
    for (const node of nodes) {
      if (selectableNodes !== null && node.selectable) {
        // We're accumulating selection nodes, so add this one to the list
        selectableNodes.push(node);
        // This is not a selectable node, so yield the options first
      } else {
        if (selectableNodes !== null) {
          // We're accumulating selections, but this isn't one, so we're done
          // Need to yield the accumulated selections first
          yield* this.handleSelections(selectableNodes);
          selectableNodes = null;
        }

        if (node.text) {
          if (node.selectable) {
            // Some sort of selectable node, so start accumulating them
            selectableNodes = [node];
          } else {
            // Just text to be returned
            yield new results.TextResult(node.text);
          }
        } else {
          // TODO: evaluate assignments, conditionals, and commands
        }
      }
    }

    if (selectableNodes !== null) {
      // At the end of the node, but we still need to handle any final options
      yield* this.handleSelections(selectableNodes);
    }
  }

  /**
   * yield an options result then handle the subequent selection
   * @param {any[]} selections
   */
  * handleSelections(selections) {
    const optionResults = new results.OptionsResult(selections.map((s) => { return s.text; }));
    yield optionResults;

    if (optionResults.selected !== -1) {
      // Something was selected
      const selectedOption = selections[optionResults.selected];
      if (selectedOption.content) {
        // Recursively go through the nodes nested within
        yield* this.evalNodes(selectedOption.content);
      } else if (selectedOption.identifier) {
        // Run the new node
        yield* this.run(selectedOption.identifier);
      }
    }
  }
}

module.exports = {
  Runner,
  TextResult: results.TextResult,
  OptionResult: results.OptionsResult,
};
