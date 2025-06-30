//
//  GoalsView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct GoalsView: View {
    @EnvironmentObject var financeManager: FinanceManager
    @State private var showingAddGoal = false
    
    private var activeGoals: [Goal] {
        return financeManager.goals.filter { !$0.isCompleted }
    }
    
    private var completedGoals: [Goal] {
        return financeManager.goals.filter { $0.isCompleted }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 20) {
                    if financeManager.goals.isEmpty {
                        EmptyStateView(
                            icon: "flag.fill",
                            title: "Nenhuma meta",
                            subtitle: "Crie metas financeiras para manter o foco nos seus objetivos"
                        )
                        .padding(.top, 100)
                    } else {
                        // Active goals
                        if !activeGoals.isEmpty {
                            goalSection(title: "Metas Ativas", goals: activeGoals, isActive: true)
                        }
                        
                        // Completed goals
                        if !completedGoals.isEmpty {
                            goalSection(title: "Metas Concluídas", goals: completedGoals, isActive: false)
                        }
                    }
                }
                .padding()
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Metas")
            .navigationBarTitleDisplayMode(.large)
            .preferredColorScheme(.dark)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddGoal = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(.blue)
                    }
                }
            }
            .refreshable {
                financeManager.loadGoals()
            }
        }
        .sheet(isPresented: $showingAddGoal) {
            AddGoalView()
        }
    }
    
    private func goalSection(title: String, goals: [Goal], isActive: Bool) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.white)
                
                Text("(\(goals.count))")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                Spacer()
            }
            
            LazyVStack(spacing: 12) {
                ForEach(goals) { goal in
                    GoalCardView(goal: goal, isActive: isActive)
                }
            }
        }
    }
}

struct GoalCardView: View {
    let goal: Goal
    let isActive: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(goal.title)
                        .font(.headline)
                        .foregroundColor(.white)
                        .strikethrough(!isActive)
                    
                    Text(goal.category)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                // Priority indicator
                if isActive {
                    Text(goal.priority.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color(goal.priority.color))
                        .cornerRadius(8)
                }
            }
            
            // Description
            if let description = goal.description, !description.isEmpty {
                Text(description)
                    .font(.caption)
                    .foregroundColor(.gray)
                    .lineLimit(2)
            }
            
            // Progress
            if isActive {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Progresso: \(goal.progressPercentage)%")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        Text(goal.formattedCurrentAmount)
                            .font(.caption)
                            .foregroundColor(.green)
                        
                        Text("de")
                            .font(.caption)
                            .foregroundColor(.gray)
                        
                        Text(goal.formattedTargetAmount)
                            .font(.caption)
                            .foregroundColor(.white)
                    }
                    
                    // Progress bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                                .frame(height: 6)
                                .cornerRadius(3)
                            
                            Rectangle()
                                .fill(
                                    LinearGradient(
                                        colors: [.purple, .blue],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: geometry.size.width * goal.progress, height: 6)
                                .cornerRadius(3)
                                .animation(.easeInOut(duration: 0.3), value: goal.progress)
                        }
                    }
                    .frame(height: 6)
                }
            } else {
                // Completed goal summary
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    
                    Text("Meta concluída! 🎉")
                        .font(.caption)
                        .foregroundColor(.green)
                    
                    Spacer()
                    
                    Text(goal.formattedTargetAmount)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                }
            }
            
            // Footer
            HStack {
                HStack {
                    Image(systemName: "calendar")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Text(goal.formattedTargetDate)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                if isActive {
                    if goal.isOverdue {
                        Text("\(abs(goal.daysRemaining)) dias atrasado")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.red)
                    } else {
                        Text("\(goal.daysRemaining) dias restantes")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(goal.daysRemaining <= 30 ? .orange : .green)
                    }
                }
            }
        }
        .padding()
        .background(
            isActive ? 
            Color.gray.opacity(0.1) :
            Color.green.opacity(0.1)
        )
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(
                    isActive ? 
                    Color.gray.opacity(0.2) :
                    Color.green.opacity(0.3),
                    lineWidth: 1
                )
        )
    }
}

struct AddGoalView: View {
    @EnvironmentObject var financeManager: FinanceManager
    @Environment(\.dismiss) private var dismiss
    
    @State private var title = ""
    @State private var description = ""
    @State private var targetAmount = ""
    @State private var currentAmount = ""
    @State private var targetDate = Date()
    @State private var selectedCategory = "Investimentos"
    @State private var selectedPriority: Priority = .medium
    
    private let categories = [
        "Investimentos", "Viagem", "Casa", "Carro", "Educação",
        "Emergência", "Aposentadoria", "Outros"
    ]
    
    var body: some View {
        NavigationView {
            Form {
                Section("Informações da Meta") {
                    TextField("Título da meta", text: $title)
                    TextField("Descrição (opcional)", text: $description, axis: .vertical)
                        .lineLimit(3)
                }
                
                Section("Valores") {
                    HStack {
                        Text("Meta: R$")
                            .foregroundColor(.gray)
                        TextField("0,00", text: $targetAmount)
                            .keyboardType(.decimalPad)
                    }
                    
                    HStack {
                        Text("Atual: R$")
                            .foregroundColor(.gray)
                        TextField("0,00", text: $currentAmount)
                            .keyboardType(.decimalPad)
                    }
                }
                
                Section("Detalhes") {
                    DatePicker("Data alvo", selection: $targetDate, displayedComponents: [.date])
                    
                    Picker("Categoria", selection: $selectedCategory) {
                        ForEach(categories, id: \.self) { category in
                            Text(category).tag(category)
                        }
                    }
                    
                    Picker("Prioridade", selection: $selectedPriority) {
                        ForEach(Priority.allCases, id: \.self) { priority in
                            Text(priority.displayName).tag(priority)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
            }
            .navigationTitle("Nova Meta")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancelar") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Salvar") {
                        saveGoal()
                    }
                    .disabled(!isFormValid)
                }
            }
        }
    }
    
    private var isFormValid: Bool {
        return !title.isEmpty && !targetAmount.isEmpty && Double(targetAmount) != nil
    }
    
    private func saveGoal() {
        guard let targetAmountValue = Double(targetAmount) else { return }
        let currentAmountValue = Double(currentAmount) ?? 0
        
        let formatter = ISO8601DateFormatter()
        let dateString = formatter.string(from: targetDate)
        
        let goal = CreateGoalRequest(
            title: title,
            description: description.isEmpty ? nil : description,
            targetAmount: Decimal(targetAmountValue),
            currentAmount: Decimal(currentAmountValue),
            targetDate: dateString,
            category: selectedCategory,
            priority: selectedPriority.rawValue
        )
        
        financeManager.addGoal(goal)
        dismiss()
    }
}

#Preview {
    GoalsView()
        .environmentObject(FinanceManager())
}