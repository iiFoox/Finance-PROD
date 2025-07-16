# Configuração de Autenticação - FinanceApp

Este documento explica como configurar a autenticação completa no Supabase para o FinanceApp, incluindo redefinição de senha por email.

## 1. Configuração no Supabase Dashboard

### 1.1 Configurar Autenticação

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Authentication** > **Settings**

### 1.2 Configurar Email

1. Em **Email Templates**, configure os templates de email:

#### Template de Redefinição de Senha
- **Subject**: `Redefinir sua senha - FinanceApp`
- **Body**: Use o template HTML fornecido no arquivo `src/lib/supabaseAuth.ts`

#### Template de Confirmação de Email
- **Subject**: `Confirme seu email - FinanceApp`
- **Body**: Use o template HTML fornecido no arquivo `src/lib/supabaseAuth.ts`

### 1.3 Configurar URLs de Redirecionamento

1. Em **URL Configuration**, adicione as seguintes URLs:

```
https://seu-dominio.com/reset-password
http://localhost:5173/reset-password
```

### 1.4 Configurar Provedor de Email

1. Em **Email Provider**, configure:
   - **SMTP Host**: (seu provedor SMTP)
   - **SMTP Port**: 587 ou 465
   - **SMTP User**: (seu email)
   - **SMTP Pass**: (sua senha)
   - **Sender Name**: FinanceApp
   - **Sender Email**: noreply@seu-dominio.com

**Provedores recomendados:**
- **SendGrid**: Para produção
- **Gmail**: Para desenvolvimento (com App Password)
- **Mailgun**: Para produção

### 1.5 Configurar Políticas de Senha

1. Em **Password Policy**, configure:
   - **Minimum Length**: 8
   - **Require Uppercase**: ✅
   - **Require Lowercase**: ✅
   - **Require Numbers**: ✅
   - **Require Special Characters**: ❌ (opcional)

## 2. Configuração de Variáveis de Ambiente

### 2.1 Arquivo .env.local

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 2.2 Configuração de Produção

Para produção, configure as variáveis de ambiente no seu provedor de hospedagem (Vercel, Netlify, etc.).

## 3. Configuração de RLS (Row Level Security)

### 3.1 Habilitar RLS nas Tabelas

Execute os seguintes comandos SQL no Supabase SQL Editor:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

### 3.2 Políticas de Segurança

```sql
-- Política para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Política para banks
CREATE POLICY "Users can view own banks" ON banks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banks" ON banks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banks" ON banks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own banks" ON banks
  FOR DELETE USING (auth.uid() = user_id);

-- Política para budgets
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Política para goals
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Configuração de Funções de Banco de Dados

### 4.1 Função para Criar Perfil Automaticamente

```sql
-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, created_at, updated_at)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função após inserção de usuário
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 4.2 Função para Configurações Padrão

```sql
-- Função para criar configurações padrão do usuário
CREATE OR REPLACE FUNCTION public.handle_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, notifications, preferences, financial, analytics, created_at, updated_at)
  VALUES (
    new.id,
    '{"email": true, "push": true, "sms": false}'::jsonb,
    '{"theme": "dark", "language": "pt-BR", "currency": "BRL"}'::jsonb,
    '{"monthly_goal": 0, "savings_goal": 0}'::jsonb,
    '{"show_charts": true, "show_insights": true}'::jsonb,
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função após criação de perfil
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_settings();
```

## 5. Testando a Configuração

### 5.1 Teste de Registro

1. Acesse a página de registro
2. Crie uma nova conta
3. Verifique se o email de confirmação foi enviado
4. Confirme o email
5. Faça login

### 5.2 Teste de Redefinição de Senha

1. Acesse a página de login
2. Clique em "Esqueci minha senha"
3. Digite um email válido
4. Verifique se o email de redefinição foi enviado
5. Clique no link do email
6. Defina uma nova senha
7. Faça login com a nova senha

## 6. Troubleshooting

### 6.1 Email não está sendo enviado

1. Verifique as configurações SMTP
2. Verifique se o email não está na pasta de spam
3. Verifique os logs do Supabase

