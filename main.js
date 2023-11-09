var config = {
  gridSize: 16,
  colorIndex: 0,
  colorAttribute: 'rgba(0,0,0, 1)',
  tool: 'brush',
};
var screenGrid = document.querySelector('#screen-grid');
var slider = document.getElementById('grid-size-slider');
var output = document.getElementById('grid-size-label');

output.textContent = `${slider.value} x ${slider.value}`;
slider.oninput = function () {
  output.textContent = `${slider.value} x ${slider.value}`;
};
slider.onchange = function (event) {
  renderGrid(event.target.value);
  config.gridSize = event.target.value;
};

function renderGrid(size = 16) {
  let squareEl = document.createElement('div');
  let cellCount = size * size;
  let squares = [];

  squareEl.classList.add('grid-cell');
  screenGrid.style.setProperty('--n', size);

  while (cellCount-- > 0) {
    const cell = squareEl.cloneNode();
    cell.addEventListener('mouseover', changeColor);
    cell.addEventListener('mousedown', changeColor);
    squares.push(cell);
  }

  screenGrid.replaceChildren(...squares);
}

function isCellClear(currentColorArray) {
  return (
    currentColorArray[0] === currentColorArray[1] &&
    currentColorArray[1] === currentColorArray[2] &&
    currentColorArray[0] === 255
  );
}

function changeColor(e) {
  if (e.buttons !== 1) return;
  if (config.tool === 'brush') {
    e.target.style.backgroundColor = config.colorAttribute;
  } else if (config.tool === 'eraser') {
    e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
  } else if (config.tool === 'shader') {
    debugger;

    let selectedColor = config.colorAttribute;
    let selectedColorArray = selectedColor.replace(/[^\d,]/g, '').split(',');
    let currentColor = getComputedStyle(e.target)
      .getPropertyValue('background-color')
      .replace(/[^\d,.]/g, '');
    let currentColorArray = currentColor.split(',');

    //Ensure that alpha value is present or the calc to find new shading will fail
    if (selectedColorArray.length === 3) selectedColorArray.push(1);
    if (currentColorArray.length === 3) currentColorArray.push(1);

    let currentAlpha = parseFloat(currentColorArray[3]);
    let newAlpha = 0;

    //Dont do anything if its white
    if (
      currentAlpha === 1 ||
      compareColorArrays(selectedColorArray, ['255', '255', '255', '1'])
    ) {
      newAlpha = 1;
    } else {
      let cellClear = isCellClear(currentColorArray);
      newAlpha = cellClear ? 0.1 : currentAlpha + 0.1;
    }

    let newColor = `rgba(${selectedColorArray[0]}, ${selectedColorArray[1]}, ${selectedColorArray[2]}, ${newAlpha})`;

    e.target.style.backgroundColor = newColor;
  } else if (config.tool === 'rainbow') {
    const random = Math.floor(Math.random() * 9);
    const colorAttr = getComputedStyle(
      document.documentElement
    ).getPropertyValue(`--picker-${random}`);

    e.target.style.backgroundColor = colorAttr;
  }
}

function isCellClear(currentColorArray) {
  return (
    currentColorArray[0] === currentColorArray[1] &&
    currentColorArray[1] === currentColorArray[2] &&
    currentColorArray[2] === currentColorArray[3] &&
    currentColorArray[0] === '0'
  );
}

function compareColorArrays(colorArr1, colorArr2) {
  return (
    colorArr1[0] === colorArr2[0] &&
    colorArr1[1] === colorArr2[1] &&
    colorArr1[2] === colorArr2[2]
  );
}

function renderControlsContainer() {
  renderTools();
  renderColorPicker();
}

function renderTools() {
  let toolSelector = document.querySelector('#tool-select');

  toolSelector.addEventListener('click', (event) => {
    let tool = event.target.closest('.tool');
    let classList = tool && [...tool.classList];

    if (!classList || classList.indexOf('tool') === -1) return;

    toolSelector.querySelector('.active').classList.toggle('active');
    tool.classList.toggle('active');
    config.tool = tool.dataset.tool;
  });
}

function renderColorPicker() {
  let colorPickerCt = document.querySelector('#color-picker');
  let colorButtonEl = document.createElement('div');
  let colors = [];

  colorButtonEl.classList.add('color-btn');

  for (let i = 0; i < 9; i++) {
    let div = colorButtonEl.cloneNode();

    div.style['background-color'] = `var(--picker-${i})`;

    if (i === 0) div.classList.add('active');
    colors.push(div);
  }

  colorPickerCt.addEventListener('click', (event) => {
    let classList = [...event.target.classList];

    if (classList.indexOf('color-btn') === -1) return;

    colorPickerCt.querySelector('.active').classList.toggle('active');
    event.target.classList.toggle('active');
    config.colorIndex = Array.prototype.indexOf.call(
      colorPickerCt.children,
      event.target
    );
    config.colorAttribute = getComputedStyle(event.target).getPropertyValue(
      `--picker-${config.colorIndex}`
    );
  });
  colorPickerCt.replaceChildren(...colors);
}

document.querySelector('#clear-btn').addEventListener('click', (event) => {
  renderGrid(config.gridSize);
});

renderControlsContainer();
renderGrid(config.gridSize);
