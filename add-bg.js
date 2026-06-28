const fs = require('fs');
const files = ['level2.html', 'level4.html', 'level5.html', 'level8.html', 'level9.html', 'level1.html', 'level3.html', 'level7.html'];
files.forEach(f => {
  const p = 'd:/Graduation-Project-main/levels/' + f;
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes('cyber-background.css')) {
    c = c.replace(/<\/head>/i, '<link rel="stylesheet" href="../components/cyber-background.css">\n</head>');
  }
  if (!c.includes('cyber-background.js')) {
    c = c.replace(/<\/body>/i, '<script src="../components/cyber-background.js"></script>\n</body>');
  }
  fs.writeFileSync(p, c);
});
console.log('Done adding cyber-background');
