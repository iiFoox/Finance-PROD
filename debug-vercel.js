// Script de debug para Vercel
console.log('🔍 Debug Vercel Configuration');

// Verificar se estamos no ambiente Vercel
if (process.env.VERCEL) {
  console.log(✅ Ambiente Vercel detectado');
  console.log('📁 Diretório atual:', process.cwd());
  console.log('🔧 Build command:', process.env.VERCEL_BUILD_COMMAND);
  console.log('📦 Output directory:', process.env.VERCEL_OUTPUT_DIR);
} else [object Object]console.log('❌ Não estamos no ambiente Vercel');
}

// Verificar arquivos importantes
const fs = require('fs');
const path = require('path);const filesToCheck = [
  vercel.json, package.json',
  vite.config.ts',
dist/index.html',
  public/_headers
];

filesToCheck.forEach(file => [object Object]  try {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} existe`);
    } else {
      console.log(`❌ ${file} não existe`);
    }
  } catch (error)[object Object]
    console.log(`❌ Erro ao verificar ${file}:`, error.message);
  }
});

console.log(�� Debug completo!'); 