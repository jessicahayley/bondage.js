'use strict';

const parser = require('./parser/parser.js');
const results = require('./results.js');
const DefaultVariableStorage = require('./default-variable-storage.js');
const nodeTypes = require('./parser/nodes.js').types;

class Runner {
  constructor() {
    this.yarnNodes = {};
    this.variables = new DefaultVariableStorage();
    this.functions = {};
    this.visited = {}; // Which nodes have been visited

    this.registerFunction('visited', (args) => {
      return !!this.visited[args[0]];
    });
  }

  /**
  * Loads the yarn node data into this.nodes and strips out unneeded information
  * @param {any[]} data Object of exported yarn JSON data
  */
  load(data) {
    for (const node of data) {
      this.yarnNodes[node.title] = {
        title: node.title,
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

  registerFunction(name, func) {
    if (typeof func !== 'function') {
      throw new Error('Registered function must be...well...a function');
    }

    this.functions[name] = func;
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

    this.visited[startNode] = true;

    // Parse the entire node
    const parserNodes = Array.from(parser.parse(yarnNode.body));
    const yarnNodeData = {
      title:yarnNode.title,
      tags:yarnNode.tags.split(" "),
      body:yarnNode.body,
    }
    yield* this.evalNodes(parserNodes, yarnNodeData);
  }

  /**
   * Evaluate a list of parser nodes, yielding the ones that need to be seen by
   * the user. Calls itself recursively if that is required by nested nodes
   * @param {any[]} nodes
   */
  * evalNodes(nodes, yarnNodeData) {
    if (!nodes) return;

    let selectableNodes = null;

    // Either nodeTypes.Link or nodeTypes.Shortcut depending on which we're accumulating
    // (Since we don't want to accidentally lump shortcuts in with links)
    let selectionType = null;

    // Yield the individual user-visible results
    // Need to accumulate all adjacent selectables into one list (hence some of
    //  the weirdness here)
    for (const node of nodes) {
      if (selectableNodes !== null && node instanceof selectionType) {
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
          selectionType = null;
        }

        if (node instanceof nodeTypes.Text) {
          // Just text to be returned
          yield new results.TextResult(node.text, yarnNodeData);
        } else if (node instanceof nodeTypes.Link) {
          // Start accumulating link nodes
          selectionType = nodeTypes.Link;
          selectableNodes = [node];
        } else if (node instanceof nodeTypes.Shortcut) {
          // Start accumulating shortcut nodes
          selectionType = nodeTypes.Shortcut;
          selectableNodes = [node];
        } else if (node instanceof nodeTypes.Assignment) {
          this.evaluateAssignment(node);
        } else if (node instanceof nodeTypes.Conditional) {
          // Run the results of the conditional
          yield* this.evalNodes(this.evaluateConditional(node));
        } else if (node instanceof nodeTypes.Command) {
          if (node.command === 'stop') {
            // Special command, halt execution
            return;
          }
          yield new results.CommandResult(node.command, yarnNodeData);
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
    if (selections.length > 1 || selections[0] instanceof nodeTypes.Shortcut) {
      // Multiple options to choose from (or just a single shortcut)

      // Filter out any conditional dialog options that result to false
      const filteredSelections = selections.filter((s) => {
        if (s.type === 'ConditionalDialogOptionNode') {
          return this.evaluateExpressionOrLiteral(s.conditionalExpression);
        }

        return true;
      });

      if (filteredSelections.length === 0) {
        // No options to choose anymore
        return;
      }

      const optionResults = new results.OptionsResult(filteredSelections.map((s) => {
        return s.text;
      }));

      yield optionResults;

      if (optionResults.selected !== -1) {
        // Something was selected
        const selectedOption = filteredSelections[optionResults.selected];
        if (selectedOption.content) {
          // Recursively go through the nodes nested within
          yield* this.evalNodes(selectedOption.content);
        } else if (selectedOption.identifier) {
          // Run the new node
          yield* this.run(selectedOption.identifier);
        }
      }
    } else {
      // If there's only one link option, automatically go to it
      yield* this.run(selections[0].identifier);
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
    if (node.type === 'IfNode') {
      if (this.evaluateExpressionOrLiteral(node.expression)) {
        return node.statement;
      }
    } else if (node.type === 'IfElseNode' || node.type === 'ElseIfNode') {
      if (this.evaluateExpressionOrLiteral(node.expression)) {
        return node.statement;
      }

      if (node.elseStatement) {
        return this.evaluateConditional(node.elseStatement);
      }
    } else if (node.type === 'ElseNode') {
      return node.statement;
    }

    return null;
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
      } else if (node.type === 'BooleanExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.booleanExpression);
      } else if (node.type === 'NegatedBooleanExpressionNode') {
        return !this.evaluateExpressionOrLiteral(node.booleanExpression);
      } else if (node.type === 'BooleanOrExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) ||
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'BooleanAndExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) &&
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'BooleanXorExpressionNode') {
        return !this.evaluateExpressionOrLiteral(node.expression1) !== // Cheating
               !this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'EqualToExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) ===
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'NotEqualToExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) !==
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'GreaterThanExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) >
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'GreaterThanOrEqualToExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) >=
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'LessThanExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) <
               this.evaluateExpressionOrLiteral(node.expression2);
      } else if (node.type === 'LessThenOrEqualToExpressionNode') {
        return this.evaluateExpressionOrLiteral(node.expression1) <=
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
      } else if (node.type === 'FunctionResultNode') {
        if (this.functions[node.functionName]) {
          return this.functions[node.functionName](node.args.map(this.evaluateExpressionOrLiteral));
        }

        throw new Error(`Function "${node.functionName}" not found`);
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
  CommandResult: results.CommandResult,
  OptionsResult: results.OptionsResult,
};
