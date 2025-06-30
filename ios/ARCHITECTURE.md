# Arquitetura do FinanceApp iOS

## Visão Geral

O FinanceApp iOS foi desenvolvido seguindo os princípios de **Clean Architecture** e **MVVM** (Model-View-ViewModel), garantindo código limpo, testável e manutenível.

## Stack Tecnológica

### Core
- **SwiftUI**: Framework de UI declarativo
- **Combine**: Programação reativa
- **Swift 5.7+**: Linguagem de programação
- **iOS 15.0+**: Versão mínima suportada

### Dependências
- **Supabase Swift**: Backend e autenticação
- **Charts**: Visualização de dados
- **SwiftKeychainWrapper**: Armazenamento seguro

### Persistência
- **Keychain**: Tokens de autenticação
- **UserDefaults**: Configurações do usuário
- **Supabase**: Dados principais (sincronizados)

## Estrutura do Projeto

```
FinanceApp/
├── App/
│   ├── FinanceAppApp.swift          # Entry point
│   └── ContentView.swift            # Root view
├── Models/                          # Modelos de dados
│   ├── User.swift
│   ├── Transaction.swift
│   ├── Budget.swift
│   ├── Goal.swift
│   └── Bank.swift
├── Views/                           # Telas principais
│   ├── AuthenticationView.swift
│   ├── DashboardView.swift
│   ├── TransactionsView.swift
│   ├── BudgetsView.swift
│   ├── GoalsView.swift
│   └── ProfileView.swift
├── Components/                      # Componentes reutilizáveis
│   ├── TransactionRowView.swift
│   ├── BudgetProgressView.swift
│   └── CustomTextField.swift
├── Services/                        # Camada de serviços
│   ├── AuthManager.swift
│   ├── FinanceManager.swift
│   └── APIService.swift
├── Utils/                          # Utilitários
│   ├── KeychainManager.swift
│   ├── Extensions.swift
│   └── Constants.swift
└── Resources/                      # Recursos
    ├── Assets.xcassets
    ├── Info.plist
    └── Config.plist
```

## Padrões Arquiteturais

### MVVM (Model-View-ViewModel)

#### Model
- Representa os dados da aplicação
- Structs imutáveis que implementam `Codable`
- Separação entre modelos de domínio e API

```swift
struct Transaction: Identifiable, Codable {
    let id: UUID
    let amount: Decimal
    let type: TransactionType
    // ...
}
```

#### View
- Interface do usuário em SwiftUI
- Declarativa e reativa
- Observa mudanças no ViewModel

```swift
struct DashboardView: View {
    @EnvironmentObject var financeManager: FinanceManager
    
    var body: some View {
        // UI declarativa
    }
}
```

#### ViewModel
- Lógica de apresentação
- Gerencia estado da UI
- Comunica com Services

```swift
@MainActor
class FinanceManager: ObservableObject {
    @Published var transactions: [Transaction] = []
    @Published var isLoading = false
    
    func loadTransactions() {
        // Lógica de carregamento
    }
}
```

### Dependency Injection

Utilizamos `@EnvironmentObject` para injeção de dependências:

```swift
@main
struct FinanceAppApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var financeManager = FinanceManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(financeManager)
        }
    }
}
```

## Camada de Dados

### API Service
Centraliza todas as chamadas para o backend:

```swift
class APIService {
    static let shared = APIService()
    
    func getTransactions() -> AnyPublisher<[Transaction], Error> {
        // Implementação da chamada API
    }
}
```

### Gerenciamento de Estado
- **@Published**: Para propriedades observáveis
- **@State**: Para estado local da view
- **@EnvironmentObject**: Para dependências compartilhadas

### Persistência Local
```swift
class KeychainManager {
    func saveAuthSession(_ session: AuthSession) {
        // Salva no Keychain
    }
    
    func getAuthSession() -> AuthSession? {
        // Recupera do Keychain
    }
}
```

## Fluxo de Dados

### Autenticação
1. **Login/Register** → `AuthManager`
2. **Token Storage** → `KeychainManager`
3. **API Configuration** → `APIService`
4. **UI Update** → Views observam `AuthManager`

### Operações CRUD
1. **User Action** → View
2. **Business Logic** → ViewModel (Manager)
3. **API Call** → APIService
4. **Data Update** → Published properties
5. **UI Refresh** → SwiftUI recomposes

