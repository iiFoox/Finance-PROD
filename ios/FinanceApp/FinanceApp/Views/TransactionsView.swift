//
//  TransactionsView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct TransactionsView: View {
    @EnvironmentObject var financeManager: FinanceManager
    @State private var showingAddTransaction = false
    @State private var searchText = ""
    @State private var selectedFilter: TransactionFilter = .all
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and filter section
                searchAndFilterSection
                
                // Transactions list
                transactionsList
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Transações")
            .navigationBarTitleDisplayMode(.large)
            .preferredColorScheme(.dark)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddTransaction = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(.blue)
                    }
                }
            }
            .refreshable {
                financeManager.loadTransactions()
            }
        }
        .sheet(isPresented: $showingAddTransaction) {
            AddTransactionView()
        }
    }
    
    private var searchAndFilterSection: some View {
        VStack(spacing: 12) {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                
                TextField("Buscar transações...", text: $searchText)
                    .foregroundColor(.white)
                
                if !searchText.isEmpty {
                    Button(action: { searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .background(Color.gray.opacity(0.2))
            .cornerRadius(10)
            
            // Filter buttons
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(TransactionFilter.allCases, id: \.self) { filter in
                        FilterButton(
                            title: filter.displayName,
                            isSelected: selectedFilter == filter
                        ) {
                            selectedFilter = filter
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding()
    }
    
    private var transactionsList: some View {
        ScrollView {
            LazyVStack(spacing: 8) {
                ForEach(filteredTransactions) { transaction in
                    TransactionRowView(transaction: transaction)
                        .contextMenu {
                            Button("Editar") {
                                // Edit transaction
                            }
                            
                            Button("Excluir", role: .destructive) {
                                financeManager.deleteTransaction(transaction.id)
                            }
                        }
                }
            }
            .padding()
        }
    }
    
    private var filteredTransactions: [Transaction] {
        var transactions = financeManager.currentMonthTransactions
        
        // Apply search filter
        if !searchText.isEmpty {
            transactions = transactions.filter { transaction in
                transaction.title.localizedCaseInsensitiveContains(searchText) ||
                transaction.description?.localizedCaseInsensitiveContains(searchText) == true ||
                transaction.categoryName.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Apply type filter
        switch selectedFilter {
        case .all:
            break
        case .income:
            transactions = transactions.filter { $0.type == .income }
        case .expense:
            transactions = transactions.filter { $0.type == .expense }
        case .thisWeek:
            let calendar = Calendar.current
            let now = Date()
            let weekAgo = calendar.date(byAdding: .day, value: -7, to: now) ?? now
            transactions = transactions.filter { $0.date >= weekAgo }
        case .thisMonth:
            // Already filtered by current month
            break
        }
        
        return transactions
    }
}

enum TransactionFilter: CaseIterable {
    case all, income, expense, thisWeek, thisMonth
    
    var displayName: String {
        switch self {
        case .all: return "Todas"
        case .income: return "Receitas"
        case .expense: return "Despesas"
        case .thisWeek: return "Esta Semana"
        case .thisMonth: return "Este Mês"
        }
    }
}

struct FilterButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .white : .gray)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    isSelected ? 
                    LinearGradient(colors: [.blue, .purple], startPoint: .leading, endPoint: .trailing) :
                    Color.gray.opacity(0.2)
                )
                .cornerRadius(20)
        }
    }
}

#Preview {
    TransactionsView()
        .environmentObject(FinanceManager())
}