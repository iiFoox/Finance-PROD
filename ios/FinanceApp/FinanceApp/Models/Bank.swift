//
//  Bank.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation
import SwiftUI

struct Bank: Identifiable, Codable, Hashable {
    let id: UUID
    let userId: UUID
    let name: String
    let color: String
    let type: BankType
    let creditLimit: Decimal?
    let closingDay: Int?
    let dueDay: Int?
    let createdAt: Date
    let updatedAt: Date
    
    // Computed properties
    var formattedCreditLimit: String? {
        guard let creditLimit = creditLimit else { return nil }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: creditLimit))
    }
    
    var displayColor: Color {
        return Color(hex: color) ?? .blue
    }
}

enum BankType: String, Codable, CaseIterable {
    case credit = "credit"
    case debit = "debit"
    case account = "account"
    
    var displayName: String {
        switch self {
        case .credit:
            return "Cartão de Crédito"
        case .debit:
            return "Cartão de Débito"
        case .account:
            return "Conta Corrente"
        }
    }
    
    var icon: String {
        switch self {
        case .credit:
            return "creditcard"
        case .debit:
            return "creditcard.fill"
        case .account:
            return "building.columns"
        }
    }
}

// MARK: - API Response Models
struct BankResponse: Codable {
    let id: UUID
    let userId: UUID
    let name: String
    let color: String
    let type: String
    let creditLimit: String?
    let closingDay: Int?
    let dueDay: Int?
    let createdAt: String
    let updatedAt: String
    
    private enum CodingKeys: String, CodingKey {
        case id, name, color, type
        case userId = "user_id"
        case creditLimit = "credit_limit"
        case closingDay = "closing_day"
        case dueDay = "due_day"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    func toBank() -> Bank? {
        guard let type = BankType(rawValue: type),
              let createdAt = ISO8601DateFormatter().date(from: createdAt),
              let updatedAt = ISO8601DateFormatter().date(from: updatedAt) else {
            return nil
        }
        
        let creditLimit = creditLimit.flatMap { Decimal(string: $0) }
        
        return Bank(
            id: id,
            userId: userId,
            name: name,
            color: color,
            type: type,
            creditLimit: creditLimit,
            closingDay: closingDay,
            dueDay: dueDay,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

struct CreateBankRequest: Codable {
    let name: String
    let color: String
    let type: String
    let creditLimit: Decimal?
    let closingDay: Int?
    let dueDay: Int?
    
    private enum CodingKeys: String, CodingKey {
        case name, color, type
        case creditLimit = "credit_limit"
        case closingDay = "closing_day"
        case dueDay = "due_day"
    }
}

// MARK: - Color Extension
extension Color {
    init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}