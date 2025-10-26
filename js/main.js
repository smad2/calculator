import { getOperatorFunction, formatResult, operation } from "./calculator.js";

document.addEventListener("DOMContentLoaded", () => {
  const dom = {
    allClearBtn: document.getElementById("all-clean"),
    deleteBtn: document.getElementById("delete"),
    addBtn: document.getElementById("add"),
    subtractBtn: document.getElementById("subtract"),
    multiplyBtn: document.getElementById("multiply"),
    divideBtn: document.getElementById("divide"),
    equalBtn: document.getElementById("equal"),
    dotBtn: document.getElementById("dot"),
    buttons: document.getElementById("buttons"),
    display: document.getElementById("display"),
    smallDisplay: document.getElementById("small-display"),
  };
  const btnNumbers = Array.from(document.querySelectorAll(".number"));
  const btnNumberValues = btnNumbers.map((n) => ({
    id: n.id,
    value: n.id.slice(-1),
  }));
  const btnOperators = Array.from(document.querySelectorAll(".operator"));
  const btnOperatorValues = btnOperators.map((n) => ({
    id: n.id,
    symbol: n.textContent,
  }));
  const values = {
    defaultDisplay: "0",
    btnNumberValues: btnNumberValues,
    btnOperatorValues: btnOperatorValues,
    operators: btnOperatorValues.map((op) => op.symbol),
    defaultDisplayFontSize: window.getComputedStyle(dom.display).fontSize,
    defaultSmallDisplayFontSize: window.getComputedStyle(dom.smallDisplay)
      .fontSize,
  };

  createListeners(dom, values);
});

