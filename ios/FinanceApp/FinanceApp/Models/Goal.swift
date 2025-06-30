//
//  Goal.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation

struct Goal: Identifiable, Codable, Hashable {
    let id: UUID
    let userId: UUID
    let title: String
    let description: String?
    let targetAmount: Decimal
    let currentAmount: Decimal
    let targetDate: Date
    let category: String
    let priority: Priority
    let isCompleted: Bool
    let createdAt: Date
    let updatedAt: Date
    
    // Computed properties
    var progress: Double {
        guard targetAmount > 0 else { return 0 }
        let progress = Double(truncating: NSDecimalNumber(decimal: currentAmount)) / 
                      Double(truncating: NSDecimalNumber(decimal: targetAmount))
        return min(max(progress, 0), 1) // Clamp between 0 and 1
    }
    
    var progressPercentage: Int {
        return Int(progress * 100)
    }
    
    var remainingAmount: Decimal {
        return max(targetAmount - currentAmount, 0)
    }
    
    var formattedTargetAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: targetAmount)) ?? "R$ 0,00"
    }
    
    var formattedCurrentAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: currentAmount)) ?? "R$ 0,00"
    }
    
    var formattedRemainingAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: remainingAmount)) ?? "R$ 0,00"
    }
    
    var formattedTargetDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: targetDate)
    }
    
    var daysRemaining: Int {
        let calendar = Calendar.current
        let today = Date()
        let components = calendar.dateComponents([.day], from: today, to: targetDate)
        return components.day ?? 0
    }
    
    var isOverdue: Bool {
        return targetDate < Date() && !isCompleted
    }
}

enum Priority: String, Codable, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    
    var displayName: String {
        switch self {
        case .low:
            return "Baixa"
        case .medium:
            return "Média"
        case .high:
            return "Alta"
        }
    }
    
    var color: String {
        switch self {
        case .low:
            return "green"
        case .medium:
            return "orange"
        case .high:
            return "red"
        }
    }
    
    var sortOrder: Int {
        switch self {
        case .high:
            return 0
        case .medium:
            return 1
        case .low:
            return 2
        }
    }
}

// MARK: - API Response Models
struct GoalResponse: Codable {
    let id: UUID
    let userId: UUID
    let title: String
    let description: String?
    let targetAmount: String
    let currentAmount: String
    let targetDate: String
    let category: String
    let priority: String
    let isCompleted: Bool
    let createdAt: String
    let updatedAt: String
    
    private enum CodingKeys: String, CodingKey {
        case id, title, description, category, priority
        case userId = "user_id"
        case targetAmount = "target_amount"
        case currentAmount = "current_amount"
        case targetDate = "target_date"
        case isCompleted = "is_completed"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    func toGoal() -> Goal? {
        guard let targetAmount = Decimal(string: targetAmount),
              let currentAmount = Decimal(string: currentAmount),
              let priority = Priority(rawValue: priority),
              let targetDate = ISO8601DateFormatter().date(from: targetDate),
              let createdAt = ISO8601DateFormatter().date(from: createdAt),
              let updatedAt = ISO8601DateFormatter().date(from: updatedAt) else {
            return nil
        }
        
        return Goal(
            id: id,
            userId: userId,
            title: title,
            description: description,
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            targetDate: targetDate,
            category: category,
            priority: priority,
            isCompleted: isCompleted,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

struct CreateGoalRequest: Codable {
    let title: String
    let description: String?
    let targetAmount: Decimal
    let currentAmount: Decimal
    let targetDate: String
    let category: String
    let priority: String
    
    private enum CodingKeys: String, CodingKey {
        case title, description, category, priority
        case targetAmount = "target_amount"
        case currentAmount = "current_amount"
        case targetDate = "target_date"
    }
}