//
//  KeychainManager.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation
import Security

class KeychainManager {
    static let shared = KeychainManager()
    
    private let service = "com.financeapp.ios"
    private let authSessionKey = "auth_session"
    
    private init() {}
    
    // MARK: - Auth Session Management
    func saveAuthSession(_ session: AuthSession) {
        do {
            let data = try JSONEncoder().encode(session)
            save(data, forKey: authSessionKey)
        } catch {
            print("Failed to save auth session: \(error)")
        }
    }
    
    func getAuthSession() -> AuthSession? {
        guard let data = load(forKey: authSessionKey) else { return nil }
        
        do {
            return try JSONDecoder().decode(AuthSession.self, from: data)
        } catch {
            print("Failed to decode auth session: \(error)")
            return nil
        }
    }
    
    func deleteAuthSession() {
        delete(forKey: authSessionKey)
    }
    
    // MARK: - Generic Keychain Operations
    private func save(_ data: Data, forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        
        // Delete existing item
        SecItemDelete(query as CFDictionary)
        
        // Add new item
        let status = SecItemAdd(query as CFDictionary, nil)
        
        if status != errSecSuccess {
            print("Failed to save to keychain: \(status)")
        }
    }
    
    private func load(forKey key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecSuccess {
            return result as? Data
        } else {
            return nil
        }
    }
    
    private func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
}