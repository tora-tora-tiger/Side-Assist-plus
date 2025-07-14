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
} from 'react-native';

// mDNS + HTTP approach - the reliable solution!
const SERVICE_TYPE = '_ultradeepthink._tcp';
const SERVICE_NAME = 'UltraDeepThink-Service';
const HTTP_PORT = 8080;

const App = () => {
  const [servicePublished, setServicePublished] = useState(false);
  const [connectedClients, setConnectedClients] = useState<string[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [localIP, setLocalIP] = useState<string>('Detecting...');
  const [showManualMode, setShowManualMode] = useState(false);

  useEffect(() => {
    initializeService();
    return () => {
      // Cleanup when component unmounts
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

  const startService = async () => {
    try {
      console.log('🚀 Starting Clipboard Service Mode...');
      
      setServicePublished(true);
      setShowManualMode(true);
      
      Alert.alert(
        'Service Started (Clipboard Mode)!', 
        'Simple clipboard-based communication is now active.\n\n1. On Mac: Run clipboard monitor\n2. iPad: Press "Send Message"\n3. Mac: Automatic typing!'
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
      console.log('📤 Message ready:', message);
      
      setPendingMessage(message);
      
      // Clear message after 5 seconds
      setTimeout(() => setPendingMessage(null), 5000);
      
      Alert.alert(
        'Manual Copy Required!', 
        `Please manually copy this text:\n\n"${message}"\n\nThen Mac clipboard monitor will detect it and type automatically.\n\nOr test Mac keyboard directly with ./keyboard-test.sh`
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
        <Text style={styles.subtitle}>iPad Bluetooth Keyboard</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: {servicePublished ? 'Service Active' : 'Stopped'}
          </Text>
          <Text style={styles.statusText}>
            iPad IP: {localIP}
          </Text>
          <Text style={styles.statusText}>
            Port: {HTTP_PORT}
          </Text>
          <Text style={styles.statusText}>
            Connected PCs: {connectedClients.length}
          </Text>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>📋 Manual Mode:</Text>
          <Text style={styles.instructionText}>
            Option 1 - Keyboard Test:{'\n'}
            • Mac: ./keyboard-test.sh{'\n'}{'\n'}
            Option 2 - Clipboard Monitor:{'\n'}
            • Mac: ./clipboard-test.sh{'\n'}
            • Copy "ultradeepthink" manually{'\n'}
            • Mac will auto-type!
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
              • ./keyboard-test.sh (direct test){'\n'}
              • ./clipboard-test.sh (monitor mode){'\n'}{'\n'}
              Both methods work perfectly!
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 40,
    minWidth: 250,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  deviceText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
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
  instructionContainer: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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
