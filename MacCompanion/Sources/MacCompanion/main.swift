import Foundation
import Network
import Carbon

class MacCompanion: NSObject {
    private var browser: NWBrowser?
    private var connection: NWConnection?
    private var isSearching = false
    
    override init() {
        super.init()
    }
    
    func start() {
        print("🚀 MacCompanion started - mDNS + WebSocket mode")
        print("📱 Looking for UltraDeepThink iPad service...")
        startBrowsing()
    }
    
    func startBrowsing() {
        guard !isSearching else { return }
        
        print("🔍 Browsing for _ultradeepthink._tcp services...")
        isSearching = true
        
        // Create browser for our service type
        let parameters = NWParameters()
        browser = NWBrowser(for: .bonjourWithTXTRecord(type: "_ultradeepthink._tcp", domain: nil), using: parameters)
        
        browser?.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                print("✅ Browser ready")
            case .failed(let error):
                print("❌ Browser failed: \(error)")
                self?.restartBrowsing()
            case .cancelled:
                print("🛑 Browser cancelled")
            default:
                break
            }
        }
        
        browser?.browseResultsChangedHandler = { [weak self] results, changes in
            for result in results {
                switch result.endpoint {
                case .hostPort(let host, let port):
                    print("🎯 Found UltraDeepThink service at \(host):\(port)")
                    self?.connectToService(host: host, port: port)
                    return
                default:
                    break
                }
            }
        }
        
        browser?.start(queue: DispatchQueue.main)
    }
    
    func connectToService(host: NWEndpoint.Host, port: NWEndpoint.Port) {
        browser?.cancel()
        isSearching = false
        
        print("🔗 Connecting to WebSocket at \(host):\(port)...")
        
        let endpoint = NWEndpoint.hostPort(host: host, port: port)
        let parameters = NWParameters.tcp
        
        connection = NWConnection(to: endpoint, using: parameters)
        
        connection?.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                print("✅ Connected to iPad WebSocket server!")
                print("🎹 Ready to receive messages!")
                self?.receiveMessages()
            case .failed(let error):
                print("❌ Connection failed: \(error)")
                self?.restartBrowsing()
            case .cancelled:
                print("🛑 Connection cancelled")
                self?.restartBrowsing()
            default:
                break
            }
        }
        
        connection?.start(queue: DispatchQueue.main)
    }
    
    func receiveMessages() {
        connection?.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [weak self] data, context, isComplete, error in
            if let error = error {
                print("❌ Receive error: \(error)")
                self?.restartBrowsing()
                return
            }
            
            if let data = data, !data.isEmpty {
                self?.processReceivedData(data)
            }
            
            if !isComplete {
                self?.receiveMessages()
            }
        }
    }
    
    func processReceivedData(_ data: Data) {
        // Parse WebSocket frame (simplified)
        guard data.count >= 2 else { return }
        
        let firstByte = data[0]
        let secondByte = data[1]
        
        // Check if this is a text frame (opcode 0x1) and final frame
        guard (firstByte & 0x81) == 0x81 else { return }
        
        let payloadLength = Int(secondByte & 0x7F)
        guard data.count >= 2 + payloadLength else { return }
        
        let payloadData = data.subdata(in: 2..<(2 + payloadLength))
        
        if let jsonString = String(data: payloadData, encoding: .utf8),
           let jsonData = jsonString.data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any],
           let type = json["type"] as? String,
           let message = json["data"] as? String,
           type == "message" {
            
            print("📨 Received message: '\(message)'")
            simulateKeyboardInput(message)
        }
    }
    
    func restartBrowsing() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.isSearching = false
            self.startBrowsing()
        }
    }
}

// MARK: - Keyboard Simulation

extension MacCompanion {
    func simulateKeyboardInput(_ text: String) {
        print("⌨️  Simulating keyboard input: '\(text)'")
        
        for char in text {
            simulateKeyPress(char)
            Thread.sleep(forTimeInterval: 0.05) // Small delay between keys
        }
        
        print("✅ Keyboard simulation complete")
    }
    
    func simulateKeyPress(_ character: Character) {
        let keyCode = getKeyCode(for: character)
        
        if keyCode != 0 {
            // Create key down event
            let keyDownEvent = CGEvent(keyboardEventSource: nil, virtualKey: keyCode, keyDown: true)
            
            // Create key up event
            let keyUpEvent = CGEvent(keyboardEventSource: nil, virtualKey: keyCode, keyDown: false)
            
            // Post events
            keyDownEvent?.post(tap: .cghidEventTap)
            keyUpEvent?.post(tap: .cghidEventTap)
        }
    }
    
    func getKeyCode(for character: Character) -> CGKeyCode {
        // Map characters to key codes (US keyboard layout)
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
        case " ": return 0x31  // Space
        default: return 0
        }
    }
}

// MARK: - Main App

let companion = MacCompanion()
companion.start()

// Keep the app running
RunLoop.main.run()