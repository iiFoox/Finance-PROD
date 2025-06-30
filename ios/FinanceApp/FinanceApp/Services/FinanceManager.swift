//
//  FinanceManager.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation
import Combine

@MainActor
class FinanceManager: ObservableObject {
    @Published var transactions: [Transaction] = []
    @Published var budgets: [Budget] = []
    @Published var goals: [Goal] = []
    @Published var banks: [Bank] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // Date selection
    @Published var selectedYear = Calendar.current.component(.year, from: Date())
    @Published var selectedMonth = Calendar.current.component(.month, from: Date()) - 1 // 0-based
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Computed Properties
    var currentMonthTransactions: [Transaction] {
        let calendar = Calendar.current
        return transactions.filter { transaction in
            let components = calendar.dateComponents([.year, .month], from: transaction.date)
            return components.year == selectedYear && components.month == selectedMonth + 1
        }
    }
    
    var totalIncome: Decimal {
        return currentMonthTransactions
            .filter { $0.type == .income }
            .reduce(0) { $0 + $1.amount }
    }
    
    var totalExpenses: Decimal {
        return currentMonthTransactions
            .filter { $0.type == .expense }
            .reduce(0) { $0 + $1.amount }
    }
    
    var currentBalance: Decimal {
        return totalIncome - totalExpenses
    }
    
    var formattedCurrentBalance: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: currentBalance)) ?? "R$ 0,00"
    }
    
    var formattedTotalIncome: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: totalIncome)) ?? "R$ 0,00"
    }
    
    var formattedTotalExpenses: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: totalExpenses)) ?? "R$ 0,00"
    }
    
    // MARK: - Data Loading
    func loadAllData() {
        loadTransactions()
        loadBudgets()
        loadGoals()
        loadBanks()
    }
    
    func loadTransactions() {
        isLoading = true
        
        apiService.getTransactions()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] transactions in
                    self?.transactions = transactions.sorted { $0.date > $1.date }
                }
            )
            .store(in: &cancellables)
    }
    
    func loadBudgets() {
        apiService.getBudgets()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] budgets in
                    self?.budgets = budgets
                }
            )
            .store(in: &cancellables)
    }
    
    func loadGoals() {
        apiService.getGoals()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] goals in
                    self?.goals = goals.sorted { goal1, goal2 in
                        if goal1.isCompleted != goal2.isCompleted {
                            return !goal1.isCompleted
                        }
                        return goal1.priority.sortOrder < goal2.priority.sortOrder
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func loadBanks() {
        apiService.getBanks()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] banks in
                    self?.banks = banks
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Transaction Management
    func addTransaction(_ transaction: CreateTransactionRequest) {
        apiService.createTransaction(transaction)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newTransaction in
                    self?.transactions.insert(newTransaction, at: 0)
                    self?.transactions.sort { $0.date > $1.date }
                }
            )
            .store(in: &cancellables)
    }
    
    func updateTransaction(_ id: UUID, _ transaction: CreateTransactionRequest) {
        apiService.updateTransaction(id, transaction)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] updatedTransaction in
                    if let index = self?.transactions.firstIndex(where: { $0.id == id }) {
                        self?.transactions[index] = updatedTransaction
                        self?.transactions.sort { $0.date > $1.date }
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func deleteTransaction(_ id: UUID) {
        apiService.deleteTransaction(id)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.transactions.removeAll { $0.id == id }
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Budget Management
    func addBudget(_ budget: CreateBudgetRequest) {
        apiService.createBudget(budget)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newBudget in
                    self?.budgets.append(newBudget)
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Goal Management
    func addGoal(_ goal: CreateGoalRequest) {
        apiService.createGoal(goal)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newGoal in
                    self?.goals.append(newGoal)
                    self?.goals.sort { goal1, goal2 in
                        if goal1.isCompleted != goal2.isCompleted {
                            return !goal1.isCompleted
                        }
                        return goal1.priority.sortOrder < goal2.priority.sortOrder
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Bank Management
    func addBank(_ bank: CreateBankRequest) {
        apiService.createBank(bank)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newBank in
                    self?.banks.append(newBank)
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Date Selection
    func setSelectedDate(year: Int, month: Int) {
        selectedYear = year
        selectedMonth = month
    }
    
    // MARK: - Helper Methods
    func getExpensesByCategory() -> [String: Decimal] {
        var categoryExpenses: [String: Decimal] = [:]
        
        currentMonthTransactions
            .filter { $0.type == .expense }
            .forEach { transaction in
                categoryExpenses[transaction.categoryName, default: 0] += transaction.amount
            }
        
        return categoryExpenses
    }
    
    func getBudgetProgress(for category: String) -> Double {
        guard let budget = budgets.first(where: { $0.category == category }) else { return 0 }
        
        let spent = getExpensesByCategory()[category] ?? 0
        let progress = Double(truncating: NSDecimalNumber(decimal: spent)) / 
                      Double(truncating: NSDecimalNumber(decimal: budget.targetAmount))
        
        return min(max(progress, 0), 1)
    }
}

// MARK: - Create Request Models
struct CreateTransactionRequest: Codable {
    let title: String
    let description: String?
    let amount: Decimal
    let type: String
    let date: String
    let categoryId: UUID?
    let tags: [String]?
    let paymentMethod: String?
    let bankId: UUID?
    let isInstallment: Bool?
    let installmentDetails: InstallmentDetails?
    
    private enum CodingKeys: String, CodingKey {
        case title, description, amount, type, date, tags
        case categoryId = "category_id"
        case paymentMethod = "payment_method"
        case bankId = "bank_id"
        case isInstallment = "is_installment"
        case installmentDetails = "installment_details"
    }
}