function createListeners(dom, values) {
  let currentOperator = "";
  let lastOperation = "";
  let lastResult = "";

  function doOperation(operator, num1, num2) {
    lastOperation = {
      num1: num1,
      num2: num2,
      operator: operator,
    };
    currentOperator = values.btnOperatorValues.find(
      (op) => op.id === operator.name
    );
    lastResult = operation(operator, num1, num2);
    return lastResult;
  }

  function remove() {
    if (
      dom.display.textContent === "Infinity" ||
      +dom.display.textContent === lastResult
    ) {
      dom.display.textContent = values.defaultDisplay;
    }
    dom.display.textContent.length === 1
      ? (dom.display.textContent = values.defaultDisplay)
      : (dom.display.textContent = dom.display.textContent.slice(0, -1));
  }

  function clearAll() {
    dom.display.textContent = values.defaultDisplay;
    currentOperator = "";
    lastOperation = "";
    dom.smallDisplay.textContent = values.defaultDisplay;
    checkDisplayOverflow();
  }

  function checkDisplayOverflow() {
    //check overflow of display
    const display = dom.display;
    const hasOverflow = display.scrollWidth > display.clientWidth;

    if (hasOverflow) {
      let fontSizeNumber =
        +window.getComputedStyle(dom.display).fontSize.replace("px", "") * 0.75;
      dom.display.style.fontSize = fontSizeNumber + "px";
    } else {
      dom.display.style.fontSize = values.defaultDisplayFontSize;
    }

    //check overflow of small display
    const smallDisplay = dom.smallDisplay;
    const hasOverflowSmall =
      smallDisplay.scrollWidth > smallDisplay.clientWidth;
    if (hasOverflowSmall) {
      let fontSizeNumber =
        +window.getComputedStyle(dom.smallDisplay).fontSize.replace("px", "") *
        0.75;
      dom.smallDisplay.style.fontSize = fontSizeNumber + "px";
    } else {
      dom.smallDisplay.style.fontSize = values.defaultSmallDisplayFontSize;
    }
  }

  const handleRemove = function (target) {
    target === dom.deleteBtn ? remove() : clearAll();
  };

  const handleNumber = function (target) {
    const btnValue = values.btnNumberValues.find((n) => n.id === target);
    if (+dom.display.textContent === lastResult) {
      dom.display.textContent = btnValue.value;
      lastResult = "";
      checkDisplayOverflow();
      return;
    }
    dom.display.textContent === values.defaultDisplay
      ? (dom.display.textContent = btnValue.value)
      : (dom.display.textContent += btnValue.value);
    checkDisplayOverflow();
  };

  const handleOperator = function (target) {
    if (
      values.operators.includes(dom.smallDisplay.textContent.slice(-1)) &&
      dom.display.textContent === values.defaultDisplay
    ) {
      //change operator
      currentOperator = values.btnOperatorValues.find((op) => op.id === target);

      dom.smallDisplay.textContent =
        dom.smallDisplay.textContent.slice(0, -1) + currentOperator.symbol;
      checkDisplayOverflow();

      return;
    } else if (
      values.operators.includes(dom.smallDisplay.textContent.slice(-1)) &&
      dom.display.textContent != values.defaultDisplay
    ) {
      let num1 = +dom.smallDisplay.textContent.slice(0, -1);
      let num2 = +dom.display.textContent;
      let operator = getOperatorFunction(currentOperator.id);
      let result = doOperation(operator, num1, num2);
      currentOperator = values.btnOperatorValues.find((op) => op.id === target);

      dom.smallDisplay.textContent += dom.display.textContent;
      dom.display.textContent = formatResult(result);
      checkDisplayOverflow();

      return;
    }
    currentOperator = values.btnOperatorValues.find((op) => op.id === target);

    let num = +dom.display.textContent;
    if (isNaN(num) || !isFinite(num)) num = 0;

    dom.smallDisplay.textContent =
      dom.display.textContent === values.defaultDisplay ? 0 : num;
    dom.smallDisplay.textContent += currentOperator.symbol;
    dom.display.textContent = values.defaultDisplay;
    lastOperation = "";
    checkDisplayOverflow();
  };

  const handleEqual = function () {
    if (
      dom.smallDisplay.textContent != values.defaultDisplay &&
      currentOperator
    ) {
      if (lastOperation) {
        let result = doOperation(
          lastOperation.operator,
          +dom.display.textContent,
          lastOperation.num2
        );

        dom.smallDisplay.textContent =
          lastOperation.num1 + currentOperator.symbol + lastOperation.num2;
        dom.display.textContent = formatResult(result);
        checkDisplayOverflow();

        return;
      } else {
        let result = doOperation(
          getOperatorFunction(currentOperator.id),
          +dom.smallDisplay.textContent.slice(0, -1),
          +dom.display.textContent
        );
        dom.smallDisplay.textContent += dom.display.textContent;
        dom.display.textContent = formatResult(result);
        checkDisplayOverflow();
      }
    }
  };

  const handleDecimal = function () {
    if (!dom.display.textContent.includes(".")) {
      dom.display.textContent += ".";
    }
    checkDisplayOverflow();
  };

  dom.buttons.addEventListener("click", (e) => {
    const btnType = e.target.classList.item(0);

    switch (btnType) {
      case "remover":
        handleRemove(e.target);
        checkDisplayOverflow();

        break;
      case "number":
        handleNumber(e.target.id);
        break;
      case "operator":
        handleOperator(e.target.id);
        break;
      case "equal":
        handleEqual();
        break;
      case "decimal":
        handleDecimal();
        break;
    }

    // dom.display.textContent += e.target.textContent;
  });

  document.addEventListener("keydown", (e) => {
    console.log(e.key + e.code);
    //Numbers
    if (/^(Digit|Numpad)[0-9]$/.test(e.code)) {
      if (e.key === "/") {
        handleOperator("divide");
        return;
      } else if (e.key === "=") {
        handleEqual();
        return;
      } else {
        handleNumber("num-" + e.code.slice(-1));
        return;
      }
    }
    //Operators
    if (e.key === "*") {
      handleOperator("multiply");
    } else {
      let keyOperator = values.btnOperatorValues.find(
        (op) => op.symbol === e.key
      );
      if (keyOperator) {
        handleOperator(keyOperator.id);
        return;
      }
    }

    //Equal
    if (e.key === "Enter" || e.key === "=") {
      handleEqual();
      return;
    }

    //Remove
    if (e.key === "Backspace") {
      handleRemove(dom.deleteBtn);
      checkDisplayOverflow();

      return;
    } else if (e.key === "Escape") {
      handleRemove(dom.allClearBtn);
      checkDisplayOverflow();

      return;
    }

    //Decimals
    if (e.code === "NumpadDecimal" || e.key === ".") {
      handleDecimal();
      return;
    }
  });
}

//todo:
// 1) repetir ultima operacion si se pincha equal dos veces. OK
// 2) arreglar display cuando hay numeros grandes ok
// 3) añadir decimales (punto). OK
// 4) vista movil OK
// 5) no mostrar NAN, 0 en su lugar OK
// 6) KeyEvents OK
