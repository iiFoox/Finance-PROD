// swift-tools-version: 5.7
import PackageDescription

let package = Package(
    name: "FinanceApp",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "FinanceApp",
            targets: ["FinanceApp"]
        ),
    ],
    dependencies: [
        // Supabase Swift SDK
        .package(url: "https://github.com/supabase/supabase-swift.git", from: "2.0.0"),
        
        // Charts for data visualization
        .package(url: "https://github.com/danielgindi/Charts.git", from: "4.1.0"),
        
        // Keychain wrapper
        .package(url: "https://github.com/jrendel/SwiftKeychainWrapper.git", from: "4.0.0"),
    ],
    targets: [
        .target(
            name: "FinanceApp",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "Charts", package: "Charts"),
                .product(name: "SwiftKeychainWrapper", package: "SwiftKeychainWrapper"),
            ]
        ),
        .testTarget(
            name: "FinanceAppTests",
            dependencies: ["FinanceApp"]
        ),
    ]
)