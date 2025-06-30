//
//  AddTransactionView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct AddTransactionView: View {
    @EnvironmentObject var financeManager: FinanceManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var title = ""
    @State private var description = ""
    @State private var amount = ""
    @State private var selectedType: TransactionType = .expense
    @State private var selectedCategory = "Alimentação"
    @State private var selectedDate = Date()
    @State private var selectedPaymentMethod: PaymentMethod = .money
    @State private var selectedBankId: UUID?
    @State private var tags = ""
    @State private var isInstallment = false
    @State private var installmentCount = 2
    
    private let categories = [
        "Alimentação", "Transporte", "Moradia", "Lazer", "Saúde",
        "Educação", "Salário", "Investimentos", "Outros"
    ]
    
    var body: some View {
        NavigationView {
            Form {
                Section("Informações Básicas") {
                    TextField("Título", text: $title)
                    TextField("Descrição (opcional)", text: $description)
                    
                    HStack {
                        Text("R$")
                            .foregroundColor(.gray)
                        TextField("0,00", text: $amount)
                            .keyboardType(.decimalPad)
                    }
                }
                
                Section("Tipo e Categoria") {
                    Picker("Tipo", selection: $selectedType) {
                        ForEach(TransactionType.allCases, id: \.self) { type in
                            Text(type.displayName).tag(type)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    Picker("Categoria", selection: $selectedCategory) {
                        ForEach(categories, id: \.self) { category in
                            Text(category).tag(category)
                        }
                    }
                }
                
                Section("Detalhes") {
                    DatePicker("Data", selection: $selectedDate, displayedComponents: [.date])
                    
                    Picker("Forma de Pagamento", selection: $selectedPaymentMethod) {
                        ForEach(PaymentMethod.allCases, id: \.self) { method in
                            HStack {
                                Image(systemName: method.icon)
                                Text(method.displayName)
                            }.tag(method)
                        }
                    }
                    
                    if selectedPaymentMethod == .creditCard {
                        Picker("Banco/Cartão", selection: $selectedBankId) {
                            Text("Selecione um banco").tag(nil as UUID?)
                            ForEach(financeManager.banks, id: \.id) { bank in
                                Text(bank.name).tag(bank.id as UUID?)
                            }
                        }
                    }
                    
                    TextField("Tags (separadas por vírgula)", text: $tags)
                }
                
                Section("Parcelamento") {
                    Toggle("Compra parcelada", isOn: $isInstallment)
                    
                    if isInstallment {
                        Stepper("Número de parcelas: \(installmentCount)", value: $installmentCount, in: 2...24)
                    }
                }
            }
            .navigationTitle("Nova Transação")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancelar") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Salvar") {
                        saveTransaction()
                    }
                    .disabled(!isFormValid)
                }
            }
        }
    }
    
    private var isFormValid: Bool {
        return !title.isEmpty && !amount.isEmpty && Double(amount) != nil
    }
    
    private func saveTransaction() {
        guard let amountValue = Double(amount) else { return }
        
        let formatter = ISO8601DateFormatter()
        let dateString = formatter.string(from: selectedDate)
        
        let tagArray = tags.isEmpty ? [] : tags.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces) }
        
        let transaction = CreateTransactionRequest(
            title: title,
            description: description.isEmpty ? nil : description,
            amount: Decimal(amountValue),
            type: selectedType.rawValue,
            date: dateString,
            categoryId: nil, // Will be handled by the backend
            tags: tagArray.isEmpty ? nil : tagArray,
            paymentMethod: selectedPaymentMethod.rawValue,
            bankId: selectedBankId,
            isInstallment: isInstallment,
            installmentDetails: isInstallment ? InstallmentDetails(
                current: 1,
                total: installmentCount,
                groupId: UUID()
            ) : nil
        )
        
        financeManager.addTransaction(transaction)
        dismiss()
    }
}

#Preview {
    AddTransactionView()
        .environmentObject(FinanceManager())
}