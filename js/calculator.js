/**
 * Calculator core functionality module
 * Provides basic arithmetic operations and utility functions
 */

// Basic arithmetic operations
export const add = (num1, num2) => num1 + num2;
export const subtract = (num1, num2) => num1 - num2;
export const multiply = (num1, num2) => num1 * num2;
export const divide = (num1, num2) => num1 / num2;

// Operation executor
export const operation = (operator, num1, num2) => operator(num1, num2);

/**
 * Formats the calculation result
 * @param {number} result - The result to format
 * @returns {number} Formatted result with up to 4 decimal places
 */
export const formatResult = function (result) {
  if (Number.isNaN(result)) {
    return 0;
  }
  return Number.isInteger(result) ? result : Number(result.toFixed(4));
};

/**
 * Maps operator IDs to their corresponding functions
 * @param {string} operatorId - The ID of the operator
 * @returns {Function} The corresponding arithmetic function
 */
export function getOperatorFunction(operatorId) {
  const operatorMap = {
    add,
    subtract,
    multiply,
    divide
  };
  return operatorMap[operatorId];
}
