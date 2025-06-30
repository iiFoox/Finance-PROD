# Guia de Deploy - FinanceApp iOS

## Pré-requisitos

### 1. Conta de Desenvolvedor Apple
- Inscreva-se no [Apple Developer Program](https://developer.apple.com/programs/) ($99/ano)
- Aguarde aprovação (pode levar até 48 horas)

### 2. Configuração do Xcode
- Instale o Xcode 14.0+ da App Store
- Configure sua conta de desenvolvedor no Xcode:
  - Xcode → Preferences → Accounts → Add Apple ID

### 3. Configuração do Projeto

#### Configurar Bundle Identifier
1. Abra o projeto no Xcode
2. Selecione o target "FinanceApp"
3. Na aba "Signing & Capabilities":
   - Mude o Bundle Identifier para algo único (ex: `com.seudominio.financeapp`)
   - Selecione seu Team de desenvolvedor

#### Configurar Variáveis de Ambiente
1. Crie um arquivo `Config.plist` em `FinanceApp/Resources/`
2. Adicione suas credenciais do Supabase:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>SUPABASE_URL</key>
    <string>https://your-project.supabase.co</string>
    <key>SUPABASE_ANON_KEY</key>
    <string>your-anon-key</string>
</dict>
</plist>
```

## Processo de Deploy

### 1. Preparação para Produção

#### Configurar App Icons
1. Crie ícones do app em diferentes tamanhos:
   - 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024
2. Adicione no `Assets.xcassets/AppIcon.appiconset`

#### Configurar Launch Screen
1. Customize a tela de carregamento em `LaunchScreen.storyboard`
2. Adicione o logo e cores da marca

#### Configurar Info.plist
1. Adicione descrições para permissões necessárias:
   - `NSCameraUsageDescription` (se usar câmera)
   - `NSPhotoLibraryUsageDescription` (se usar galeria)
   - `NSUserNotificationUsageDescription` (para notificações)

### 2. Build e Archive

#### No Xcode:
1. Selecione "Any iOS Device" como destino
2. Product → Archive
3. Aguarde o build completar
4. Na janela do Organizer, clique "Distribute App"

#### Opções de Distribuição:
- **App Store Connect**: Para submissão à App Store
- **Ad Hoc**: Para testes com dispositivos específicos
- **Enterprise**: Para distribuição interna (requer conta Enterprise)
- **Development**: Para testes durante desenvolvimento

### 3. Submissão à App Store

#### Preparar Metadados no App Store Connect:
1. Acesse [App Store Connect](https://appstoreconnect.apple.com)
2. Crie um novo app:
   - Nome: "FinanceApp - Controle Financeiro"
   - Bundle ID: (mesmo configurado no Xcode)
   - SKU: identificador único

#### Informações Obrigatórias:
- **Descrição**: Descrição detalhada do app
- **Palavras-chave**: "finanças, orçamento, controle, gastos, receitas"
- **Screenshots**: Capturas de tela para iPhone e iPad
- **Categoria**: Finance
- **Classificação etária**: 4+
- **Preço**: Gratuito ou pago

#### Screenshots Necessários:
- iPhone 6.7": 1290 x 2796 pixels
- iPhone 6.5": 1242 x 2688 pixels  
- iPhone 5.5": 1242 x 2208 pixels
- iPad Pro 12.9": 2048 x 2732 pixels

### 4. Processo de Revisão

#### Checklist Pré-Submissão:
- [ ] App funciona sem crashes
- [ ] Todas as funcionalidades testadas
- [ ] Interface responsiva em todos os dispositivos
- [ ] Conformidade com as diretrizes da Apple
- [ ] Política de privacidade implementada
- [ ] Termos de uso disponíveis

#### Submissão:
1. Upload do build via Xcode ou Transporter
2. Preencher informações no App Store Connect
3. Submeter para revisão
4. Aguardar aprovação (1-7 dias úteis)

### 5. Pós-Aprovação

#### Lançamento:
- **Automático**: App fica disponível imediatamente após aprovação
- **Manual**: Você controla quando o app fica disponível

#### Monitoramento:
- Acompanhe downloads e reviews no App Store Connect
- Configure Analytics para monitorar uso
- Prepare updates baseados no feedback

## Configurações Avançadas

### 1. Notificações Push
```swift
// Configure no AppDelegate
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
        if granted {
            DispatchQueue.main.async {
                application.registerForRemoteNotifications()
            }
        }
    }
    return true
}
```

### 2. Deep Links
```swift
// Configure URL Schemes no Info.plist
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.financeapp.deeplink</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>financeapp</string>
        </array>
    </dict>
</array>
```

### 3. App Store Optimization (ASO)

#### Título Otimizado:
"FinanceApp - Controle Financeiro Pessoal e Orçamento"

#### Descrição Sugerida:
```
Transforme sua vida financeira com o FinanceApp! 

🎯 PRINCIPAIS FUNCIONALIDADES:
• Controle completo de receitas e despesas
• Orçamentos inteligentes por categoria  
• Metas financeiras personalizadas
• Gestão de cartões e bancos
• Relatórios detalhados e gráficos
• Sincronização em tempo real
• Interface moderna e intuitiva

💰 BENEFÍCIOS:
• Organize suas finanças de forma simples
• Acompanhe seus gastos em tempo real
• Defina e alcance suas metas financeiras
• Receba alertas de orçamento
• Visualize relatórios detalhados

🔒 SEGURANÇA:
• Dados criptografados
• Backup automático na nuvem
• Acesso seguro com biometria

Baixe agora e tome controle das suas finanças!
```

#### Palavras-chave:
"finanças pessoais, controle financeiro, orçamento, gastos, receitas, economia, investimentos, dinheiro, carteira digital, planejamento financeiro"

## Cronograma Estimado

| Fase | Duração | Atividades |
|------|---------|------------|
| **Preparação** | 2-3 dias | Configuração de contas, certificados, ícones |
| **Build & Teste** | 1-2 dias | Archive, testes finais, correções |
| **Submissão** | 1 dia | Upload, preenchimento de metadados |
| **Revisão Apple** | 1-7 dias | Aguardar aprovação da Apple |
| **Lançamento** | 1 dia | Publicação e monitoramento inicial |

**Total: 5-13 dias**

## Custos Envolvidos

- **Apple Developer Program**: $99/ano
- **Certificados**: Inclusos na conta de desenvolvedor
- **App Store**: Gratuito para submissão
- **Marketing** (opcional): Variável

## Suporte Pós-Lançamento

### Atualizações:
- Correções de bugs: Imediatas
- Novas funcionalidades: Mensais
- Atualizações de segurança: Conforme necessário

### Monitoramento:
- Reviews e ratings
- Crash reports
- Analytics de uso
- Feedback dos usuários

Este guia garante um processo de deploy suave e profissional para a App Store! 🚀