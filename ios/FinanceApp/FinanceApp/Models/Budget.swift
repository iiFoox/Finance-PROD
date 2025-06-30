//
//  Budget.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation

struct Budget: Identifiable, Codable, Hashable {
    let id: UUID
    let userId: UUID
    let category: String
    let targetAmount: Decimal
    let month: String // formato YYYY-MM
    let alertThreshold: Int
    let createdAt: Date
    let updatedAt: Date
    
    // Computed properties
    var formattedTargetAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: targetAmount)) ?? "R$ 0,00"
    }
    
    var monthYear: (month: Int, year: Int) {
        let components = month.components(separatedBy: "-")
        guard components.count == 2,
              let year = Int(components[0]),
              let month = Int(components[1]) else {
            return (month: 1, year: 2024)
        }
        return (month: month, year: year)
    }
    
    var displayMonth: String {
        let monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ]
        let (month, year) = monthYear
        guard month >= 1 && month <= 12 else { return month }
        return "\(monthNames[month - 1]) \(year)"
    }
}

// MARK: - API Response Models
struct BudgetResponse: Codable {
    let id: UUID
    let userId: UUID
    let category: String
    let targetAmount: String
    let month: String
    let alertThreshold: Int
    let createdAt: String
    let updatedAt: String
    
    private enum CodingKeys: String, CodingKey {
        case id, category, month
        case userId = "user_id"
        case targetAmount = "target_amount"
        case alertThreshold = "alert_threshold"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    func toBudget() -> Budget? {
        guard let targetAmount = Decimal(string: targetAmount),
              let createdAt = ISO8601DateFormatter().date(from: createdAt),
              let updatedAt = ISO8601DateFormatter().date(from: updatedAt) else {
            return nil
        }
        
        return Budget(
            id: id,
            userId: userId,
            category: category,
            targetAmount: targetAmount,
            month: month,
            alertThreshold: alertThreshold,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

struct CreateBudgetRequest: Codable {
    let category: String
    let targetAmount: Decimal
    let month: String
    let alertThreshold: Int
    
    private enum CodingKeys: String, CodingKey {
        case category, month
        case targetAmount = "target_amount"
        case alertThreshold = "alert_threshold"
    }
}