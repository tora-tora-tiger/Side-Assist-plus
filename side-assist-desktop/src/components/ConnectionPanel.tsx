import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Icon } from './ui';

interface ConnectionPanelProps {
  oneTimePassword: string | null;
  qrCodeImage: string | null;
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  oneTimePassword,
  qrCodeImage,
}) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  return (
    <Card variant="elevated" className="h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="mobile" className="text-stone-400" />
          <CardTitle className="text-stone-200">iPad Connection Setup</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-2 flex-1 min-h-0 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1">
          {/* QR Code Section */}
          <div className="space-y-1 flex flex-col">
            <div className="flex items-center gap-2">
              <Icon name="qr" className="text-stone-400" />
              <h4 className="text-sm font-medium text-stone-200">QR Code</h4>
            </div>
            <div className="bg-gray-950/50 border border-gray-700/30 rounded-lg p-2 text-center flex-1 flex items-center justify-center backdrop-blur-sm min-h-[120px]">
              {qrCodeImage ? (
                <div className="space-y-2 cursor-pointer" onClick={() => setIsQRModalOpen(true)}>
                  <div 
                    dangerouslySetInnerHTML={{ __html: qrCodeImage }}
                    className="mx-auto w-[120px] h-[120px] bg-white p-1 rounded-lg [&>svg]:w-full [&>svg]:h-full hover:scale-105 transition-transform"
                  />
                  <p className="text-xs text-stone-400">
                    Click to enlarge
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Icon name="qr" size="lg" className="text-stone-500 mx-auto" />
                  <p className="text-xs text-stone-400">
                    Generate password first
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-1 flex flex-col">
            <div className="flex items-center gap-2">
              <Icon name="lock" className="text-stone-400" />
              <h4 className="text-sm font-medium text-stone-200">Password</h4>
            </div>
            <div className="bg-gray-950/50 border border-gray-700/30 rounded-lg p-2 flex-1 flex items-center justify-center backdrop-blur-sm min-h-[120px]">
              {oneTimePassword ? (
                <div className="text-center space-y-1">
                  <div className="bg-gradient-to-r from-stone-500/20 to-stone-600/20 border border-stone-400/30 rounded-lg p-2 backdrop-blur-sm">
                    <div className="text-lg font-mono font-bold text-stone-300 tracking-[0.2em] text-center">
                      {oneTimePassword}
                    </div>
                  </div>
                  <Badge variant="default" size="sm">
                    <Icon name="clock" className="w-3 h-3 mr-1" />
                    5min
                  </Badge>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <Icon name="lock" size="lg" className="text-stone-500 mx-auto" />
                  <p className="text-xs text-stone-400">
                    No password
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>


      {/* QR Code Overlay */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg">
          {/* Background overlay - click to close */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsQRModalOpen(false)}
          />
          
          {/* QR Code Content */}
          <div className="relative z-10 text-center">
            {qrCodeImage && (
              <div className="mb-4">
                <div
                  dangerouslySetInnerHTML={{ __html: qrCodeImage }}
                  className="mx-auto w-[400px] h-[400px] bg-white p-1 rounded-2xl shadow-2xl [&>svg]:w-full [&>svg]:h-full"
                />
              </div>
            )}
            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-stone-200 text-lg font-medium">
                Scan with your iPad camera
              </p>
            </div>
            {/* Close button */}
            <button
              onClick={() => setIsQRModalOpen(false)}
              className="absolute -top-2 -right-2 bg-gray-800/80 hover:bg-gray-700/80 text-stone-300 hover:text-white rounded-full p-2 transition-colors"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};