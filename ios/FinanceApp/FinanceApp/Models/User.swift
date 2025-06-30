//
//  User.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import Foundation

struct User: Identifiable, Codable {
    let id: UUID
    let email: String
    let fullName: String?
    let avatarUrl: String?
    let createdAt: Date
    let updatedAt: Date
    
    var displayName: String {
        return fullName ?? email.components(separatedBy: "@").first ?? "Usuário"
    }
    
    var initials: String {
        let name = displayName
        let components = name.components(separatedBy: " ")
        if components.count >= 2 {
            return String(components[0].prefix(1) + components[1].prefix(1)).uppercased()
        } else {
            return String(name.prefix(2)).uppercased()
        }
    }
}

// MARK: - API Response Models
struct UserResponse: Codable {
    let id: UUID
    let email: String?
    let fullName: String?
    let avatarUrl: String?
    let createdAt: String
    let updatedAt: String
    
    private enum CodingKeys: String, CodingKey {
        case id, email
        case fullName = "full_name"
        case avatarUrl = "avatar_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
    
    func toUser() -> User? {
        guard let email = email,
              let createdAt = ISO8601DateFormatter().date(from: createdAt),
              let updatedAt = ISO8601DateFormatter().date(from: updatedAt) else {
            return nil
        }
        
        return User(
            id: id,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

// MARK: - Authentication Models
struct AuthSession: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Date
    let user: User
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let fullName: String
    
    private enum CodingKeys: String, CodingKey {
        case email, password
        case fullName = "full_name"
    }
}

struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: String
    let user: UserResponse
    
    private enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
        case user
    }
    
    func toAuthSession() -> AuthSession? {
        guard let expiresAt = ISO8601DateFormatter().date(from: expiresAt),
              let user = user.toUser() else {
            return nil
        }
        
        return AuthSession(
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresAt: expiresAt,
            user: user
        )
    }
}