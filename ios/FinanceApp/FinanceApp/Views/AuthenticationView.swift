//
//  AuthenticationView.swift
//  FinanceApp
//
//  Created by Developer on 29/06/2025.
//

import SwiftUI

struct AuthenticationView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var isLoginMode = true
    @State private var email = ""
    @State private var password = ""
    @State private var fullName = ""
    @State private var confirmPassword = ""
    @State private var showPassword = false
    @State private var showConfirmPassword = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [.black, .gray.opacity(0.8)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 30) {
                        Spacer(minLength: 50)
                        
                        // Logo and title
                        VStack(spacing: 20) {
                            ZStack {
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [.blue, .purple],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 100, height: 100)
                                
                                Image(systemName: "chart.line.uptrend.xyaxis")
                                    .font(.system(size: 40, weight: .bold))
                                    .foregroundColor(.white)
                            }
                            
                            VStack(spacing: 8) {
                                Text("FinanceApp")
                                    .font(.largeTitle)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                
                                Text("Controle Financeiro Inteligente")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                        }
                        
                        // Auth form
                        VStack(spacing: 20) {
                            // Mode selector
                            HStack(spacing: 0) {
                                Button(action: { isLoginMode = true }) {
                                    Text("Entrar")
                                        .font(.headline)
                                        .foregroundColor(isLoginMode ? .white : .gray)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(
                                            isLoginMode ? 
                                            LinearGradient(colors: [.blue, .purple], startPoint: .leading, endPoint: .trailing) :
                                            Color.clear
                                        )
                                        .cornerRadius(8)
                                }
                                
                                Button(action: { isLoginMode = false }) {
                                    Text("Criar Conta")
                                        .font(.headline)
                                        .foregroundColor(!isLoginMode ? .white : .gray)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(
                                            !isLoginMode ? 
                                            LinearGradient(colors: [.blue, .purple], startPoint: .leading, endPoint: .trailing) :
                                            Color.clear
                                        )
                                        .cornerRadius(8)
                                }
                            }
                            .background(Color.gray.opacity(0.2))
                            .cornerRadius(10)
                            
                            // Form fields
                            VStack(spacing: 16) {
                                if !isLoginMode {
                                    CustomTextField(
                                        title: "Nome Completo",
                                        text: $fullName,
                                        icon: "person"
                                    )
                                }
                                
                                CustomTextField(
                                    title: "E-mail",
                                    text: $email,
                                    icon: "envelope"
                                )
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                
                                CustomSecureField(
                                    title: "Senha",
                                    text: $password,
                                    showPassword: $showPassword
                                )
                                
                                if !isLoginMode {
                                    CustomSecureField(
                                        title: "Confirmar Senha",
                                        text: $confirmPassword,
                                        showPassword: $showConfirmPassword
                                    )
                                }
                            }
                            
                            // Error message
                            if let errorMessage = authManager.errorMessage {
                                Text(errorMessage)
                                    .foregroundColor(.red)
                                    .font(.caption)
                                    .multilineTextAlignment(.center)
                            }
                            
                            // Submit button
                            Button(action: handleSubmit) {
                                HStack {
                                    if authManager.isLoading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                            .scaleEffect(0.8)
                                    }
                                    
                                    Text(isLoginMode ? "Entrar" : "Criar Conta")
                                        .font(.headline)
                                        .foregroundColor(.white)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(
                                    LinearGradient(
                                        colors: [.blue, .purple],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .cornerRadius(12)
                                .disabled(authManager.isLoading || !isFormValid)
                                .opacity(isFormValid ? 1.0 : 0.6)
                            }
                        }
                        .padding(.horizontal, 30)
                        
                        Spacer(minLength: 50)
                    }
                }
            }
        }
    }
    
    private var isFormValid: Bool {
        if isLoginMode {
            return !email.isEmpty && !password.isEmpty
        } else {
            return !email.isEmpty && !password.isEmpty && !fullName.isEmpty && 
                   password == confirmPassword && password.count >= 6
        }
    }
    
    private func handleSubmit() {
        if isLoginMode {
            authManager.login(email: email, password: password)
        } else {
            authManager.register(fullName: fullName, email: email, password: password)
        }
    }
}

struct CustomTextField: View {
    let title: String
    @Binding var text: String
    let icon: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.gray)
                .frame(width: 20)
            
            TextField(title, text: $text)
                .foregroundColor(.white)
        }
        .padding()
        .background(Color.gray.opacity(0.2))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
        )
    }
}

struct CustomSecureField: View {
    let title: String
    @Binding var text: String
    @Binding var showPassword: Bool
    
    var body: some View {
        HStack {
            Image(systemName: "lock")
                .foregroundColor(.gray)
                .frame(width: 20)
            
            if showPassword {
                TextField(title, text: $text)
                    .foregroundColor(.white)
            } else {
                SecureField(title, text: $text)
                    .foregroundColor(.white)
            }
            
            Button(action: { showPassword.toggle() }) {
                Image(systemName: showPassword ? "eye.slash" : "eye")
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.2))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
        )
    }
}

#Preview {
    AuthenticationView()
        .environmentObject(AuthManager())
}