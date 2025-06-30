//
//  BudgetProgressView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct BudgetProgressView: View {
    let budget: Budget
    @EnvironmentObject var financeManager: FinanceManager
    
    private var spent: Decimal {
        return financeManager.getExpensesByCategory()[budget.category] ?? 0
    }
    
    private var progress: Double {
        return financeManager.getBudgetProgress(for: budget.category)
    }
    
    private var progressColor: Color {
        if progress >= 1.0 {
            return .red
        } else if progress >= 0.8 {
            return .orange
        } else {
            return .green
        }
    }
    
    private var formattedSpent: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: NSDecimalNumber(decimal: spent)) ?? "R$ 0,00"
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(budget.category)
                    .font(.headline)
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("\(Int(progress * 100))%")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(progressColor)
            }
            
            HStack {
                Text(formattedSpent)
                    .font(.subheadline)
                    .foregroundColor(.white)
                
                Text("de")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                Text(budget.formattedTargetAmount)
                    .font(.subheadline)
                    .foregroundColor(.gray)
                
                Spacer()
            }
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 6)
                        .cornerRadius(3)
                    
                    Rectangle()
                        .fill(progressColor)
                        .frame(width: geometry.size.width * min(progress, 1.0), height: 6)
                        .cornerRadius(3)
                        .animation(.easeInOut(duration: 0.3), value: progress)
                }
            }
            .frame(height: 6)
            
            if progress >= Double(budget.alertThreshold) / 100.0 {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                        .font(.caption)
                    
                    Text(progress >= 1.0 ? "Orçamento excedido!" : "Atenção: próximo do limite")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
            }
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

#Preview {
    BudgetProgressView(
        budget: Budget(
            id: UUID(),
            userId: UUID(),
            category: "Alimentação",
            targetAmount: 1000,
            month: "2024-06",
            alertThreshold: 80,
            createdAt: Date(),
            updatedAt: Date()
        )
    )
    .environmentObject(FinanceManager())
    .padding()
    .background(Color.black)
}