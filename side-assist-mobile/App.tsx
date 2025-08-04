import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const isPhone = screenWidth < 768;

// mDNS + HTTP approach - the reliable solution!
const SERVICE_TYPE = '_sideassist._tcp';
const SERVICE_NAME = 'SideAssist-Service';
const HTTP_PORT = 8080;

const App = () => {
  const [servicePublished, setServicePublished] = useState(false);
  const [macIP, setMacIP] = useState<string>('');
  const [isSearchingMac, setIsSearchingMac] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMonitor, setConnectionMonitor] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🚀 [DEBUG] App component mounted');
    initializeService();
    startConnectionMonitoring();
    return () => {
      console.log('🛑 [DEBUG] App component unmounting');
      stopService();
      stopConnectionMonitoring();
    };
  }, []);

  const initializeService = async () => {
    try {
      console.log('🚀 Initializing service...');
      setServicePublished(true);
      scanForMacServer();
    } catch (error) {
      console.error('Initialization error:', error);
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
        setIsConnected(true);
        console.log('✅ [DEBUG] Found Mac server at:', successfulIPs[0]);
      } else {
        setMacIP('');
        setIsConnected(false);
        console.log('❌ [DEBUG] No Mac server found on subnet:', subnet);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setMacIP('');
      setIsConnected(false);
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
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Increased timeout
      
      const response = await fetch(`http://${ip}:8080/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Client-ID': 'SideAssist-Mobile',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'ok';
      }
      return false;
    } catch (error) {
      console.log('🔍 Connection test failed:', error.message);
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

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const sendSideAssist = async () => {
    animateButton();
    
    if (!isConnected || !macIP) {
      return;
    }

    try {
      const message = 'ultradeepthink';
      console.log('📤 Sending message via HTTP:', message);
      
      await fetch(`http://${macIP}:8080/input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });
      
    } catch (error) {
      console.log('HTTP failed:', error);
      // サイレントフォールバック
    }
  };

  // Connection monitoring with heartbeat
  const startConnectionMonitoring = () => {
    const monitor = setInterval(async () => {
      if (macIP) {
        const isAlive = await testMacConnection(macIP);
        if (isAlive !== isConnected) {
          console.log(`🔄 Connection status changed: ${isAlive ? 'Connected' : 'Disconnected'}`);
          setIsConnected(isAlive);
          
          if (!isAlive) {
            // Connection lost - try to reconnect
            console.log('🔍 Connection lost, attempting to reconnect...');
            scanForMacServer();
          }
        }
      } else if (isConnected) {
        // Had connection but lost IP
        setIsConnected(false);
        scanForMacServer();
      }
    }, 5000); // Check every 5 seconds
    
    setConnectionMonitor(monitor);
  };

  const stopConnectionMonitoring = () => {
    if (connectionMonitor) {
      clearInterval(connectionMonitor);
      setConnectionMonitor(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Settings Button */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setShowSettings(!showSettings)}>
        <Text style={styles.settingsIcon}>⚪</Text>
      </TouchableOpacity>

      {/* Connection Status Indicator */}
      <View style={styles.statusIndicator}>
        <View style={[
          styles.connectionDot, 
          { backgroundColor: isConnected ? '#00ff88' : '#666' }
        ]} />
      </View>

      <View style={styles.content}>
        {/* Connection Status Message */}
        {!isConnected && (
          <View style={styles.statusMessage}>
            <Text style={styles.statusIcon}>⚠️</Text>
            <Text style={styles.statusText}>
              {isSearchingMac ? 'Searching for Mac...' : 'Mac not found'}
            </Text>
            <Text style={styles.statusSubtext}>
              {isSearchingMac ? 'Please wait' : 'Tap settings to connect'}
            </Text>
          </View>
        )}

        {/* Main Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              isConnected ? styles.mainButtonConnected : styles.mainButtonDisconnected
            ]}
            onPress={sendSideAssist}
            disabled={!isConnected}
            activeOpacity={isConnected ? 0.8 : 1}>
            <View style={styles.buttonContent}>
              {!isConnected && (
                <Text style={styles.buttonIcon}>🔒</Text>
              )}
              <Text style={[
                styles.mainButtonText,
                isConnected ? styles.mainButtonTextConnected : styles.mainButtonTextDisconnected
              ]}>
                ultradeepthink
              </Text>
              {!isConnected && (
                <Text style={styles.buttonSubtext}>Disabled</Text>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Connection Hint */}
        {isConnected && (
          <View style={styles.connectedHint}>
            <Text style={styles.connectedIcon}>✅</Text>
            <Text style={styles.connectedText}>Connected to Mac</Text>
            <Text style={styles.connectedSubtext}>Ready to send command</Text>
          </View>
        )}
      </View>

      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>Connection</Text>
          
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Status</Text>
            <Text style={[
              styles.settingsValue,
              { color: isConnected ? '#00ff88' : '#ff6b6b' }
            ]}>
              {isSearchingMac ? 'Scanning...' : isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>

          {macIP && (
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Mac IP</Text>
              <Text style={styles.settingsValue}>{macIP}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={scanForMacServer}
            disabled={isSearchingMac}>
            <Text style={styles.refreshButtonText}>
              {isSearchingMac ? 'Scanning...' : 'Find Mac'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  settingsIcon: {
    fontSize: 20,
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mainButton: {
    width: isPhone ? 280 : 320,
    height: isPhone ? 280 : 320,
    borderRadius: isPhone ? 140 : 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 10,
  },
  mainButtonConnected: {
    backgroundColor: '#111',
    borderColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
  },
  mainButtonDisconnected: {
    backgroundColor: '#222',
    borderColor: '#555',
    borderStyle: 'dashed',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  mainButtonText: {
    fontSize: isPhone ? 24 : 28,
    fontWeight: '300',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
  },
  mainButtonTextConnected: {
    color: '#fff',
  },
  mainButtonTextDisconnected: {
    color: '#888',
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '400',
  },
  statusMessage: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  statusIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 18,
    color: '#ff6b6b',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  connectedHint: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  connectedIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  connectedText: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  connectedSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  settingsPanel: {
    position: 'absolute',
    top: 120,
    right: 24,
    left: 24,
    backgroundColor: 'rgba(17, 17, 17, 0.95)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#999',
    fontWeight: '400',
  },
  settingsValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default App;
