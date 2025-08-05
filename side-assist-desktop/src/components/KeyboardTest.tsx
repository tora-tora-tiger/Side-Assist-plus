import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardActions, Button, Icon } from './ui';

interface KeyboardTestProps {
  isLoading: boolean;
  testResult: string;
  hasAccessibilityPermission: boolean | null;
  disableKeyboardWhenDenied: boolean;
  onTest: (text: string) => void;
}

export const KeyboardTest: React.FC<KeyboardTestProps> = ({
  isLoading,
  testResult,
  hasAccessibilityPermission,
  disableKeyboardWhenDenied,
  onTest,
}) => {
  const [testText, setTestText] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (testText.trim()) {
      onTest(testText.trim());
    }
  };

  const isDisabled = !testText.trim() || 
    isLoading || 
    (disableKeyboardWhenDenied && hasAccessibilityPermission === false);

  const getResultVariant = () => {
    if (testResult.includes('Failed') || testResult.includes('アクセシビリティ権限')) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon name="keyboard" size="lg" />
          <CardTitle>Keyboard Test</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="test-input" className="block text-sm font-medium text-gray-700 mb-2">
              Test Text
            </label>
            <input
              id="test-input"
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Type something to test keyboard simulation..."
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
            />
          </div>

          {testResult && (
            <div className={`text-sm font-medium ${getResultVariant()}`}>
              {testResult}
            </div>
          )}

          {disableKeyboardWhenDenied && hasAccessibilityPermission === false && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Icon name="warning" className="text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700">
                Accessibility permission is required. Please grant permission in the System Permissions section.
              </p>
            </div>
          )}
        </form>
      </CardContent>

      <CardActions>
        <Button
          variant="primary"
          onClick={() => handleSubmit()}
          loading={isLoading}
          disabled={isDisabled}
        >
          <Icon name="play" className="mr-2" />
          {isLoading ? 'Testing...' : 'Test Typing'}
        </Button>
      </CardActions>
    </Card>
  );
};