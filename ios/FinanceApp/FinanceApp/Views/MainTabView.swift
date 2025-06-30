//
//  MainTabView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var financeManager: FinanceManager
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Dashboard")
                }
                .tag(0)
            
            TransactionsView()
                .tabItem {
                    Image(systemName: "creditcard.fill")
                    Text("Transações")
                }
                .tag(1)
            
            BudgetsView()
                .tabItem {
                    Image(systemName: "target")
                    Text("Orçamentos")
                }
                .tag(2)
            
            GoalsView()
                .tabItem {
                    Image(systemName: "flag.fill")
                    Text("Metas")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Perfil")
                }
                .tag(4)
        }
        .accentColor(.blue)
        .onAppear {
            financeManager.loadAllData()
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(FinanceManager())
}