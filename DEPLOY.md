# 🚀 Guia de Deploy no Vercel

## ✅ Correções já aplicadas:

1. **Removido base path** do `vite.config.ts` (era específico para GitHub Pages)
2. **Removido homepage** do `package.json` 
3. **Criado `vercel.json`** para configurar roteamento correto

## 🔧 Configuração das Variáveis de Ambiente no Vercel:

Antes de fazer o deploy, você precisa configurar as variáveis de ambiente no Vercel:

### 1. Acesse o painel do Vercel
- Vá para [vercel.com](https://vercel.com)
- Acesse seu projeto

### 2. Configure as variáveis de ambiente:
- Clique em **Settings** → **Environment Variables**
- Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL = sua_url_do_supabase
VITE_SUPABASE_ANON_KEY = sua_chave_anonima_do_supabase
VITE_GEMINI_API_KEY = sua_chave_da_api_gemini (opcional)
```

### 3. Onde encontrar essas informações:

**Supabase:**
- Acesse [supabase.com](https://supabase.com)
- Vá em Settings → API
- Copie a **URL** e a **anon/public key**

**Gemini API (opcional - para o chatbot):**
- Acesse [ai.google.dev](https://ai.google.dev)
- Gere uma API key no Google AI Studio

## 🎯 Deploy:

1. **Commit as mudanças:**
```bash
git add .
git commit -m "fix: configuração para Vercel"
git push origin main
```

2. **No Vercel:**
- Conecte seu repositório GitHub
- O deploy será automático após as configurações

## ⚠️ Problemas comuns:

- **Página branca:** Verifique se as variáveis de ambiente estão configuradas
- **Erro 404:** O `vercel.json` já corrige isso
- **Erro de build:** Verifique se todas as dependências estão no `package.json`

## 📝 Nota:
Depois do primeiro deploy, qualquer push para a branch main será automaticamente deployado! 