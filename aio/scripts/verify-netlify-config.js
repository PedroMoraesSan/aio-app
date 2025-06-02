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

// Mostrar resultados
console.log('📊 Resultados da verificação:\n')
checks.forEach(check => {
  console.log(`${check.status} ${check.name}`)
})

const allPassed = checks.every(check => check.status === '✅')

console.log('\n' + '='.repeat(50))
if (allPassed) {
  console.log('🎉 Todas as verificações passaram!')
  console.log('✅ Projeto está pronto para deploy no Netlify')
  console.log('\n📋 Próximos passos:')
  console.log('1. Faça commit e push das alterações')
  console.log('2. Configure as variáveis de ambiente no Netlify')
  console.log('3. Faça o deploy')
} else {
  console.log('⚠️  Algumas verificações falharam')
  console.log('❌ Revise as configurações antes do deploy')
}
console.log('='.repeat(50)) 