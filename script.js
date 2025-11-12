// script.js: buat avatar inisial, preview live, dan ekspor PNG/SVG
(() => {
  const nameInput = document.getElementById('nameInput');
  const roleInput = document.getElementById('roleInput');
  const color1 = document.getElementById('color1');
  const color2 = document.getElementById('color2');
  const avatarImg = document.getElementById('avatarImg');
  const avatarWrap = document.getElementById('avatarWrap');
  const displayName = document.getElementById('displayName');
  const displayRole = document.getElementById('displayRole');
  const previewSize = document.getElementById('previewSize');
  const downloadPng = document.getElementById('downloadPng');
  const downloadSvg = document.getElementById('downloadSvg');
  const randomizeBtn = document.getElementById('randomize');
  const transparentBg = document.getElementById('transparentBg');

  // Default name
  function getName(){ return (nameInput.value || 'Ibnu Ramadahan').trim(); }
  function getRole(){ return (roleInput.value || 'Mahasiswa').trim(); }

  // Inisial (maks 2)
  function initials(name){
    const parts = name.split(/\s+/).filter(Boolean);
    if(parts.length === 0) return 'IR';
    if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  }

  // Buat SVG string avatar
  function createAvatarSVG(name, size = 1024, opts = {}) {
    const text = initials(name);
    const c1 = opts.color1 || color1.value;
    const c2 = opts.color2 || color2.value;
    const bg = opts.transparent ? 'none' : `url(#g)`;
    const rx = Math.round(size * 0.08);

    const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${Math.round(size*0.02)}" />
    </filter>
  </defs>

  ${opts.transparent ? '' : `<rect width="100%" height="100%" rx="${rx}" fill="${bg}" />`}

  <g transform="translate(${size/2},${size/2})">
    <circle r="${Math.round(size*0.42)}" fill="rgba(255,255,255,0.04)"/>
    <circle r="${Math.round(size*0.36)}" fill="white" opacity="0.02"/>
  </g>

  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Inter, Arial, sans-serif" font-weight="800"
        font-size="${Math.round(size*0.28)}" fill="rgba(255,255,255,0.98)">${text}</text>
</svg>`;
    return svg;
  }

  // Render preview: set img src to data URL
  function renderPreview() {
    const name = getName();
    displayName.textContent = name;
    displayRole.textContent = getRole();

    const size = 512;
    const svg = createAvatarSVG(name, size, { color1: color1.value, color2: color2.value, transparent: false });
    const svg64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    avatarImg.src = svg64;
    avatarImg.alt = `Avatar ${name}`;

    // update wrapper background gradient for nicer page preview
    avatarWrap.style.background = `linear-gradient(135deg, ${color1.value}, ${color2.value})`;

    // adjust preview size
    const px = parseInt(previewSize.value, 10);
    avatarWrap.style.width = px + 'px';
    avatarWrap.style.height = px + 'px';
  }

  // Download SVG file
  function downloadSVGFile(filename = 'avatar.svg') {
    const svg = createAvatarSVG(getName(), 1024, { color1: color1.value, color2: color2.value, transparent: transparentBg.checked });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Convert SVG to PNG and download
  function downloadPNGFile(filename = 'avatar.png', dimension = 1024) {
    const svg = createAvatarSVG(getName(), dimension, { color1: color1.value, color2: color2.value, transparent: transparentBg.checked });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = dimension;
      canvas.height = dimension;
      const ctx = canvas.getContext('2d');
      // if transparent requested, canvas will keep transparency
      ctx.drawImage(img, 0, 0, dimension, dimension);
      URL.revokeObjectURL(url);
      canvas.toBlob(function(blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, 'image/png');
    };
    img.onerror = function() {
      URL.revokeObjectURL(url);
      alert('Gagal membuat PNG. Coba browser lain (Chrome/Firefox direkomendasikan).');
    };
    img.src = url;
  }

  // Small randomizer for colors
  function randomize() {
    const palettes = [
      ['#7c5cff','#00d2ff'],
      ['#ff7ab6','#ffb86b'],
      ['#6ee7b7','#34d399'],
      ['#ffd166','#ff6b6b'],
      ['#8ec5ff','#6a82fb'],
      ['#a78bfa','#60a5fa']
    ];
    const pick = palettes[Math.floor(Math.random()*palettes.length)];
    color1.value = pick[0];
    color2.value = pick[1];
    renderPreview();
  }

  // Events
  nameInput.addEventListener('input', renderPreview);
  roleInput.addEventListener('input', renderPreview);
  color1.addEventListener('input', renderPreview);
  color2.addEventListener('input', renderPreview);
  previewSize.addEventListener('input', renderPreview);
  randomizeBtn.addEventListener('click', randomize);

  downloadSvg.addEventListener('click', () => {
    const name = getName().replace(/\s+/g, '_');
    downloadSVGFile(`${name}.svg`);
  });

  downloadPng.addEventListener('click', () => {
    const name = getName().replace(/\s+/g, '_') + '.png';
    // default export resolution 1024
    downloadPNGFile(name, 1024);
  });

  // Init
  renderPreview();

})();