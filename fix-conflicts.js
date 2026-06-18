const fs = require('fs');
const files = [
  'src/pages/UploadPage.jsx',
  'src/pages/ApprovalApprovedPage.jsx',
  'src/data/mockData.js'
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf-8');
    const pattern = /<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?\n>>>>>>> frontend\/hilma/g;
    const fixed = content.replace(pattern, '$1');
    fs.writeFileSync(f, fixed, 'utf-8');
    console.log('Fixed: ' + f);
  } catch (e) {
    console.log('Error with ' + f + ': ' + e.message);
  }
});