//
//  DashboardView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var financeManager: FinanceManager
    @State private var showingAddTransaction = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 20) {
                    // Header with greeting
                    headerSection
                    
                    // Financial summary cards
                    summaryCardsSection
                    
                    // Quick actions
                    quickActionsSection
                    
                    // Recent transactions
                    recentTransactionsSection
                    
                    // Budget overview
                    budgetOverviewSection
                }
                .padding(.horizontal)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.large)
            .preferredColorScheme(.dark)
            .refreshable {
                financeManager.loadAllData()
            }
        }
        .sheet(isPresented: $showingAddTransaction) {
            AddTransactionView()
        }
    }
    
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Olá! 👋")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("Aqui está um resumo das suas finanças")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                Button(action: { showingAddTransaction = true }) {
                    Image(systemName: "plus")
                        .font(.title2)
                        .foregroundColor(.white)
                        .frame(width: 44, height: 44)
                        .background(
                            LinearGradient(
                                colors: [.blue, .purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .clipShape(Circle())
                }
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [.blue.opacity(0.8), .purple.opacity(0.8)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(16)
    }
    
    private var summaryCardsSection: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 16) {
            SummaryCard(
                title: "Receitas",
                value: financeManager.formattedTotalIncome,
                icon: "arrow.up.circle.fill",
                color: .green
            )
            
            SummaryCard(
                title: "Despesas",
                value: financeManager.formattedTotalExpenses,
                icon: "arrow.down.circle.fill",
                color: .red
            )
            
            SummaryCard(
                title: "Saldo",
                value: financeManager.formattedCurrentBalance,
                icon: "dollarsign.circle.fill",
                color: financeManager.currentBalance >= 0 ? .green : .red
            )
            
            SummaryCard(
                title: "Transações",
                value: "\(financeManager.currentMonthTransactions.count)",
                icon: "list.bullet.circle.fill",
                color: .blue
            )
        }
    }
    
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Ações Rápidas")
                .font(.headline)
                .foregroundColor(.white)
            
            HStack(spacing: 12) {
                QuickActionButton(
                    title: "Adicionar\nReceita",
                    icon: "plus.circle.fill",
                    color: .green
                ) {
                    showingAddTransaction = true
                }
                
                QuickActionButton(
                    title: "Adicionar\nDespesa",
                    icon: "minus.circle.fill",
                    color: .red
                ) {
                    showingAddTransaction = true
                }
                
                QuickActionButton(
                    title: "Ver\nOrçamentos",
                    icon: "target",
                    color: .orange
                ) {
                    // Navigate to budgets
                }
                
                QuickActionButton(
                    title: "Ver\nMetas",
                    icon: "flag.fill",
                    color: .purple
                ) {
                    // Navigate to goals
                }
            }
        }
    }
    
    private var recentTransactionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Transações Recentes")
                    .font(.headline)
                    .foregroundColor(.white)
                
                Spacer()
                
                Button("Ver Todas") {
                    // Navigate to transactions
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
            
            if financeManager.currentMonthTransactions.isEmpty {
                EmptyStateView(
                    icon: "creditcard",
                    title: "Nenhuma transação",
                    subtitle: "Adicione sua primeira transação"
                )
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(Array(financeManager.currentMonthTransactions.prefix(5))) { transaction in
                        TransactionRowView(transaction: transaction)
                    }
                }
            }
        }
    }
    
    private var budgetOverviewSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Orçamentos")
                    .font(.headline)
                    .foregroundColor(.white)
                
                Spacer()
                
                Button("Gerenciar") {
                    // Navigate to budgets
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
            
            if financeManager.budgets.isEmpty {
                EmptyStateView(
                    icon: "target",
                    title: "Nenhum orçamento",
                    subtitle: "Crie orçamentos para controlar seus gastos"
                )
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(Array(financeManager.budgets.prefix(3))) { budget in
                        BudgetProgressView(budget: budget)
                            .environmentObject(financeManager)
                    }
                }
            }
        }
    }
}

struct SummaryCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Spacer()
            }
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
}

struct QuickActionButton: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
    }
}

struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundColor(.gray)
            
            Text(title)
                .font(.headline)
                .foregroundColor(.white)
            
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

#Preview {
    DashboardView()
        .environmentObject(FinanceManager())
}