//
//  AuthManager.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation
import Combine

@MainActor
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        checkExistingSession()
    }
    
    func checkExistingSession() {
        // Verificar se existe uma sessão salva no Keychain
        if let session = KeychainManager.shared.getAuthSession() {
            if session.expiresAt > Date() {
                self.currentUser = session.user
                self.isAuthenticated = true
                apiService.setAuthToken(session.accessToken)
            } else {
                // Token expirado, tentar renovar
                refreshToken(session.refreshToken)
            }
        }
    }
    
    func login(email: String, password: String) {
        isLoading = true
        errorMessage = nil
        
        let request = LoginRequest(email: email, password: password)
        
        apiService.login(request)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] session in
                    self?.handleSuccessfulAuth(session)
                }
            )
            .store(in: &cancellables)
    }
    
    func register(fullName: String, email: String, password: String) {
        isLoading = true
        errorMessage = nil
        
        let request = RegisterRequest(email: email, password: password, fullName: fullName)
        
        apiService.register(request)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] session in
                    self?.handleSuccessfulAuth(session)
                }
            )
            .store(in: &cancellables)
    }
    
    func logout() {
        isAuthenticated = false
        currentUser = nil
        apiService.clearAuthToken()
        KeychainManager.shared.deleteAuthSession()
    }
    
    private func refreshToken(_ refreshToken: String) {
        apiService.refreshToken(refreshToken)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure = completion {
                        // Falha ao renovar token, fazer logout
                        self?.logout()
                    }
                },
                receiveValue: { [weak self] session in
                    self?.handleSuccessfulAuth(session)
                }
            )
            .store(in: &cancellables)
    }
    
    private func handleSuccessfulAuth(_ session: AuthSession) {
        self.currentUser = session.user
        self.isAuthenticated = true
        self.apiService.setAuthToken(session.accessToken)
        
        // Salvar sessão no Keychain
        KeychainManager.shared.saveAuthSession(session)
    }
}