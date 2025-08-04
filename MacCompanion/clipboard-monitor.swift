import Foundation
import AppKit
import Carbon

class ClipboardMonitor {
    private var lastClipboardContent = ""
    private var timer: Timer?
    
    func start() {
        print("🚀 Clipboard Monitor Started")
        print("📋 Waiting for 'ultradeepthink' in clipboard...")
        print("💡 On iPad: Copy 'ultradeepthink' to clipboard")
        print("")
        
        // Check clipboard every 0.5 seconds
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            self?.checkClipboard()
        }
        
        RunLoop.main.run()
    }
    
    func checkClipboard() {
        let pasteboard = NSPasteboard.general
        
        guard let currentContent = pasteboard.string(forType: .string) else {
            return
        }
        
        // Only process if clipboard content changed
        if currentContent != lastClipboardContent {
            lastClipboardContent = currentContent
            
            // Check if it's our target message
            if currentContent.trimmingCharacters(in: .whitespacesAndNewlines) == "ultradeepthink" {
                print("📨 Found 'ultradeepthink' in clipboard!")
                print("⌨️ Simulating keyboard input...")
                
                // Small delay to ensure focus is ready
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    self.simulateKeyboardInput("ultradeepthink")
                }
            }
        }
    }
    
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
}

let monitor = ClipboardMonitor()
monitor.start()