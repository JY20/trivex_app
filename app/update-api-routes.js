const fs = require('fs');
const path = require('path');

// Function to recursively find all route.ts files in the api directory
function findApiRoutes(dir, fileList = []) {
  console.log(`Searching in directory: ${dir}`);
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findApiRoutes(filePath, fileList);
      } else if (file === 'route.ts') {
        console.log(`Found route file: ${filePath}`);
        fileList.push(filePath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}: ${error.message}`);
  }
  
  return fileList;
}

// Function to add the static export directives to a file
function addStaticExportDirectives(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the directives are already present
    if (!content.includes('export const dynamic')) {
      // Find the first import statement
      const importIndex = content.indexOf('import');
      
      if (importIndex !== -1) {
        // Find the end of import statements
        let endOfImports = content.indexOf('\n\n', importIndex);
        if (endOfImports === -1) endOfImports = content.indexOf('\n', importIndex);
        
        // Insert the static export directives after the imports
        const newContent = 
          content.slice(0, endOfImports + 1) + 
          '\nexport const dynamic = "force-static";\nexport const revalidate = false;\n' + 
          content.slice(endOfImports + 1);
        
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated: ${filePath}`);
      }
    } else {
      console.log(`Skipped (already has directives): ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

// Main function
function main() {
  const apiDir = path.join(__dirname, 'src', 'app', 'api');
  console.log(`Looking for API routes in: ${apiDir}`);
  
  if (!fs.existsSync(apiDir)) {
    console.error(`API directory does not exist: ${apiDir}`);
    return;
  }
  
  const apiRoutes = findApiRoutes(apiDir);
  
  console.log(`Found ${apiRoutes.length} API routes to update`);
  
  apiRoutes.forEach(route => {
    addStaticExportDirectives(route);
  });
  
  console.log('Done!');
}

main(); 