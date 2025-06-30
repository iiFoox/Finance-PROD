//
//  ProfileView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var financeManager: FinanceManager
    @State private var showingLogoutAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile header
                    profileHeader
                    
                    // Statistics
                    statisticsSection
                    
                    // Settings
                    settingsSection
                    
                    // Logout button
                    logoutButton
                }
                .padding()
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Perfil")
            .navigationBarTitleDisplayMode(.large)
            .preferredColorScheme(.dark)
        }
        .alert("Sair da Conta", isPresented: $showingLogoutAlert) {
            Button("Cancelar", role: .cancel) { }
            Button("Sair", role: .destructive) {
                authManager.logout()
            }
        } message: {
            Text("Tem certeza que deseja sair da sua conta?")
        }
    }
    
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.blue, .purple],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 100, height: 100)
                
                if let user = authManager.currentUser {
                    Text(user.initials)
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                } else {
                    Image(systemName: "person.fill")
                        .font(.largeTitle)
                        .foregroundColor(.white)
                }
            }
            
            // User info
            VStack(spacing: 4) {
                if let user = authManager.currentUser {
                    Text(user.displayName)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(user.email)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                } else {
                    Text("Usuário")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
            }
        }
    }
    
    private var statisticsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Estatísticas")
                .font(.headline)
                .foregroundColor(.white)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                StatCard(
                    title: "Transações",
                    value: "\(financeManager.transactions.count)",
                    icon: "list.bullet",
                    color: .blue
                )
                
                StatCard(
                    title: "Orçamentos",
                    value: "\(financeManager.budgets.count)",
                    icon: "target",
                    color: .green
                )
                
                StatCard(
                    title: "Metas",
                    value: "\(financeManager.goals.count)",
                    icon: "flag.fill",
                    color: .purple
                )
                
                StatCard(
                    title: "Bancos",
                    value: "\(financeManager.banks.count)",
                    icon: "building.columns",
                    color: .orange
                )
            }
        }
    }
    
    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Configurações")
                .font(.headline)
                .foregroundColor(.white)
            
            VStack(spacing: 0) {
                SettingsRow(
                    title: "Notificações",
                    icon: "bell",
                    action: { }
                )
                
                Divider()
                    .background(Color.gray.opacity(0.3))
                
                SettingsRow(
                    title: "Privacidade",
                    icon: "lock",
                    action: { }
                )
                
                Divider()
                    .background(Color.gray.opacity(0.3))
                
                SettingsRow(
                    title: "Sobre",
                    icon: "info.circle",
                    action: { }
                )
                
                Divider()
                    .background(Color.gray.opacity(0.3))
                
                SettingsRow(
                    title: "Suporte",
                    icon: "questionmark.circle",
                    action: { }
                )
            }
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
        }
    }
    
    private var logoutButton: some View {
        Button(action: { showingLogoutAlert = true }) {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.headline)
                
                Text("Sair da Conta")
                    .font(.headline)
                    .fontWeight(.medium)
            }
            .foregroundColor(.red)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.red.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.red.opacity(0.3), lineWidth: 1)
            )
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
}

struct SettingsRow: View {
    let title: String
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.headline)
                    .foregroundColor(.blue)
                    .frame(width: 24)
                
                Text(title)
                    .font(.headline)
                    .foregroundColor(.white)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding()
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthManager())
        .environmentObject(FinanceManager())
}