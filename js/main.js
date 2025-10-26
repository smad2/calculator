import { createCalculatorController, displayUtils } from "./controller.js";

function initializeUI() {
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
    operatorKeyMap: btnOperatorValues.reduce((acc, op) => {
      acc[op.symbol] = op.id;
      return acc;
    }, {}),
    defaultDisplayFontSize: window.getComputedStyle(dom.display).fontSize,
    defaultSmallDisplayFontSize: window.getComputedStyle(dom.smallDisplay)
      .fontSize,
  };

  return { dom, values };
}

function setupEventListeners(dom, values, handlersParam) {
  const handlersToUse = handlersParam;
  const boundHandlers = {};
  for (const key in handlersToUse) {
    boundHandlers[key] = (...args) => handlersToUse[key](dom, values, ...args);
  }

  //Click events
  dom.buttons.addEventListener("click", (e) => {
    const btnType = e.target.classList.item(0);

    const actionMap = {
      remover: () => boundHandlers.handleRemove(e.target),
      number: () => boundHandlers.handleNumber(e.target.id),
      operator: () => boundHandlers.handleOperator(e.target.id),
      equal: () => boundHandlers.handleEqual(),
      decimal: () => boundHandlers.handleDecimal(),
    };
    if (actionMap[btnType]) actionMap[btnType]();
  });

  //Keyboard Events
  document.addEventListener("keydown", (e) => {
    // Operators
    let opId = null;
    // Numpad
    if (e.code === "NumpadMultiply" || e.key === "*") {
      opId = values.operatorKeyMap["X"];
    } else if (e.code === "NumpadDivide") {
      opId = values.operatorKeyMap["/"];
    }
    // Check key (*, /...)
    if (!opId) opId = values.operatorKeyMap[e.key];
    if (opId) {
      boundHandlers.handleOperator(opId);
      return;
    }
    //Equal
    if (e.key === "Enter" || e.key === "=") {
      boundHandlers.handleEqual();
      return;
    }

    // Numbers (Digit y Numpad)
    if (/^(Digit|Numpad)[0-9]$/.test(e.code)) {
      boundHandlers.handleNumber("num-" + e.code.slice(-1));
      return;
    }



    // Remove / Clear
    if (e.key === "Backspace") {
      boundHandlers.handleRemove(dom.deleteBtn);
      displayUtils.checkDisplayOverflow(dom, values);
      return;
    }
    if (e.key === "Escape") {
      boundHandlers.handleRemove(dom.allClearBtn);
      displayUtils.checkDisplayOverflow(dom, values);
      return;
    }

    // Decimal
    if (e.code === "NumpadDecimal" || e.key === ".") {
      boundHandlers.handleDecimal();
      return;
    }
  });
}

document.addEventListener("DOMContentLoaded", () =>{
const {dom, values} = initializeUI();
const controller = createCalculatorController();
setupEventListeners(dom, values, controller.handlers)
});




