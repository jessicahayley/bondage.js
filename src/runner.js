'use strict';

const parser = require('./parser/parser.js');
const results = require('./results.js');
const DefaultVariableStorage = require('./default-variable-storage.js');
const nodeTypes = require('./parser/nodes.js').types;

class Runner {
  constructor() {
    this.yarnNodes = {};
    this.variables = new DefaultVariableStorage();
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
   * Set a new variable storage object
   * This must simply contain a 'get(name)' and 'set(name, value)' function
   *
   * Calling this function will clear any existing variable's values
   */
  setVariableStorage(storage) {
    if (typeof storage.set !== 'function' || typeof storage.get !== 'function') {
      throw new Error('Variable Storage object must contain both a "set" and "get" function');
    }

    this.variables = storage;
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
      if (selectableNodes !== null && node instanceof nodeTypes.Selectable) {
        // We're accumulating selection nodes, so add this one to the list
        // TODO: handle conditional option nodes
        selectableNodes.push(node);
        // This is not a selectable node, so yield the options first
      } else {
        if (selectableNodes !== null) {
          // We're accumulating selections, but this isn't one, so we're done
          // Need to yield the accumulated selections first
          yield* this.handleSelections(selectableNodes);
          selectableNodes = null;
        }

        if (node instanceof nodeTypes.Text) {
          // Just text to be returned
          yield new results.TextResult(node.text);
        } else if (node instanceof nodeTypes.Selectable) {
          // Some sort of selectable node, so start accumulating them
          selectableNodes = [node];
        } else if (node instanceof nodeTypes.Assignment) {
          this.evaluateAssignment(node);
        } else if (node.conditional instanceof nodeTypes.Conditional) {
          // Run the results of the conditional
          yield* this.evalNodes(this.evaluateConditional(node));
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

  /**
   * Evaluates the given assignment node
   */
  evaluateAssignment(node) {
    let result = this.evaluateExpressionOrLiteral(node.expression);
    const currentVal = this.variables.get(node.variableName);

    if (node.type === 'SetVariableAddNode') {
      result += currentVal;
    } else if (node.type === 'SetVariableMinusNode') {
      result -= currentVal;
    } else if (node.type === 'SetVariableMultiplyNode') {
      result *= currentVal;
    } else if (node.type === 'SetVariableDivideNode') {
      result /= currentVal;
    } else if (node.type === 'SetVariableEqualToNode') {
      // Nothing to be done
    } else {
      throw new Error(`I don't recognize assignment type ${node.type}`);
    }

    this.variables.set(node.variableName, result);
  }

  /**
   * Evaluates the given conditional node
   * Returns the statements to be run as a result of it (if any)
   */
  evaluateConditional(node) {

  }

  /**
   * Evaluates an expression or literal down to its final value
   */
  evaluateExpressionOrLiteral(node) {
    if (node instanceof nodeTypes.Expression) {
      if (node.type === 'UnaryMinusExpressionNode') {
        return -1 * this.evaluateExpressionOrLiteral(node.expression);
      } else if (node.type === 'ArithmeticExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression);
      } else if (node.type === 'ArithmeticExpressionAddNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) +
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'ArithmeticExpressionMinusNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) -
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'ArithmeticExpressionMultiplyNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) *
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'ArithmeticExpressionDivideNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) /
               this.evaluateExpressionOrLiteral(node.expression2);
      }

      throw new Error(`I don't recognize expression type ${node.type}`);
    } else if (node instanceof nodeTypes.Literal) {
      if (node.type === 'NumericLiteralNode') {
        return parseFloat(node.numericLiteral);
      } else if (node.type === 'StringLiteralNode') {
        return node.stringLiteral;
      } else if (node.type === 'BooleanLiteralNode') {
        return node.booleanLiteral === 'true';
      } else if (node.type === 'VariableNode') {
        return this.variables.get(node.variableName);
      }

      throw new Error(`I don't recognize literal type ${node.type}`);
    } else {
      throw new Error(`I don't recognize expression/literal type ${node.type}`);
    }
  }
}

module.exports = {
  Runner,
  TextResult: results.TextResult,
  OptionResult: results.OptionsResult,
};