### 6.2 Link de redefinição não funciona

1. Verifique as URLs de redirecionamento
2. Verifique se o domínio está correto
3. Verifique se o token não expirou

### 6.3 Erro de autenticação

1. Verifique as variáveis de ambiente
2. Verifique as políticas RLS
3. Verifique se o usuário está confirmado

### 6.4 Link de redefinição mostra "Link inválido"

Este é um problema comum que pode ter várias causas:

#### 6.4.1 Verificar Configuração do Supabase Dashboard

1. **URLs de Redirecionamento**: 
   - Acesse **Authentication** > **Settings** > **URL Configuration**
   - Adicione exatamente: `http://localhost:5173/reset-password`
   - Para produção: `https://seu-dominio.com/reset-password`

2. **Configuração de Email**:
   - Verifique se o provedor SMTP está configurado corretamente
   - Teste o envio de email no dashboard

3. **Configuração de Site URL**:
   - Em **Authentication** > **Settings** > **General**
   - Site URL deve ser: `http://localhost:5173` (desenvolvimento)
   - Para produção: `https://seu-dominio.com`

#### 6.4.2 Verificar Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

#### 6.4.3 Verificar Console do Navegador

1. Abra o console do navegador (F12)
2. Clique no link de redefinição
3. Verifique os logs para identificar o problema específico

#### 6.4.4 Problemas Comuns e Soluções

**Problema**: Tokens não encontrados na URL
- **Solução**: Verificar se `detectSessionInUrl: true` está configurado no cliente Supabase

**Problema**: Erro de sessão
- **Solução**: Verificar se as URLs de redirecionamento estão corretas no dashboard

**Problema**: Link expirado
- **Solução**: Solicitar novo link (links expiram em 24 horas)

**Problema**: Erro de CORS
- **Solução**: Verificar se o domínio está na lista de URLs permitidas

#### 6.4.5 Teste Manual

1. Solicite um novo link de redefinição
2. Verifique se o email foi recebido
3. Clique no link diretamente no email
4. Verifique se a URL contém os parâmetros `access_token` e `refresh_token`
5. Verifique os logs no console do navegador

#### 6.4.6 Configuração Alternativa

Se o problema persistir, tente usar a configuração manual de sessão:

```typescript
// Em ResetPasswordPage.tsx
useEffect(() => {
  const checkToken = async () => {
    try {
      // Verificar se há uma sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsValidToken(true);
        return;
      }
      
      // Se não há sessão, verificar tokens na URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          setError('Link de redefinição inválido ou expirado.');
          setIsValidToken(false);
        } else if (data.user) {
          setIsValidToken(true);
        }
      } else {
        setError('Link de redefinição inválido.');
        setIsValidToken(false);
      }
    } catch (error) {
      setError('Erro ao verificar o link de redefinição.');
      setIsValidToken(false);
    } finally {
      setIsCheckingToken(false);
    }
  };
  
  checkToken();
}, [searchParams]);
```

## 7. Segurança

### 7.1 Boas Práticas

- Use HTTPS em produção
- Configure rate limiting
- Monitore logs de autenticação
- Use senhas fortes
- Implemente autenticação de dois fatores (opcional)

### 7.2 Monitoramento

- Configure alertas para tentativas de login suspeitas
- Monitore falhas de autenticação
- Configure logs de auditoria

## 8. Deploy

### 8.1 Variáveis de Ambiente

Certifique-se de configurar as variáveis de ambiente no seu provedor de hospedagem:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 8.2 URLs de Redirecionamento

Adicione a URL de produção nas configurações do Supabase:

```
https://seu-dominio.com/reset-password
```

## 9. Suporte

Para problemas específicos:

1. Verifique a [documentação do Supabase](https://supabase.com/docs)
2. Consulte os [logs do projeto](https://supabase.com/dashboard/project/_/logs)
3. Entre em contato com o suporte do Supabase

---

**Nota**: Esta configuração garante que a autenticação funcione corretamente com redefinição de senha por email, seguindo as melhores práticas de segurança. 