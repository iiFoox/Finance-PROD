//
//  FinanceAppApp.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

@main
struct FinanceAppApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var financeManager = FinanceManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(financeManager)
                .onAppear {
                    setupApp()
                }
        }
    }
    
    private func setupApp() {
        // Configurar notificações push
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
        
        // Verificar sessão existente
        authManager.checkExistingSession()
    }
}