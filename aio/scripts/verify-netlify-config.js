#!/usr/bin/env node

/**
 * Script para verificar configuração do Netlify
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando configuração do Netlify...\n')

const checks = []

// Verificar se netlify.toml existe
const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml')
if (fs.existsSync(netlifyTomlPath)) {
  checks.push({ name: 'netlify.toml existe', status: '✅' })
  
  // Verificar conteúdo do netlify.toml
  const tomlContent = fs.readFileSync(netlifyTomlPath, 'utf-8')
  if (tomlContent.includes('@netlify/plugin-nextjs')) {
    checks.push({ name: 'Plugin Next.js configurado no TOML', status: '✅' })
  } else {
    checks.push({ name: 'Plugin Next.js configurado no TOML', status: '❌' })
  }
} else {
  checks.push({ name: 'netlify.toml existe', status: '❌' })
}

// Verificar se o plugin do Netlify está instalado
const packageJsonPath = path.join(__dirname, '..', 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  if (packageJson.devDependencies && packageJson.devDependencies['@netlify/plugin-nextjs']) {
    checks.push({ name: '@netlify/plugin-nextjs instalado', status: '✅' })
  } else {
    checks.push({ name: '@netlify/plugin-nextjs instalado', status: '❌' })
  }
}

// Verificar se as rotas da API existem
const apiChatPath = path.join(__dirname, '..', 'app', 'api', 'chat', 'route.ts')
const apiCheckPath = path.join(__dirname, '..', 'app', 'api', 'check-connection', 'route.ts')

if (fs.existsSync(apiChatPath)) {
  checks.push({ name: 'Rota API /chat existe', status: '✅' })
} else {
  checks.push({ name: 'Rota API /chat existe', status: '❌' })
}

if (fs.existsSync(apiCheckPath)) {
  checks.push({ name: 'Rota API /check-connection existe', status: '✅' })
} else {
  checks.push({ name: 'Rota API /check-connection existe', status: '❌' })
}

// Verificar se o utilitário de API existe
const apiUtilPath = path.join(__dirname, '..', 'lib', 'api.ts')
if (fs.existsSync(apiUtilPath)) {
  checks.push({ name: 'Utilitário lib/api.ts existe', status: '✅' })
} else {
  checks.push({ name: 'Utilitário lib/api.ts existe', status: '❌' })
}

// Verificar se env.example existe
const envExamplePath = path.join(__dirname, '..', 'env.example')
if (fs.existsSync(envExamplePath)) {
  checks.push({ name: 'env.example existe', status: '✅' })
} else {
  checks.push({ name: 'env.example existe', status: '❌' })
}

// Verificar se página principal existe
const mainPagePath = path.join(__dirname, '..', 'app', 'page.tsx')
if (fs.existsSync(mainPagePath)) {
  checks.push({ name: 'Página principal (app/page.tsx) existe', status: '✅' })
} else {
  checks.push({ name: 'Página principal (app/page.tsx) existe', status: '❌' })
}

// Verificar se layout existe
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx')
if (fs.existsSync(layoutPath)) {
  checks.push({ name: 'Layout (app/layout.tsx) existe', status: '✅' })
} else {
  checks.push({ name: 'Layout (app/layout.tsx) existe', status: '❌' })
}

// Verificar se build funciona
const nextBuildPath = path.join(__dirname, '..', '.next')
if (fs.existsSync(nextBuildPath)) {
  checks.push({ name: 'Build do Next.js foi executado', status: '✅' })
} else {
  checks.push({ name: 'Build do Next.js foi executado', status: '⚠️  Execute: npm run build' })
}

// Verificar se página de teste existe
const testPagePath = path.join(__dirname, '..', 'app', 'test', 'page.tsx')
if (fs.existsSync(testPagePath)) {
  checks.push({ name: 'Página de teste criada', status: '✅' })
} else {
  checks.push({ name: 'Página de teste criada', status: '❌' })
}

// Mostrar resultados
console.log('📊 Resultados da verificação:\n')
checks.forEach(check => {
  console.log(`${check.status} ${check.name}`)
})

const allPassed = checks.every(check => check.status === '✅')
const hasWarnings = checks.some(check => check.status.includes('⚠️'))

console.log('\n' + '='.repeat(50))
if (allPassed) {
  console.log('🎉 Todas as verificações passaram!')
  console.log('✅ Projeto está pronto para deploy no Netlify')
  console.log('\n📋 Próximos passos:')
  console.log('1. Faça commit e push das alterações')
  console.log('2. Configure as variáveis de ambiente no Netlify')
  console.log('3. Faça o deploy')
  console.log('4. Teste a página: https://seu-site.netlify.app/test')
} else if (hasWarnings) {
  console.log('⚠️  Algumas verificações têm avisos')
  console.log('📝 Execute as ações recomendadas antes do deploy')
} else {
  console.log('⚠️  Algumas verificações falharam')
  console.log('❌ Revise as configurações antes do deploy')
}
console.log('='.repeat(50)) 