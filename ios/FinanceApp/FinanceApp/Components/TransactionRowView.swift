//
//  TransactionRowView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct TransactionRowView: View {
    let transaction: Transaction
    
    var body: some View {
        HStack(spacing: 12) {
            // Transaction type icon
            Image(systemName: transaction.type.icon)
                .font(.title2)
                .foregroundColor(transaction.type == .income ? .green : .red)
                .frame(width: 40, height: 40)
                .background(
                    (transaction.type == .income ? Color.green : Color.red)
                        .opacity(0.1)
                )
                .clipShape(Circle())
            
            // Transaction details
            VStack(alignment: .leading, spacing: 4) {
                Text(transaction.title)
                    .font(.headline)
                    .foregroundColor(.white)
                    .lineLimit(1)
                
                if let description = transaction.description, !description.isEmpty {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }
                
                HStack {
                    Text(transaction.categoryName)
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.2))
                        .cornerRadius(4)
                    
                    if let paymentMethod = transaction.paymentMethod {
                        Image(systemName: paymentMethod.icon)
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    
                    Spacer()
                    
                    Text(transaction.formattedDate)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            // Amount
            VStack(alignment: .trailing, spacing: 4) {
                Text(transaction.formattedAmount)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(transaction.type == .income ? .green : .red)
                
                if transaction.isInstallment == true,
                   let installmentDetails = transaction.installmentDetails {
                    Text("\(installmentDetails.current)/\(installmentDetails.total)")
                        .font(.caption)
                        .foregroundColor(.gray)
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
    TransactionRowView(
        transaction: Transaction(
            id: UUID(),
            userId: UUID(),
            categoryId: UUID(),
            title: "Supermercado",
            description: "Compras da semana",
            amount: 150.50,
            type: .expense,
            date: Date(),
            createdAt: Date(),
            updatedAt: Date(),
            orderIndex: 1,
            tags: ["alimentação"],
            paymentMethod: .creditCard,
            bankId: nil,
            isInstallment: false,
            installmentDetails: nil,
            invoiceMonth: nil,
            invoiceYear: nil
        )
    )
    .padding()
    .background(Color.black)
}