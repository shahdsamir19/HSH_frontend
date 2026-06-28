const fs = require('fs');
let c = fs.readFileSync('landingPage.html', 'utf8');
if (!c.includes('chatbot.css')) {
  c = c.replace(/<\/head>/i, '<link rel="stylesheet" href="chatbot.css">\n</head>');
}
if (!c.includes('chatbot.js')) {
  c = c.replace(/<\/body>/i, '<script src="chatbot.js"></script>\n</body>');
}
fs.writeFileSync('landingPage.html', c);
console.log('Added chatbot to landingPage');
