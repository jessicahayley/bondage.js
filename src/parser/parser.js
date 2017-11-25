'use strict';

const Parser = require('jison').Parser;
const Nodes = require('./nodes.js');
const Lexer = require('../lexer/lexer.js');

const grammar = {
  operators: [
      ['left', 'Comma'],
      ['left', 'EqualToOrAssign', 'AddAssign', 'MinusAssign', 'MultiplyAssign', 'DivideAssign'],
      ['left', 'Or'],
      ['left', 'And'],
      ['left', 'Xor'],
      ['left', 'EqualTo', 'GreaterThan', 'GreaterThanOrEqualTo', 'LessThan', 'LessThanOrEqualTo', 'NotEqualTo'],
      ['left', 'Add', 'Minus'],
      ['left', 'Multiply', 'Divide'],
      ['left', 'Not'],
      ['left', 'UMINUS'],
      ['left', 'LeftParen', 'RightParen'],
  ],

  start: ['node'],

  bnf: {
    node: [
      ['statements EndOfInput', 'JSON.stringify($1, null, \'  \'); return $1;'],
    ],

    statements: [
      ['statements conditionalStatement', '$$ = $1.concat([$2]);'],
      ['statements statement', '$$ = $1.concat([$2]);'],
      ['conditionalStatement', '$$ = [$1];'],
      ['statement', '$$ = [$1];'],
    ],

    conditionalStatement: [
      ['BeginCommand If expression EndCommand statements BeginCommand EndIf EndCommand', '$$ = new yy.IfNode($3, $5);'],
      ['BeginCommand If expression EndCommand statements additionalConditionalStatements', '$$ = new yy.IfElseNode($3, $5, $6);'],
    ],

    additionalConditionalStatements: [
      ['BeginCommand Else EndCommand statements BeginCommand EndIf EndCommand', '$$ = new yy.ElseNode($4);'],
      ['BeginCommand ElseIf expression EndCommand statements additionalConditionalStatements', '$$ = new yy.ElseIfNode($3, $5, $6);'],
    ],

    statement: [
      ['shortcut', '$$ = $1;'],
      ['command', '$$ = $1;'],
      ['link', '$$ = $1;'],
      ['assignment', '$$ = $1;'],
      ['Text', '$$ = new yy.TextNode($1);'],
    ],

    link: [
      ['OptionStart Text OptionEnd', '$$ = new yy.LinkNode($2);'],
      ['OptionStart Text OptionDelimit Identifier OptionEnd', '$$ = new yy.LinkNode($2, $4);'],
    ],

    shortcut: [
      ['ShortcutOption Text Indent statements Dedent', '$$ = new yy.DialogOptionNode($2, $4);'],
      ['ShortcutOption Text BeginCommand If expression EndCommand Indent statements Dedent', '$$ = new yy.ConditionalDialogOptionNode($2, $8, $5);'],
    ],

    expression: [
      ['True', '$$ = new yy.BooleanLiteralNode($1);'],
      ['False', '$$ = new yy.BooleanLiteralNode($1);'],
      ['Number', '$$ = new yy.NumericLiteralNode($1);'],
      ['String', '$$ = new yy.StringLiteralNode($1);'],
      ['Null', '$$ = new yy.NullLiteralNode($1);'],
      ['Variable', '$$ = new yy.VariableNode($1.substring(1));'],

      ['UnaryMinus Number %prec UnaryMinus', '$$ = new yy.UnaryMinusExpressionNode($2);'],
      ['UnaryMinus Variable %prec UnaryMinus', '$$ = new yy.UnaryMinusExpressionNode($2.substring(1));'],

      ['Not expression', '$$ = new yy.NegatedBooleanExpressionNode($2);'],

      ['LeftParen expression RightParen', '$$ = new yy.ArithmeticExpressionNode($2);'],

      ['expression Add expression', '$$ = new yy.ArithmeticExpressionAddNode($1, $3);'],
      ['expression Minus expression', '$$ = new yy.ArithmeticExpressionMinusNode($1, $3);'],
      ['expression Multiply expression', '$$ = new yy.ArithmeticExpressionMultiplyNode($1, $3);'],
      ['expression Divide expression', '$$ = new yy.ArithmeticExpressionDivideNode($1, $3);'],

      ['expression Or expression', '$$ = new yy.BooleanOrExpressionNode($1, $3);'],
      ['expression And expression', '$$ = new yy.BooleanAndExpressionNode($1, $3);'],
      ['expression Xor expression', '$$ = new yy.BooleanXorExpressionNode($1, $3);'],

      ['expression EqualTo expression', '$$ = new yy.EqualToExpressionNode($1, $3);'],
      ['expression NotEqualTo expression', '$$ = new yy.NotEqualToExpressionNode($1, $3);'],
      ['expression GreaterThan expression', '$$ = new yy.GreaterThanExpressionNode($1, $3);'],
      ['expression GreaterThanOrEqualTo expression', '$$ = new yy.GreaterThanOrEqualToExpressionNode($1, $3);'],
      ['expression LessThan expression', '$$ = new yy.LessThanExpressionNode($1, $3);'],
      ['expression LessThanOrEqualTo expression', '$$ = new yy.LessThanOrEqualToExpressionNode($1, $3);'],

      ['functionResultExpression', '$$ = $1;'],
    ],

    assignment: [
      ['BeginCommand Set Variable EqualToOrAssign expression EndCommand', '$$ = new yy.SetVariableEqualToNode($3.substring(1), $5);'],
      ['BeginCommand Set Variable AddAssign expression EndCommand', '$$ = new yy.SetVariableAddNode($3.substring(1), $5);'],
      ['BeginCommand Set Variable MinusAssign expression EndCommand', '$$ = new yy.SetVariableMinusNode($3.substring(1), $5);'],
      ['BeginCommand Set Variable MultiplyAssign expression EndCommand', '$$ = new yy.SetVariableMultipyNode($3.substring(1), $5);'],
      ['BeginCommand Set Variable DivideAssign expression EndCommand', '$$ = new yy.SetVariableDivideNode($3.substring(1), $5);'],
    ],

    functionResultExpression: [
      ['Identifier LeftParen arguments RightParen', '$$ = new yy.FunctionResultNode($1, $3);'],
    ],

    command: [
      // TODO: not sure why this breaks without also specifying identifiers
      ['BeginCommand Identifier EndCommand', '$$ = new yy.CommandNode($2);'],
      ['BeginCommand Text EndCommand', '$$ = new yy.CommandNode($2);'],
    ],

    arguments: [
      ['arguments Comma argument', '$$ = $1.concat([$3]);'],
      ['argument', '$$ = [$1];'],
    ],

    argument: [
      ['Number', '$$ = new yy.NumericLiteralNode($1);'],
      ['String', '$$ = new yy.StringLiteralNode($1);'],
      ['Variable', '$$ = new yy.VariableNode($1.substring(1));'],
    ],
  },
};

const parser = new Parser(grammar);
parser.lexer = new Lexer();
parser.yy = Nodes;

module.exports = parser;
