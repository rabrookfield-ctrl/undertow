const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/undertow.js'), 'utf8');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Undertow</title>
  <style>body{margin:0;background:#101515}#gallery{height:100dvh}</style>
</head>
<body>
  <div id="gallery"></div>
  <script>
${source}
  </script>
  <script>
    const gallery = new Undertow(document.getElementById('gallery'), {
      showControls: true,
      showAddPhotos: true
    });
  </script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'undertow-standalone.html'), html);
console.log('Built undertow-standalone.html');
