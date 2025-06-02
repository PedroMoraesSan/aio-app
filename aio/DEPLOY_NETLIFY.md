# Deploy no Netlify - Guia Completo

Este guia contém todas as informações necessárias para fazer o deploy do projeto AIO no Netlify.

## 📋 Pré-requisitos

1. Conta no Netlify
2. Chave da API Groq
3. Projeto versionado no Git (GitHub, GitLab, etc.)

## 🚀 Passos para Deploy

### 1. Preparação do Projeto

O projeto já está configurado com:
- ✅ `netlify.toml` configurado
- ✅ Plugin `@netlify/plugin-nextjs` instalado
- ✅ Configurações do Next.js ajustadas
- ✅ Utilitário de API para produção

### 2. Configuração no Netlify

1. **Conectar Repositório:**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "Add new site" > "Import an existing project"
   - Conecte sua conta GitHub/GitLab
   - Selecione o repositório do projeto

2. **Configurações de Build:**
   ```
   Base directory: aio/
   Build command: npm run build
   Publish directory: aio/.next
   ```

3. **Variáveis de Ambiente:**
   - Vá em Site settings > Environment variables
   - Adicione as seguintes variáveis:

   ```
   GROQ_API_KEY=gsk_sua_chave_aqui
   NEXT_PUBLIC_APP_URL=https://aiodemo.netlify.app
   NODE_ENV=production
   ```

### 3. Deploy

1. Clique em "Deploy site"
2. Aguarde o build completar
3. Teste a aplicação no URL fornecido

## 🛠️ Configurações Técnicas

### Arquivo `netlify.toml`
```toml
[build]
  base = "aio/"
  command = "npm run build"
  publish = "aio/.next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Rotas da API
As rotas da API (`/api/*`) são automaticamente convertidas em Netlify Functions pelo plugin do Next.js.

### Headers de Segurança
Configurados automaticamente via `netlify.toml`:
- Content Security Policy
- X-Frame-Options
- X-XSS-Protection
- E outros...

## 🔧 Troubleshooting

### Problema: Build Failed
- Verifique se todas as dependências estão instaladas
- Confirme que o Node.js versão 18+ está sendo usado
- Verifique os logs de build no painel do Netlify

### Problema: API não funciona
- Confirme que `GROQ_API_KEY` está configurada corretamente
- Verifique se a chave da API tem as permissões necessárias
- Teste a rota `/api/check-connection` diretamente

### Problema: Redirecionamentos
- Verificar configurações no `netlify.toml`
- Confirmar que as rotas estão corretas

## 🌐 Domínio Personalizado

Para usar um domínio personalizado:

1. Vá em Site settings > Domain management
2. Clique em "Add custom domain"
3. Configure os DNS records conforme indicado
4. Atualize `NEXT_PUBLIC_APP_URL` com o novo domínio

## 📊 Monitoramento

- **Function Logs:** Site settings > Functions > View logs
- **Analytics:** Disponível no painel do Netlify
- **Error Tracking:** Verificar logs da aplicação

## 🔄 Atualizações

Para atualizações futuras:
1. Push para o branch principal
2. Deploy automático será disparado
3. Verificar se o build foi bem-sucedido

## 📞 Suporte

Se encontrar problemas:
1. Verifique a documentação do Netlify
2. Confira os logs de build
3. Teste localmente primeiro
4. Use o SystemStatus component para diagnóstico

---

**URL de Produção:** https://aiodemo.netlify.app 