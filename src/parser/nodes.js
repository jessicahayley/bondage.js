'use strict';

module.exports = {
  RootNode: class {
    constructor(dialogNodes) {
      this.name = 'RootNode';
      this.dialogNodes = dialogNodes || [];
    }
  },

  // /////////////// Dialog Nodes

  DialogNode: class {
    constructor(content, name) {
      this.type = 'DialogNode';
      this.content = name || null;
      this.content = content;
    }
  },

  DialogOptionNode: class {
    constructor(text, content) {
      this.type = 'DialogOptionNode';
      this.text = text;
      this.content = content;
    }
  },

  ConditionalDialogOptionNode: class {
    constructor(text, content, conditionalExpression) {
      this.type = 'ConditionalDialogOptionNode';
      this.text = text;
      this.content = content;
      this.conditionalExpression = conditionalExpression;
    }
  },

  // /////////////// Conditional Nodes
  IfNode: class {
    constructor(expression, statement) {
      this.type = 'IfNode';
      this.expression = expression;
      this.statement = statement;
    }
  },

  IfElseNode: class {
    constructor(expression, statement, elseStatement) {
      this.type = 'IfElseNode';
      this.expression = expression;
      this.statement = statement;
      this.elseStatement = elseStatement;
    }
  },

  ElseNode: class {
    constructor(statement) {
      this.type = 'ElseNode';
      this.statement = statement;
    }
  },

  ElseIfNode: class {
    constructor(expression, statement, elseStatement) {
      this.type = 'ElseIfNode';
      this.expression = expression;
      this.statement = statement;
      this.elseStatement = elseStatement;
    }
  },

  // /////////////// Contents Nodes
  TextNode: class {
    constructor(text) {
      this.type = 'TextNode';
      this.text = text;
    }
  },

  LinkNode: class {
    constructor(text, identifier) {
      this.type = 'LinkNode';
      this.text = text;
      this.identifier = identifier || null;
    }
  },

  // /////////////// Literal Nodes
  NumericLiteralNode: class {
    constructor(numericLiteral) {
      this.type = 'NumericLiteralNode';
      this.literal = numericLiteral;
    }
  },

  StringLiteralNode: class {
    constructor(stringLiteral) {
      this.type = 'StringLiteralNode';
      this.stringLiteral = stringLiteral;
    }
  },

  BooleanLiteralNode: class {
    constructor(booleanLiteral) {
      this.type = 'BooleanLiteralNode';
      this.booleanLiteral = booleanLiteral;
    }
  },

  VariableNode: class {
    constructor(variableName) {
      this.type = 'VariableNode';
      this.variableName = variableName;
    }
  },

  // /////////////// Arithmetic Expression Nodes
  UnaryMinusExpressionNode: class {
    constructor(expression) {
      this.type = 'UnaryMinusExpressionNode';
      this.expression = expression;
    }
  },

  ArithmeticExpressionNode: class {
    constructor(expression) {
      this.type = 'ArithmeticExpressionNode';
      this.expression = expression;
    }
  },

  ArithmeticExpressionAddNode: class {
    constructor(expression1, expression2) {
      this.type = 'ArithmeticExpressionAddNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  ArithmeticExpressionMinusNode: class {
    constructor(expression1, expression2) {
      this.type = 'ArithmeticExpressionMinusNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  ArithmeticExpressionMultiplyNode: class {
    constructor(expression1, expression2) {
      this.type = 'ArithmeticExpressionMultiplyNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  ArithmeticExpressionDivideNode: class {
    constructor(expression1, expression2) {
      this.type = 'ArithmeticExpressionDivideNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  // /////////////// Boolean Expression Nodes

  BooleanExpressionNode: class {
    constructor(booleanExpression) {
      this.type = 'BooleanExpressionNode';
      this.booleanExpression = booleanExpression;
    }
  },

  NegatedBooleanExpressionNode: class {
    constructor(booleanExpression) {
      this.type = 'NegatedBooleanExpressionNode';
      this.booleanExpression = booleanExpression;
    }
  },

  BooleanOrExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'BooleanOrExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  BooleanAndExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'BooleanAndExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  BooleanXorExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'BooleanXorExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  EqualToExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'EqualToExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  NotEqualToExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'EqualToExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  GreaterThanExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'GreaterThanExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  GreaterThanOrEqualToExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'GreaterThanOrEqualToExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  LessThanExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'LessThanExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  LessThanOrEqualToExpressionNode: class {
    constructor(expression1, expression2) {
      this.type = 'LessThanOrEqualToExpressionNode';
      this.expression1 = expression1;
      this.expression2 = expression2;
    }
  },

  // /////////////// Assignment Expression Nodes

  SetVariableEqualToNode: class {
    constructor(variableName, expression) {
      this.type = 'SetVariableEqualToNode';
      this.variableName = variableName;
      this.expression = expression;
    }
  },

  SetVariableAddNode: class {
    constructor(variableName, expression) {
      this.type = 'SetVariableAddNode';
      this.variableName = variableName;
      this.expression = expression;
    }
  },

  SetVariableMinusNode: class {
    constructor(variableName, expression) {
      this.type = 'SetVariableMinusNode';
      this.variableName = variableName;
      this.expression = expression;
    }
  },

  SetVariableMultipyNode: class {
    constructor(variableName, expression) {
      this.type = 'SetVariableMultipyNode';
      this.variableName = variableName;
      this.expression = expression;
    }
  },

  SetVariableDivideNode: class {
    constructor(variableName, expression) {
      this.type = 'SetVariableDivideNode';
      this.variableName = variableName;
      this.expression = expression;
    }
  },

  // /////////////// Function Nodes

  FunctionResultNode: class {
    constructor(functionName, args) {
      this.type = 'FunctionResultNode';
      this.functionName = functionName;
      this.args = args;
    }
  },

  CommandNode: class {
    constructor(command) {
      this.type = 'CommandNode';
      this.command = command;
    }
  },
};
