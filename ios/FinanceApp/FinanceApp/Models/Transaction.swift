//
//  Transaction.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation

struct Transaction: Identifiable, Codable, Hashable {
    let id: UUID
    let userId: UUID
    let categoryId: UUID?
    let title: String
    let description: String?
    let amount: Decimal
    let type: TransactionType
    let date: Date
    let createdAt: Date
    let updatedAt: Date
    let orderIndex: Int?
    let tags: [String]?
    let paymentMethod: PaymentMethod?
    let bankId: UUID?
    let isInstallment: Bool?
    let installmentDetails: InstallmentDetails?
    let invoiceMonth: Int?
    let invoiceYear: Int?
    
    // Computed properties
    var formattedAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: amount)) ?? "R$ 0,00"
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: date)
    }
    
    var categoryName: String {
        // Esta propriedade será preenchida pelo join com a tabela categories
        return "Categoria"
    }
}

enum TransactionType: String, Codable, CaseIterable {
    case income = "receita"
    case expense = "despesa"
    
    var displayName: String {
        switch self {
        case .income:
            return "Receita"
        case .expense:
            return "Despesa"
        }
    }
    
    var color: String {
        switch self {
        case .income:
            return "green"
        case .expense:
            return "red"
        }
    }
    
    var icon: String {
        switch self {
        case .income:
            return "arrow.up.circle.fill"
        case .expense:
            return "arrow.down.circle.fill"
        }
    }
}

enum PaymentMethod: String, Codable, CaseIterable {
    case money = "money"
    case creditCard = "creditCard"
    case debitCard = "debitCard"
    case pix = "pix"
    
    var displayName: String {
        switch self {
        case .money:
            return "Dinheiro"
        case .creditCard:
            return "Cartão de Crédito"
        case .debitCard:
            return "Cartão de Débito"
        case .pix:
            return "PIX"
        }
    }
    
    var icon: String {
        switch self {
        case .money:
            return "banknote"
        case .creditCard:
            return "creditcard"
        case .debitCard:
            return "creditcard.fill"
        case .pix:
            return "qrcode"
        }
    }
}

struct InstallmentDetails: Codable, Hashable {
    let current: Int
    let total: Int
    let groupId: UUID
}

// MARK: - API Response Models
struct TransactionResponse: Codable {
    let id: UUID
    let userId: UUID
    let categoryId: UUID?
    let title: String
    let description: String?
    let amount: String
    let type: String
    let date: String
    let createdAt: String
    let updatedAt: String
    let orderIndex: Int?
    let tags: [String]?
    let paymentMethod: String?
    let bankId: UUID?
    let isInstallment: Bool?
    let installmentDetails: InstallmentDetails?
    let invoiceMonth: Int?
    let invoiceYear: Int?
    let categories: CategoryResponse?
    
    private enum CodingKeys: String, CodingKey {
        case id, title, description, amount, type, date, tags
        case userId = "user_id"
        case categoryId = "category_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case orderIndex = "order_index"
        case paymentMethod = "payment_method"
        case bankId = "bank_id"
        case isInstallment = "is_installment"
        case installmentDetails = "installment_details"
        case invoiceMonth = "invoice_month"
        case invoiceYear = "invoice_year"
        case categories
    }
    
    func toTransaction() -> Transaction? {
        guard let amount = Decimal(string: amount),
              let type = TransactionType(rawValue: type),
              let date = ISO8601DateFormatter().date(from: date),
              let createdAt = ISO8601DateFormatter().date(from: createdAt),
              let updatedAt = ISO8601DateFormatter().date(from: updatedAt) else {
            return nil
        }
        
        return Transaction(
            id: id,
            userId: userId,
            categoryId: categoryId,
            title: title,
            description: description,
            amount: amount,
            type: type,
            date: date,
            createdAt: createdAt,
            updatedAt: updatedAt,
            orderIndex: orderIndex,
            tags: tags,
            paymentMethod: paymentMethod.flatMap { PaymentMethod(rawValue: $0) },
            bankId: bankId,
            isInstallment: isInstallment,
            installmentDetails: installmentDetails,
            invoiceMonth: invoiceMonth,
            invoiceYear: invoiceYear
        )
    }
}

struct CategoryResponse: Codable {
    let name: String
}