### Sincronização
- **Pull-to-refresh**: Recarrega dados do servidor
- **Real-time**: WebSocket para atualizações instantâneas
- **Offline**: Cache local com sincronização posterior

## Tratamento de Erros

### Estratégia em Camadas
```swift
enum APIError: Error, LocalizedError {
    case networkError
    case unauthorized
    case serverError(String)
    
    var errorDescription: String? {
        switch self {
        case .networkError:
            return "Erro de conexão"
        case .unauthorized:
            return "Acesso negado"
        case .serverError(let message):
            return message
        }
    }
}
```

### Apresentação de Erros
- **Alerts**: Para erros críticos
- **Toast Messages**: Para feedback rápido
- **Inline Messages**: Para validação de formulários

## Performance

### Otimizações Implementadas
- **Lazy Loading**: `LazyVStack` e `LazyVGrid`
- **Image Caching**: Para avatars e ícones
- **Debouncing**: Para busca em tempo real
- **Pagination**: Para listas grandes

### Monitoramento
- **Memory Usage**: Instruments
- **Network Calls**: Debugging
- **UI Responsiveness**: Time Profiler

## Segurança

### Autenticação
- **JWT Tokens**: Armazenados no Keychain
- **Refresh Tokens**: Renovação automática
- **Biometric Auth**: Face ID / Touch ID

### Dados Sensíveis
- **Keychain**: Para tokens e credenciais
- **Encryption**: Dados em trânsito (HTTPS)
- **Validation**: Input sanitization

## Testes

### Estratégia de Testes
```swift
// Unit Tests
class FinanceManagerTests: XCTestCase {
    func testTransactionCalculation() {
        // Testa lógica de negócio
    }
}

// UI Tests
class FinanceAppUITests: XCTestCase {
    func testLoginFlow() {
        // Testa fluxo de usuário
    }
}
```

### Cobertura
- **Unit Tests**: Lógica de negócio (80%+)
- **Integration Tests**: APIs e persistência
- **UI Tests**: Fluxos críticos

## Acessibilidade

### Implementações
- **VoiceOver**: Labels e hints
- **Dynamic Type**: Suporte a tamanhos de fonte
- **High Contrast**: Cores acessíveis
- **Keyboard Navigation**: Suporte completo

```swift
Text("Saldo atual")
    .accessibilityLabel("Saldo atual da conta")
    .accessibilityValue(formattedBalance)
```

## Internacionalização

### Suporte a Idiomas
- **Português (BR)**: Idioma principal
- **Inglês**: Idioma secundário
- **Localizable.strings**: Textos localizados
- **NumberFormatter**: Formatação de moeda

## CI/CD

### Pipeline Sugerido
1. **Build**: Xcode Cloud ou GitHub Actions
2. **Tests**: Unit e UI tests
3. **Code Quality**: SwiftLint
4. **Archive**: Build para distribuição
5. **Deploy**: TestFlight → App Store

### Configuração GitHub Actions
```yaml
name: iOS CI
on: [push, pull_request]
jobs:
  build:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build
      run: xcodebuild build -scheme FinanceApp
    - name: Test
      run: xcodebuild test -scheme FinanceApp
```

## Monitoramento

### Analytics
- **Firebase Analytics**: Eventos de usuário
- **Crashlytics**: Relatórios de crash
- **Performance**: Métricas de performance

### Métricas Importantes
- **DAU/MAU**: Usuários ativos
- **Retention**: Taxa de retenção
- **Crash Rate**: Taxa de crashes
- **Load Times**: Tempo de carregamento

## Roadmap Técnico

### Próximas Implementações
- [ ] **Core Data**: Cache offline robusto
- [ ] **WidgetKit**: Widgets para iOS
- [ ] **Siri Shortcuts**: Comandos de voz
- [ ] **Apple Pay**: Integração de pagamentos
- [ ] **CloudKit**: Sincronização iCloud
- [ ] **Machine Learning**: Categorização automática

### Melhorias Contínuas
- **Performance**: Otimizações constantes
- **UX**: Baseado em feedback
- **Security**: Atualizações de segurança
- **Accessibility**: Melhorias de acessibilidade

Esta arquitetura garante um aplicativo robusto, escalável e manutenível, seguindo as melhores práticas do desenvolvimento iOS! 🏗️