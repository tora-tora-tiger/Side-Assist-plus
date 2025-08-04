import Foundation
import Network
import Carbon

class HTTPKeyboardServer {
    private var listener: NWListener?
    private let port: NWEndpoint.Port = 8080
    private var connectedClients: Set<String> = []
    private var lastHealthCheck: [String: Date] = [:]
    
    func start() {
        print("🚀 HTTP Keyboard Server Starting on port \(port)")
        print("🎯 Waiting for mobile HTTP requests...")
        print("📱 Mobile can now send POST to http://localhost:\(port)/input")
        print("💓 Health check endpoint: http://localhost:\(port)/health")
        print("")
        
        // Start client cleanup timer
        startClientCleanupTimer()
        
        do {
            listener = try NWListener(using: .tcp, on: port)
            
            listener?.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    print("✅ Server ready on port \(self.port)")
                case .failed(let error):
                    print("❌ Server failed: \(error)")
                case .cancelled:
                    print("🛑 Server cancelled")
                default:
                    break
                }
            }
            
            listener?.newConnectionHandler = { [weak self] connection in
                self?.handleConnection(connection)
            }
            
            listener?.start(queue: DispatchQueue.main)
            
        } catch {
            print("❌ Failed to start server: \(error)")
        }
    }
    
    private func handleConnection(_ connection: NWConnection) {
        connection.stateUpdateHandler = { state in
            switch state {
            case .ready:
                print("📡 New connection established")
            case .failed(let error):
                print("❌ Connection failed: \(error)")
            default:
                break
            }
        }
        
        connection.start(queue: DispatchQueue.main)
        
        receiveRequest(connection)
    }
    
    private func receiveRequest(_ connection: NWConnection) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 8192) { [weak self] data, context, isComplete, error in
            
            if let error = error {
                print("❌ Receive error: \(error)")
                connection.cancel()
                return
            }
            
            guard let data = data, !data.isEmpty else {
                connection.cancel()
                return
            }
            
            if let requestString = String(data: data, encoding: .utf8) {
                self?.processHTTPRequest(requestString, connection: connection)
            }
            
            if !isComplete {
                self?.receiveRequest(connection)
            }
        }
    }
    
    private func processHTTPRequest(_ request: String, connection: NWConnection) {
        print("📨 Received HTTP request")
        
        let lines = request.components(separatedBy: "\r\n")
        guard let firstLine = lines.first else {
            sendResponse(connection, status: "400 Bad Request", body: "Invalid request")
            return
        }
        
        let parts = firstLine.components(separatedBy: " ")
        guard parts.count >= 3 else {
            sendResponse(connection, status: "400 Bad Request", body: "Invalid request")
            return
        }
        
        let method = parts[0]
        let path = parts[1]
        
        // Handle health check endpoint with client tracking
        if method == "GET" && path == "/health" {
            // Extract client ID from headers if present
            var clientID = "anonymous"
            for line in lines {
                if line.lowercased().hasPrefix("x-client-id:") {
                    clientID = String(line.dropFirst(12)).trimmingCharacters(in: .whitespaces)
                    break
                }
            }
            
            // Update client tracking
            connectedClients.insert(clientID)
            lastHealthCheck[clientID] = Date()
            
            let responseBody = """
            {
                "status": "ok", 
                "service": "Side Assist Mac Server",
                "clientID": "\(clientID)",
                "timestamp": "\(Date().timeIntervalSince1970)",
                "connectedClients": \(connectedClients.count)
            }
            """
            
            print("💓 Health check from \(clientID) - \(connectedClients.count) clients connected")
            sendResponse(connection, status: "200 OK", body: responseBody)
            return
        }
        
        // Handle input endpoint
        if method == "POST" && path == "/input" {
            // Continue with existing POST /input logic
        } else {
            sendResponse(connection, status: "404 Not Found", body: "Endpoint not found")
            return
        }
        
        // Find JSON body
        if let bodyStartIndex = request.range(of: "\r\n\r\n")?.upperBound {
            let jsonString = String(request[bodyStartIndex...])
            
            if let jsonData = jsonString.data(using: .utf8),
               let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any],
               let text = json["text"] as? String {
                
                print("⌨️ Processing keyboard input: '\(text)'")
                
                // Small delay to ensure response is sent first
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.simulateKeyboardInput(text)
                }
                
                sendResponse(connection, status: "200 OK", body: "{\"success\": true, \"message\": \"Text input successful\"}")
                return
            }
        }
        
        sendResponse(connection, status: "400 Bad Request", body: "Invalid JSON body")
    }
    
    private func sendResponse(_ connection: NWConnection, status: String, body: String) {
        let response = """
        HTTP/1.1 \(status)
        Content-Type: application/json
        Content-Length: \(body.utf8.count)
        Access-Control-Allow-Origin: *
        Access-Control-Allow-Methods: POST, OPTIONS
        Access-Control-Allow-Headers: Content-Type
        
        \(body)
        """
        
        if let responseData = response.data(using: .utf8) {
            connection.send(content: responseData, completion: .contentProcessed { error in
                if let error = error {
                    print("❌ Send response error: \(error)")
                }
                connection.cancel()
            })
        }
    }
    
    // MARK: - Keyboard Simulation (copied from clipboard-monitor.swift)
    
    func simulateKeyboardInput(_ text: String) {
        print("⌨️ Typing: '\(text)'")
        
        for char in text {
            simulateKeyPress(char)
            Thread.sleep(forTimeInterval: 0.05)
        }
        
        print("✅ Keyboard simulation complete")
    }
    
    func simulateKeyPress(_ character: Character) {
        let keyCode = getKeyCode(for: character)
        
        if keyCode != 0 {
            let keyDownEvent = CGEvent(keyboardEventSource: nil, virtualKey: keyCode, keyDown: true)
            let keyUpEvent = CGEvent(keyboardEventSource: nil, virtualKey: keyCode, keyDown: false)
            
            keyDownEvent?.post(tap: .cghidEventTap)
            keyUpEvent?.post(tap: .cghidEventTap)
        }
    }
    
    func getKeyCode(for character: Character) -> CGKeyCode {
        switch character.lowercased().first {
        case "a": return 0x00
        case "s": return 0x01
        case "d": return 0x02
        case "f": return 0x03
        case "h": return 0x04
        case "g": return 0x05
        case "z": return 0x06
        case "x": return 0x07
        case "c": return 0x08
        case "v": return 0x09
        case "b": return 0x0B
        case "q": return 0x0C
        case "w": return 0x0D
        case "e": return 0x0E
        case "r": return 0x0F
        case "y": return 0x10
        case "t": return 0x11
        case "1": return 0x12
        case "2": return 0x13
        case "3": return 0x14
        case "4": return 0x15
        case "6": return 0x16
        case "5": return 0x17
        case "=": return 0x18
        case "9": return 0x19
        case "7": return 0x1A
        case "-": return 0x1B
        case "8": return 0x1C
        case "0": return 0x1D
        case "]": return 0x1E
        case "o": return 0x1F
        case "u": return 0x20
        case "[": return 0x21
        case "i": return 0x22
        case "p": return 0x23
        case "l": return 0x25
        case "j": return 0x26
        case "'": return 0x27
        case "k": return 0x28
        case ";": return 0x29
        case "\\": return 0x2A
        case ",": return 0x2B
        case "/": return 0x2C
        case "n": return 0x2D
        case "m": return 0x2E
        case ".": return 0x2F
        case " ": return 0x31
        default: return 0
        }
    }
    
    // Client cleanup timer - remove inactive clients
    private func startClientCleanupTimer() {
        Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
            let now = Date()
            let timeout: TimeInterval = 15.0 // 15 seconds timeout
            
            var clientsToRemove: [String] = []
            for (clientID, lastSeen) in self.lastHealthCheck {
                if now.timeIntervalSince(lastSeen) > timeout {
                    clientsToRemove.append(clientID)
                }
            }
            
            for clientID in clientsToRemove {
                self.connectedClients.remove(clientID)
                self.lastHealthCheck.removeValue(forKey: clientID)
                print("🗑️ Removed inactive client: \(clientID)")
            }
            
            if !clientsToRemove.isEmpty {
                print("📊 Active clients: \(self.connectedClients.count)")
            }
        }
    }
}

let server = HTTPKeyboardServer()
server.start()

// Keep the server running
RunLoop.main.run()