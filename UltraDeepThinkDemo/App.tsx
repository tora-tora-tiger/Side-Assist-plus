import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  TextInput,
  NativeModules,
  Dimensions,
} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const isPhone = screenWidth < 768; // iPhone判定

// mDNS + HTTP approach - the reliable solution!
const SERVICE_TYPE = '_ultradeepthink._tcp';
const SERVICE_NAME = 'UltraDeepThink-Service';
const HTTP_PORT = 8080;

const App = () => {
  const [servicePublished, setServicePublished] = useState(false);
  const [connectedClients, setConnectedClients] = useState<string[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [localIP, setLocalIP] = useState<string>('Detecting...');
  const [macIP, setMacIP] = useState<string>('Searching...');
  const [showManualMode, setShowManualMode] = useState(false);
  const [isSearchingMac, setIsSearchingMac] = useState(false);

  useEffect(() => {
    console.log('🚀 [DEBUG] App component mounted');
    initializeService();
    return () => {
      // Cleanup when component unmounts
      console.log('🛑 [DEBUG] App component unmounting');
      stopService();
    };
  }, []);

  const initializeService = async () => {
    try {
      console.log('🚀 Initializing service...');
      
      // Get local IP address
      getLocalIPAddress();
      
      Alert.alert(
        'Ready to Connect',
        'Service initialized! Press "Start Service" to begin advertising.'
      );
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Setup Failed', 'Could not initialize service');
    }
  };
  
  const getLocalIPAddress = () => {
    // Show instructions to get IP from WiFi settings
    setLocalIP('Settings → WiFi → (i) → IP Address');
  };

  const scanForMacServer = async () => {
    console.log('🔍 [DEBUG] scanForMacServer started');
    setIsSearchingMac(true);
    setMacIP('Scanning network...');
    
    try {
      // Get current IP range
      const subnet = await getNetworkSubnet();
      console.log('🔍 [DEBUG] Scanning subnet:', subnet);
      
      // Try common IP addresses in parallel
      const promises = [];
      for (let i = 1; i <= 254; i++) {
        const testIP = `${subnet}.${i}`;
        promises.push(testMacConnection(testIP));
      }
      
      const results = await Promise.allSettled(promises);
      const successfulIPs = results
        .map((result, index) => ({
          ip: `${subnet}.${index + 1}`,
          success: result.status === 'fulfilled' && result.value
        }))
        .filter(item => item.success)
        .map(item => item.ip);
      
      if (successfulIPs.length > 0) {
        setMacIP(successfulIPs[0]);
        console.log('✅ [DEBUG] Found Mac server at:', successfulIPs[0]);
        console.log('✅ [DEBUG] All found servers:', successfulIPs);
      } else {
        setMacIP('Not found - Use manual mode');
        console.log('❌ [DEBUG] No Mac server found on subnet:', subnet);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setMacIP('Scan failed - Use manual mode');
    } finally {
      setIsSearchingMac(false);
    }
  };

  const getNetworkSubnet = async (): Promise<string> => {
    // Simple approach: assume 192.168.1.x or 192.168.0.x
    // In production, would use native network info
    return '192.168.1';
  };

  const testMacConnection = async (ip: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      
      const response = await fetch(`http://${ip}:8080/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  };

  const startService = async () => {
    try {
      console.log('🚀 Starting Auto HTTP Service...');
      
      setServicePublished(true);
      setShowManualMode(true);
      
      // Start scanning for Mac server
      scanForMacServer();
      
      Alert.alert(
        'Service Started!', 
        'Auto-scanning for Mac server...\n\nMake sure Mac HTTP server is running:\n./start-mac.sh'
      );
      
    } catch (error) {
      console.error('Service start error:', error);
      Alert.alert('Failed to Start', `Could not start service: ${error}`);
    }
  };

  const stopService = async () => {
    try {
      console.log('🛑 Stopping service...');
      
      setServicePublished(false);
      setConnectedClients([]);
      setPendingMessage(null);
      
      Alert.alert('Service Stopped', 'Clipboard mode stopped');
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const sendUltraDeepThink = async () => {
    if (!servicePublished) {
      Alert.alert('Service Not Started', 'Please start the service first');
      return;
    }

    try {
      const message = 'ultradeepthink';
      console.log('📤 Sending message via HTTP:', message);
      
      // Try to send to Mac via HTTP (using discovered IP)
      if (macIP && !macIP.includes('Searching') && !macIP.includes('Not found') && !macIP.includes('failed')) {
        try {
          const response = await fetch(`http://${macIP}:8080/input`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: message }),
          });
          
          if (response.ok) {
            Alert.alert('✅ Success!', `Automatically sent "${message}" to Mac!\n\nMac IP: ${macIP}`);
            return;
          }
        } catch (httpError) {
          console.log('HTTP failed:', httpError);
          Alert.alert('Connection Failed', `Could not reach Mac at ${macIP}\n\nPlease:\n1. Check Mac server is running\n2. Try "Find Mac" button\n3. Use manual copy as backup`);
          return;
        }
      }
      
      // Fallback to clipboard mode
      setPendingMessage(message);
      setTimeout(() => setPendingMessage(null), 5000);
      
      Alert.alert(
        'Manual Copy Required!', 
        `Mac server not found. Please manually copy:\n\n"${message}"\n\nOr:\n1. Start Mac server: ./start-mac.sh\n2. Press "Find Mac" button\n3. Try again`
      );
      
    } catch (error) {
      console.error('Send error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Send Failed', `Could not prepare message: ${errorMessage}`);
    }
  };

  // TODO: Setup WebSocket connection event listeners
  // useEffect(() => {
  //   if (servicePublished) {
  //     // Handle WebSocket connections
  //   }
  // }, [servicePublished]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ultra Deep Think Demo</Text>
        <Text style={styles.subtitle}>iPhone/iPad → Mac Keyboard</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: {servicePublished ? '🟢 Ready' : '🔴 Stopped'}
          </Text>
          <Text style={styles.statusText}>
            Mac IP: {macIP}
          </Text>
          <Text style={[styles.statusText, macIP.includes('Not found') || macIP.includes('failed') ? styles.errorText : {}]}>
            Connection: {
              macIP.includes('Searching') ? '🔍 Scanning...' :
              macIP.includes('Not found') || macIP.includes('failed') ? '❌ No Mac Found' :
              macIP.length > 7 ? '✅ Mac Found' : '⚪ Waiting'
            }
          </Text>
          <Text style={styles.statusText}>
            Port: {HTTP_PORT}
          </Text>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>🚀 Quick Start:</Text>
          <Text style={styles.instructionText}>
            1. Mac: Run "./start-mac.sh"{'\n'}
            2. {Platform.OS === 'ios' ? (isPhone ? 'iPhone' : 'iPad') : 'Device'}: Press "Start Service"{'\n'}
            3. {Platform.OS === 'ios' ? (isPhone ? 'iPhone' : 'iPad') : 'Device'}: Press "Send Message"{'\n'}
            4. ✅ Auto-typing on Mac!
          </Text>
        </View>
        
        {!servicePublished && (
          <TouchableOpacity
            style={[styles.button, styles.manualButton]}
            onPress={() => setShowManualMode(!showManualMode)}>
            <Text style={styles.buttonText}>
              {showManualMode ? 'Hide Manual Mode' : 'Manual Mode (IP Address)'}
            </Text>
          </TouchableOpacity>
        )}
        
        {showManualMode && (
          <View style={styles.manualContainer}>
            <Text style={styles.manualTitle}>📱 Ready to Test:</Text>
            <Text style={styles.manualText}>
              Text to copy: "ultradeepthink"{'\n'}{'\n'}
              Mac Commands:{'\n'}  
              • ./start-mac.sh (auto server){'\n'}
              • ./test-http.sh (manual test){'\n'}{'\n'}
              Works on iPhone & iPad! 🎉
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button, 
              servicePublished ? styles.disconnectButton : styles.scanButton
            ]}
            onPress={servicePublished ? stopService : startService}>
            <Text style={styles.buttonText}>
              {servicePublished ? 'Stop Service' : 'Start Service'}
            </Text>
          </TouchableOpacity>

          {servicePublished && (
            <TouchableOpacity
              style={[styles.button, styles.findButton]}
              onPress={scanForMacServer}
              disabled={isSearchingMac}>
              <Text style={styles.buttonText}>
                {isSearchingMac ? 'Scanning...' : 'Find Mac'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.sendButton,
              !servicePublished && styles.disabledButton,
            ]}
            onPress={sendUltraDeepThink}
            disabled={!servicePublished}>
            <Text style={[
              styles.buttonText, 
              !servicePublished && styles.disabledText
            ]}>
              Send "ultradeepthink"
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: isPhone ? 'flex-start' : 'center',
    alignItems: 'center',
    padding: isPhone ? 16 : 20,
    paddingTop: isPhone ? 50 : 20,
  },
  title: {
    fontSize: isPhone ? 24 : 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isPhone ? 14 : 16,
    color: '#666',
    marginBottom: isPhone ? 20 : 40,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: isPhone ? 16 : 20,
    borderRadius: 10,
    marginBottom: isPhone ? 20 : 40,
    minWidth: isPhone ? screenWidth - 40 : 250,
    maxWidth: isPhone ? screenWidth - 40 : 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: isPhone ? 14 : 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  deviceText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: isPhone ? screenWidth - 40 : 300,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButton: {
    backgroundColor: '#34C759',
  },
  sendButton: {
    backgroundColor: '#FF9500',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
  errorText: {
    color: '#FF3B30',
  },
  findButton: {
    backgroundColor: '#007AFF',
  },
  instructionContainer: {
    backgroundColor: '#f0f8ff',
    padding: isPhone ? 16 : 20,
    borderRadius: 10,
    marginVertical: isPhone ? 12 : 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    maxWidth: isPhone ? screenWidth - 40 : undefined,
  },
  instructionTitle: {
    fontSize: isPhone ? 16 : 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: isPhone ? 12 : 14,
    color: '#333',
    lineHeight: isPhone ? 18 : 20,
  },
  manualButton: {
    backgroundColor: '#007AFF',
    marginVertical: 10,
  },
  manualContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  manualText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
});

export default App;
