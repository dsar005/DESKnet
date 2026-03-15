const fs = require('fs');
const path = require('path');

// 1. Copy index.html to home.html
fs.copyFileSync('index.html', 'home.html');
console.log('✓ Copied index.html to home.html');

// 2. List of HTML files to update (excluding index.html)
const htmlFiles = ['about.html', 'cart.html', 'contact.html', 'faq.html', 'home.html', 'privacy.html', 'product.html', 'refund.html', 'shipping.html', 'shop.html', 'terms.html'];

// Replace href="index.html" with href="home.html" in all HTML files
let filesUpdated = 0;
htmlFiles.forEach(file => {
  const filePath = path.join('.', file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    content = content.replace(/href="index\.html"/g, 'href="home.html"');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesUpdated++;
      console.log(`✓ Updated ${file}`);
    } else {
      console.log(`✓ Processed ${file} (no changes needed)`);
    }
  } catch (err) {
    console.log(`✗ Error processing ${file}: ${err.message}`);
  }
});

console.log('');
console.log('='.repeat(50));
console.log('SUCCESS: All operations completed!');
console.log('='.repeat(50));
console.log(`Files updated: ${filesUpdated}`);
console.log('All HTML files now reference home.html instead of index.html');
