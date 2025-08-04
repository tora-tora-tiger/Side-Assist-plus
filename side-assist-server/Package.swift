// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MacCompanion",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(
            name: "MacCompanion",
            targets: ["MacCompanion"])
    ],
    targets: [
        .executableTarget(
            name: "MacCompanion"),
    ]
)