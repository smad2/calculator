import { getOperatorFunction, formatResult, operation } from "./calculator.js";

// UI utilities for display (moved here so controller is self-contained)
export const displayUtils = {
  // adjust font size of an element based on its overflow
  adjustFontSize(element, defaultSize) {
    const hasOverflow = element.scrollWidth > element.clientWidth;
    if (hasOverflow) {
      const currentSize = window.getComputedStyle(element).fontSize;
      const newSize = +currentSize.replace("px", "") * 0.75;
      element.style.fontSize = `${newSize}px`;
    } else {
      element.style.fontSize = defaultSize;
    }
  },

  // update display content and check overflow
  updateDisplay(dom, values, content, isSmallDisplay = false) {
    const display = isSmallDisplay ? dom.smallDisplay : dom.display;
    display.textContent = content;
    this.checkDisplayOverflow(dom, values);
  },

  // check and adjust both displays for overflow
  checkDisplayOverflow(dom, values) {
    this.adjustFontSize(dom.display, values.defaultDisplayFontSize);
    this.adjustFontSize(dom.smallDisplay, values.defaultSmallDisplayFontSize);
  },

  // Update main display
  updateMainDisplay(dom, values, content, lastResultParam) {
    if (content === lastResultParam || content === "Infinity") {
      content = values.defaultDisplay;
    }
    this.updateDisplay(dom, values, content);
  },
};

// Factory: controlador que encapsula el estado de la calculadora
export function createCalculatorController() {
  let currentOperator = "";
  let lastOperation = "";
  let lastResult = "";

  const operatorUtils = {
    findOperator(values, criteria) {
      return values.btnOperatorValues.find(criteria);
    },

    doOperation(operator, num1, num2, values) {
      lastOperation = { num1, num2, operator };
      currentOperator = this.findOperator(
        values,
        (op) => op.id === operator.name
      );
      lastResult = operation(operator, num1, num2);
      return lastResult;
    },

    // expose state read-only helper for debugging/tests
    getState() {
      return { currentOperator, lastOperation, lastResult };
    },
  };

  const handlers = {
    handleRemove(dom, values, target) {
      if (target === dom.deleteBtn) {
        if (
          dom.display.textContent === "Infinity" ||
          +dom.display.textContent === lastResult
        ) {
          displayUtils.updateDisplay(dom, values, values.defaultDisplay);
          return;
        }
        const newContent =
          dom.display.textContent.length === 1
            ? values.defaultDisplay
            : dom.display.textContent.slice(0, -1);
        displayUtils.updateDisplay(dom, values, newContent);
      } else {
        displayUtils.updateDisplay(dom, values, values.defaultDisplay);
        displayUtils.updateDisplay(dom, values, values.defaultDisplay, true);
        currentOperator = "";
        lastOperation = "";
      }
    },

    handleNumber(dom, values, target) {
      const btnValue = values.btnNumberValues.find((n) => n.id === target);
      if (!btnValue) return;

      if (+dom.display.textContent === lastResult) {
        displayUtils.updateDisplay(dom, values, btnValue.value);
        lastResult = "";
        return;
      }

      const newContent =
        dom.display.textContent === values.defaultDisplay
          ? btnValue.value
          : dom.display.textContent + btnValue.value;
      displayUtils.updateDisplay(dom, values, newContent);
    },

    handleOperator(dom, values, target) {
      if (
        values.operators.includes(dom.smallDisplay.textContent.slice(-1)) &&
        dom.display.textContent === values.defaultDisplay
      ) {
        //change operator
        currentOperator = operatorUtils.findOperator(
          values,
          (op) => op.id === target
        );
        let newContent =
          dom.smallDisplay.textContent.slice(0, -1) + currentOperator.symbol;
        displayUtils.updateDisplay(dom, values, newContent, true);

        return;
      } else if (
        values.operators.includes(dom.smallDisplay.textContent.slice(-1)) &&
        dom.display.textContent != values.defaultDisplay
      ) {
        let num1 = +dom.smallDisplay.textContent.slice(0, -1);
        let num2 = +dom.display.textContent;
        let operator = getOperatorFunction(currentOperator.id);
        let result = operatorUtils.doOperation(operator, num1, num2, values);
        currentOperator = operatorUtils.findOperator(
          values,
          (op) => op.id === target
        );
        let newContent = dom.smallDisplay.textContent + dom.display.textContent;
        displayUtils.updateDisplay(dom, values, newContent, true);
        displayUtils.updateDisplay(dom, values, formatResult(result));
        return;
      }
      currentOperator = operatorUtils.findOperator(
        values,
        (op) => op.id === target
      );

      let num = +dom.display.textContent;
      if (isNaN(num) || !isFinite(num)) num = 0;

      let newContent =
        dom.display.textContent === values.defaultDisplay ? 0 : num;
      newContent += currentOperator.symbol;
      displayUtils.updateDisplay(dom, values, newContent, true);
      displayUtils.updateDisplay(dom, values, values.defaultDisplay);
      lastOperation = "";
    },

    handleEqual(dom, values) {
      if (
        dom.smallDisplay.textContent != values.defaultDisplay &&
        currentOperator
      ) {
        if (lastOperation) {
          let result = operatorUtils.doOperation(
            lastOperation.operator,
            +dom.display.textContent,
            lastOperation.num2,
            values
          );
          let newContent =
            lastOperation.num1 + currentOperator.symbol + lastOperation.num2;
          displayUtils.updateDisplay(dom, values, newContent, true);
          displayUtils.updateDisplay(dom, values, formatResult(result));
          return;
        } else {
          let result = operatorUtils.doOperation(
            getOperatorFunction(currentOperator.id),
            +dom.smallDisplay.textContent.slice(0, -1),
            +dom.display.textContent,
            values
          );
          let newContent =
            dom.smallDisplay.textContent + dom.display.textContent;
          displayUtils.updateDisplay(dom, values, newContent, true);

          displayUtils.updateDisplay(dom, values, formatResult(result));
        }
      }
    },

    handleDecimal(dom, values) {
      if (!dom.display.textContent.includes(".")) {
        displayUtils.updateDisplay(dom, values, dom.display.textContent + ".");
      }
    },
  };

  return {
    handlers,
    getState: () => ({ currentOperator, lastOperation, lastResult }),
  };
}
