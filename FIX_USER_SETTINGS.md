# Correção dos Erros de RLS - Tabela user_settings

## 🚨 Problema Identificado

Os erros de `401 Unauthorized` na tabela `user_settings` são causados por políticas RLS (Row Level Security) mal configuradas ou ausentes. Isso impede que os usuários acessem suas próprias configurações após a redefinição de senha.

## ✅ Solução

### Passo 1: Executar Script de Correção

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Copie e cole o conteúdo do arquivo `scripts/fix-user-settings.sql`
5. Clique em **Run** para executar o script

### Passo 2: Verificar a Execução

Após executar o script, você deve ver mensagens como:
- "Tabela user_settings já existe." ou "Tabela user_settings criada com sucesso!"
- "Políticas RLS criadas com sucesso!" com contagem de políticas
- "Configurações de usuários:" com contagem de configurações

### Passo 3: Testar a Correção

1. Faça logout da aplicação
2. Faça login novamente
3. Verifique se os erros de `401 Unauthorized` desapareceram do console
4. Teste a funcionalidade de configurações

## 🔧 O que o Script Faz

### 1. Criação da Tabela (se não existir)
- Cria a tabela `user_settings` com todas as colunas necessárias
- Define valores padrão para todas as configurações

### 2. Configuração de RLS
- Habilita Row Level Security na tabela
- Remove políticas antigas (se existirem)
- Cria novas políticas de segurança:
  - **SELECT**: Usuários podem ver apenas suas próprias configurações
  - **INSERT**: Usuários podem inserir apenas suas próprias configurações
  - **UPDATE**: Usuários podem atualizar apenas suas próprias configurações
  - **DELETE**: Usuários podem deletar apenas suas próprias configurações

### 3. Triggers e Funções
- Cria trigger para atualizar `updated_at` automaticamente
- Cria função para criar configurações padrão quando usuário se registra
- Cria função RPC para criar configurações padrão manualmente

### 4. Índices de Performance
- Cria índices para melhorar a performance das consultas

### 5. Correção de Dados
- Verifica usuários sem configurações e cria configurações padrão

## 🐛 Troubleshooting

### Se o script falhar:

1. **Erro de permissão**: Verifique se você tem permissão de administrador no projeto
2. **Erro de sintaxe**: Verifique se copiou o script completo
3. **Erro de tabela existente**: O script é seguro e não quebra se a tabela já existe

### Se os erros persistirem:

1. **Limpar cache do navegador**
2. **Fazer logout e login novamente**
3. **Verificar se as políticas foram criadas**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_settings';
   ```

### Verificar configurações de um usuário:

```sql
SELECT * FROM user_settings WHERE user_id = 'ID_DO_USUARIO';
```

## 📊 Monitoramento

Após a correção, monitore:
- Console do navegador para erros de `401`
- Logs do Supabase para erros de RLS
- Funcionalidade das configurações do usuário

## 🔒 Segurança

As políticas RLS garantem que:
- Cada usuário só acessa suas próprias configurações
- Não há vazamento de dados entre usuários
- Todas as operações são auditadas

## 📝 Notas Importantes

- O script é **idempotente** (pode ser executado múltiplas vezes sem problemas)
- Não afeta dados existentes
- Cria configurações padrão apenas para usuários que não as têm
- Mantém a segurança da aplicação

---

**Resultado Esperado**: Após executar o script, os erros de `401 Unauthorized` devem desaparecer e a funcionalidade de configurações deve funcionar normalmente. 