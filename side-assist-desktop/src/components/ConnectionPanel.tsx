import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardActions, Button, Badge, Icon } from './ui';

interface ConnectionPanelProps {
  oneTimePassword: string | null;
  qrCodeImage: string | null;
  isGeneratingPassword: boolean;
  isGeneratingQR: boolean;
  onGeneratePassword: () => void;
  onGenerateQR: () => void;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  oneTimePassword,
  qrCodeImage,
  isGeneratingPassword,
  isGeneratingQR,
  onGeneratePassword,
  onGenerateQR,
}) => {
  return (
    <Card variant="elevated" className="col-span-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon name="mobile" size="lg" />
          <CardTitle>iPad Connection Setup</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="qr" />
              <h3 className="text-lg font-semibold text-gray-900">
                QR Code Connection (Recommended)
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Scan this QR code with your iPad's camera to connect instantly
            </p>

            <div className="bg-white border-2 border-gray-100 rounded-xl p-6 text-center">
              {qrCodeImage ? (
                <div className="space-y-3">
                  <div 
                    dangerouslySetInnerHTML={{ __html: qrCodeImage }}
                    className="mx-auto max-w-[200px] max-h-[200px]"
                  />
                  <p className="text-xs text-gray-500">
                    Tap the QR code notification to open the app
                  </p>
                </div>
              ) : (
                <div className="py-12 space-y-2">
                  <Icon name="qr" size="2xl" className="text-gray-300" />
                  <p className="text-gray-500">
                    Generate a password first to create QR code
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="password" />
              <h3 className="text-lg font-semibold text-gray-900">
                One-Time Password
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Use for manual connection or after QR scan (valid for 5 minutes)
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-6">
              {oneTimePassword ? (
                <div className="text-center space-y-3">
                  <div className="text-4xl font-mono font-bold text-blue-900 tracking-[0.5em] bg-white rounded-lg py-4 px-6 shadow-sm">
                    {oneTimePassword}
                  </div>
                  <p className="text-sm text-blue-600">
                    Enter this password on your iPad
                  </p>
                  <Badge variant="info" size="sm">
                    <Icon name="loading" className="mr-1" />
                    Expires in 5 minutes
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <Icon name="lock" size="2xl" className="text-gray-300" />
                  <p className="text-gray-500">
                    No password generated yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardActions align="between">
        <Button
          variant="primary"
          size="lg"
          onClick={onGeneratePassword}
          loading={isGeneratingPassword || isGeneratingQR}
          disabled={isGeneratingPassword || isGeneratingQR}
        >
          <Icon name="refresh" className="mr-2" />
          {isGeneratingPassword || isGeneratingQR ? 'Generating...' : 'Generate New Password & QR Code'}
        </Button>
        
        {oneTimePassword && (
          <Button
            variant="secondary"
            onClick={onGenerateQR}
            loading={isGeneratingQR}
            disabled={isGeneratingQR}
          >
            <Icon name="qr" className="mr-2" />
            {isGeneratingQR ? 'Generating...' : 'Regenerate QR'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};