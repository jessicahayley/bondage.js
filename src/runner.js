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
    const statements = Array.from(parser.parse(yarnNode.body));
    yield* this.evalStatements(statements);
  }

  /**
   * Evaluate a list of statements, yielding the ones that need to be seen by
   * the user. Calls itself recursively if that is required by nested nodes
   * @param {any[]} statements
   */
  * evalStatements(statements) {
    let selectionStatements = null;


    // Yield the individual statements
    // Need to accumulate all adjacent selectables into one list (hence some of
    //  the weirdness here)
    for (const statement of statements) { // esline-disable-line no-restricted-syntax
      if (selectionStatements !== null && statement.selectable) {
        // We're accumulating selection statements, so add this one to the list
        selectionStatements.push(statement);
        // This is not a selectable node, so yield the options first
      } else {
        if (selectionStatements !== null) {
          // We're accumulating selections, but this isn't one, so we're done
          // Need to yield the accumulated selections first
          yield* this.handleSelections(selectionStatements);
        }

        if (statement.text) {
          if (statement.selectable) {
            // Some sort of selectable node, so start accumulating them
            selectionStatements = [statement];
          } else {
            // Just text to be returned
            yield new results.TextResult(statement.text);
          }
        } else {
          // TODO: eval command statements (aka non user-visible commands)
        }
      }
    }

    if (selectionStatements !== null) {
      // At the end of the node, but we still need to handle any final options
      yield* this.handleSelections(selectionStatements);
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
        // Recursively go through the nested statements in the node
        yield* this.evalStatements(selectedOption.content);
      } else if (selectedOption.identifier) {
        // Run the new node
        yield* this.run(selectedOption.identifier);
      }
    }
  }
}

module.exports = Runner;
