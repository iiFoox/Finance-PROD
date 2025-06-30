//
//  BudgetsView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct BudgetsView: View {
    @EnvironmentObject var financeManager: FinanceManager
    @State private var showingAddBudget = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 16) {
                    if financeManager.budgets.isEmpty {
                        EmptyStateView(
                            icon: "target",
                            title: "Nenhum orçamento",
                            subtitle: "Crie orçamentos para controlar melhor seus gastos por categoria"
                        )
                        .padding(.top, 100)
                    } else {
                        ForEach(financeManager.budgets) { budget in
                            BudgetProgressView(budget: budget)
                                .environmentObject(financeManager)
                        }
                    }
                }
                .padding()
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Orçamentos")
            .navigationBarTitleDisplayMode(.large)
            .preferredColorScheme(.dark)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddBudget = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(.blue)
                    }
                }
            }
            .refreshable {
                financeManager.loadBudgets()
            }
        }
        .sheet(isPresented: $showingAddBudget) {
            AddBudgetView()
        }
    }
}

struct AddBudgetView: View {
    @EnvironmentObject var financeManager: FinanceManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var selectedCategory = "Alimentação"
    @State private var targetAmount = ""
    @State private var alertThreshold = 80.0
    
    private let categories = [
        "Alimentação", "Transporte", "Moradia", "Lazer", "Saúde",
        "Educação", "Investimentos", "Outros"
    ]
    
    var body: some View {
        NavigationView {
            Form {
                Section("Informações do Orçamento") {
                    Picker("Categoria", selection: $selectedCategory) {
                        ForEach(categories, id: \.self) { category in
                            Text(category).tag(category)
                        }
                    }
                    
                    HStack {
                        Text("R$")
                            .foregroundColor(.gray)
                        TextField("0,00", text: $targetAmount)
                            .keyboardType(.decimalPad)
                    }
                }
                
                Section("Configurações") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Alerta quando atingir: \(Int(alertThreshold))%")
                            .font(.headline)
                        
                        Slider(value: $alertThreshold, in: 50...100, step: 5)
                            .accentColor(.blue)
                        
                        Text("Você receberá uma notificação quando atingir esta porcentagem do orçamento")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
            }
            .navigationTitle("Novo Orçamento")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancelar") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Salvar") {
                        saveBudget()
                    }
                    .disabled(!isFormValid)
                }
            }
        }
    }
    
    private var isFormValid: Bool {
        return !targetAmount.isEmpty && Double(targetAmount) != nil
    }
    
    private func saveBudget() {
        guard let amountValue = Double(targetAmount) else { return }
        
        let calendar = Calendar.current
        let year = calendar.component(.year, from: Date())
        let month = calendar.component(.month, from: Date())
        let monthString = String(format: "%04d-%02d", year, month)
        
        let budget = CreateBudgetRequest(
            category: selectedCategory,
            targetAmount: Decimal(amountValue),
            month: monthString,
            alertThreshold: Int(alertThreshold)
        )
        
        financeManager.addBudget(budget)
        dismiss()
    }
}

#Preview {
    BudgetsView()
        .environmentObject(FinanceManager())
}