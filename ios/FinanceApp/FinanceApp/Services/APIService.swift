//
//  APIService.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation
import Combine

class APIService: ObservableObject {
    static let shared = APIService()
    
    private let baseURL = "https://your-supabase-url.supabase.co"
    private let apiKey = "your-supabase-anon-key"
    private var authToken: String?
    
    private let session = URLSession.shared
    private var cancellables = Set<AnyCancellable>()
    
    private init() {}
    
    // MARK: - Authentication
    func setAuthToken(_ token: String) {
        authToken = token
    }
    
    func clearAuthToken() {
        authToken = nil
    }
    
    // MARK: - Headers
    private var defaultHeaders: [String: String] {
        var headers = [
            "Content-Type": "application/json",
            "apikey": apiKey
        ]
        
        if let authToken = authToken {
            headers["Authorization"] = "Bearer \(authToken)"
        }
        
        return headers
    }
    
    // MARK: - Authentication Endpoints
    func login(_ request: LoginRequest) -> AnyPublisher<AuthSession, Error> {
        let url = URL(string: "\(baseURL)/auth/v1/token?grant_type=password")!
        
        return performRequest(url: url, method: "POST", body: request)
            .compactMap { (response: AuthResponse) in response.toAuthSession() }
            .eraseToAnyPublisher()
    }
    
    func register(_ request: RegisterRequest) -> AnyPublisher<AuthSession, Error> {
        let url = URL(string: "\(baseURL)/auth/v1/signup")!
        
        return performRequest(url: url, method: "POST", body: request)
            .compactMap { (response: AuthResponse) in response.toAuthSession() }
            .eraseToAnyPublisher()
    }
    
    func refreshToken(_ refreshToken: String) -> AnyPublisher<AuthSession, Error> {
        let url = URL(string: "\(baseURL)/auth/v1/token?grant_type=refresh_token")!
        let body = ["refresh_token": refreshToken]
        
        return performRequest(url: url, method: "POST", body: body)
            .compactMap { (response: AuthResponse) in response.toAuthSession() }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Transaction Endpoints
    func getTransactions() -> AnyPublisher<[Transaction], Error> {
        let url = URL(string: "\(baseURL)/rest/v1/transactions?select=*,categories(name)&order=date.desc")!
        
        return performRequest(url: url, method: "GET")
            .map { (responses: [TransactionResponse]) in
                responses.compactMap { $0.toTransaction() }
            }
            .eraseToAnyPublisher()
    }
    
    func createTransaction(_ request: CreateTransactionRequest) -> AnyPublisher<Transaction, Error> {
        let url = URL(string: "\(baseURL)/rest/v1/transactions")!
        
        return performRequest(url: url, method: "POST", body: request)
            .compactMap { (response: TransactionResponse) in response.toTransaction() }
            .eraseToAnyPublisher()
    }
    
    func updateTransaction(_ id: UUID, _ request: CreateTransactionRequest) -> AnyPublisher<Transaction, Error> {
        let url = URL(string: "\(baseURL)/rest/v1/transactions?id=eq.\(id.uuidString)")!
        
        return performRequest(url: url, method: "PATCH", body: request)
            .compactMap { (response: TransactionResponse) in response.toTransaction() }
            .eraseToAnyPublisher()
    }
    
    func deleteTransaction(_ id: UUID) -> AnyPublisher<Void, Error> {
        let url = URL(string: "\(baseURL)/rest/v1/transactions?id=eq.\(id.uuidString)")!
        
        return performRequest(url: url, method: "DELETE")
            .map { (_: EmptyResponse) in () }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Budget Endpoints
    func getBudgets() -> AnyPublisher<[Budget], Error> {
        let url = URL(string: "\(baseURL)/rest/v1/budgets")!
        
        return performRequest(url: url, method: "GET")
            .map { (responses: [BudgetResponse]) in
                responses.compactMap { $0.toBudget() }
            }
            .eraseToAnyPublisher()
    }
    
    func createBudget(_ request: CreateBudgetRequest) -> AnyPublisher<Budget, Error> {
        let url = URL(string: "\(baseURL)/rest/v1/budgets")!
        
        return performRequest(url: url, method: "POST", body: request)
            .compactMap { (response: BudgetResponse) in response.toBudget() }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Goal Endpoints
    func getGoals() -> AnyPublisher<[Goal], Error> {
        let url = URL(string: "\(baseURL)/rest/v1/goals")!
        
        return performRequest(url: url, method: "GET")
            .map { (responses: [GoalResponse]) in
                responses.compactMap { $0.toGoal() }
            }
            .eraseToAnyPublisher()
    }
    
    func createGoal(_ request: CreateGoalRequest) -> AnyPublisher<Goal, Error> {
        let url = URL(string: "\(baseURL)/rest/v1/goals")!
        
        return performRequest(url: url, method: "POST", body: request)
            .compactMap { (response: GoalResponse) in response.toGoal() }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Bank Endpoints
    func getBanks() -> AnyPublisher<[Bank], Error> {
        let url = URL(string: "\(baseURL)/rest/v1/banks")!
        
        return performRequest(url: url, method: "GET")
            .map { (responses: [BankResponse]) in
                responses.compactMap { $0.toBank() }
            }
            .eraseToAnyPublisher()
    }
    
    func createBank(_ request: CreateBankRequest) -> AnyPublisher<Bank, Error> {
        let url = URL(string: "\(baseURL)/rest/v1/banks")!
        
        return performRequest(url: url, method: "POST", body: request)
            .compactMap { (response: BankResponse) in response.toBank() }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Generic Request Method
    private func performRequest<T: Codable, U: Codable>(
        url: URL,
        method: String,
        body: T? = nil
    ) -> AnyPublisher<U, Error> {
        var request = URLRequest(url: url)
        request.httpMethod = method
        
        // Add headers
        for (key, value) in defaultHeaders {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        // Add body if provided
        if let body = body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                return Fail(error: error).eraseToAnyPublisher()
            }
        }
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: U.self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
    }
    
    private func performRequest<U: Codable>(
        url: URL,
        method: String
    ) -> AnyPublisher<U, Error> {
        var request = URLRequest(url: url)
        request.httpMethod = method
        
        // Add headers
        for (key, value) in defaultHeaders {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: U.self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
    }
}

// MARK: - Helper Types
struct EmptyResponse: Codable {}