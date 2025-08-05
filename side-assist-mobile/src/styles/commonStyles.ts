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
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
