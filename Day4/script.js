// Selecting Elements
const colorInput = document.getElementById('colorInput');
const hexCode = document.getElementById('hexCode');
const rgbCode = document.getElementById('rgbCode');
const hslCode = document.getElementById('hslCode');
const copyHex = document.getElementById('copyHex');
const colorHistory = document.getElementById('colorHistory');

// Convert HEX to RGB
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

// Convert RGB to HSL
const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 50)}%)`;
};

// Update Color Details
const updateColorDetails = (hex) => {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  hexCode.value = hex;
  rgbCode.textContent = rgb;
  hslCode.textContent = rgbToHsl(r, g, b);

  // Add to History
  const li = document.createElement('li');
  li.textContent = hex;
  li.classList.add('list-group-item');
  li.style.backgroundColor = hex;
  li.style.color = '#fff';
  colorHistory.appendChild(li);
};

// Copy HEX Code
copyHex.addEventListener('click', () => {
  navigator.clipboard.writeText(hexCode.value);
  alert('Copied to clipboard!');
});

// Event Listener
colorInput.addEventListener('input', (e) => updateColorDetails(e.target.value));
updateColorDetails(colorInput.value); // Initialize

const color1 = document.getElementById('color1');
const color2 = document.getElementById('color2');
const gradientPreview = document.getElementById('gradientPreview');
const gradientCSS = document.getElementById('gradientCSS');

const updateGradient = () => {
  const gradient = `linear-gradient(to right, ${color1.value}, ${color2.value})`;
  gradientPreview.style.background = gradient;
  gradientCSS.textContent = `background: ${gradient};`;
};

color1.addEventListener('input', updateGradient);
color2.addEventListener('input', updateGradient);
updateGradient(); // Initialize
