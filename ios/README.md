# FinanceApp iOS

Aplicativo iOS nativo para controle financeiro pessoal, desenvolvido em SwiftUI.

## Requisitos

- iOS 15.0+
- Xcode 14.0+
- Swift 5.7+

## Configuração

1. Abra `FinanceApp.xcodeproj` no Xcode
2. Configure as variáveis de ambiente no arquivo `Config.plist`
3. Execute o projeto no simulador ou dispositivo

## Funcionalidades

- ✅ Autenticação com Supabase
- ✅ Dashboard financeiro
- ✅ Gestão de transações
- ✅ Controle de orçamentos
- ✅ Metas financeiras
- ✅ Gestão de bancos/cartões
- ✅ Notificações push
- ✅ Modo offline
- ✅ Sincronização automática

## Arquitetura

- **MVVM** (Model-View-ViewModel)
- **SwiftUI** para interface
- **Combine** para programação reativa
- **Core Data** para persistência local
- **Supabase** para backend

## Estrutura do Projeto

```
FinanceApp/
├── Models/           # Modelos de dados
├── Views/           # Telas SwiftUI
├── ViewModels/      # Lógica de negócio
├── Services/        # APIs e serviços
├── Components/      # Componentes reutilizáveis
├── Utils/          # Utilitários
└── Resources/      # Assets e configurações
```