import { createCalculatorController, displayUtils } from "./controller.js";

// 3. Configuración de la UI
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
    // Map rápida para buscar operador por símbolo (usada en keydown)
    operatorKeyMap: btnOperatorValues.reduce((acc, op) => {
      acc[op.symbol] = op.id;
      return acc;
    }, {}),
    // aliases for common keyboard inputs (e.g. '*' from Shift+8, numpad '*', 'x')
    // we'll fill these after creating the initial map
    defaultDisplayFontSize: window.getComputedStyle(dom.display).fontSize,
    defaultSmallDisplayFontSize: window.getComputedStyle(dom.smallDisplay)
      .fontSize,
  };

  // Add aliases for multiply (and other common alternate keys if desired)
  const multiplyEntry = btnOperatorValues.find(
    (op) => ["×", "*", "x", "X"].includes(op.symbol) || op.id === "multiply"
  );
  if (multiplyEntry) {
    values.operatorKeyMap["*"] = multiplyEntry.id;
    values.operatorKeyMap["×"] = multiplyEntry.id;
    values.operatorKeyMap["x"] = multiplyEntry.id;
    values.operatorKeyMap["X"] = multiplyEntry.id;
    // also support the code name for numpad multiply
    values.operatorKeyMap["NumpadMultiply"] = multiplyEntry.id;
  }
  // Add aliases for divide (slash, division symbol, numpad)
  const divideEntry = btnOperatorValues.find(
    (op) => ["÷", "/"].includes(op.symbol) || op.id === "divide"
  );
  if (divideEntry) {
    values.operatorKeyMap["/"] = divideEntry.id;
    values.operatorKeyMap["÷"] = divideEntry.id;
    values.operatorKeyMap["NumpadDivide"] = divideEntry.id;
  }

  return { dom, values };
}

// controller (moved to separate module)

// 6. Configuración de Event Listeners
function setupEventListeners(dom, values, handlersParam) {
  // handlersParam: object with same shape as previous `handlers` (functions (dom, values, ...))
  const handlersToUse = handlersParam;
  // Bind handlers to dom and values to avoid repeating args and to create a small API
  const boundHandlers = {};
  for (const key in handlersToUse) {
    boundHandlers[key] = (...args) => handlersToUse[key](dom, values, ...args);
  }

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

    // dom.display.textContent += e.target.textContent;
  });

  document.addEventListener("keydown", (e) => {
    // Primero, comprobar si la tecla corresponde a un operador (incluye Shift combinaciones como Shift+7 -> '/')
    let opId = null;
    // Prioriza códigos de teclado especiales (numpad)
    if (e.code === "NumpadMultiply") {
      opId = values.operatorKeyMap["NumpadMultiply"] || values.operatorKeyMap["*"];
    } else if (e.code === "NumpadDivide") {
      opId = values.operatorKeyMap["NumpadDivide"] || values.operatorKeyMap["/"];
    }
    // Si no es numpad, mirar el valor de e.key (tiene en cuenta Shift, por ejemplo '/' cuando se presiona Shift+7)
    if (!opId) opId = values.operatorKeyMap[e.key];
    if (opId) {
      boundHandlers.handleOperator(opId);
      return;
    }

    // Números (Digit y Numpad) - sólo si no se han manejado como operador
    if (/^(Digit|Numpad)[0-9]$/.test(e.code)) {
      boundHandlers.handleNumber("num-" + e.code.slice(-1));
      return;
    }

    // Igual (Enter o =)
    if (e.key === "Enter" || e.key === "=") {
      boundHandlers.handleEqual();
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

// 7. Inicialización
document.addEventListener("DOMContentLoaded", () => {
  const { dom, values } = initializeUI();
  const controller = createCalculatorController();
  setupEventListeners(dom, values, controller.handlers);
});

