import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isPhone = screenWidth < 768;

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectionDotConnected: {
    backgroundColor: '#00ff88',
  },
  connectionDotDisconnected: {
    backgroundColor: '#666',
  },
});

export const buttonStyles = StyleSheet.create({
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
    color: '#00ff88',
  },
  mainButtonTextDisconnected: {
    color: '#666',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  settingsIcon: {
    fontSize: 20,
    color: '#fff',
  },
});

export const statusStyles = StyleSheet.create({
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  statusConnected: {
    color: '#00ff88',
  },
  statusDisconnected: {
    color: '#ff6b6b',
  },
});
