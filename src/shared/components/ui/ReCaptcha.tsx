import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Modal, View, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { COLORS } from '@/shared/constants';

// Site key should come from environment/config
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key for dev

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  action?: string;
}

export interface ReCaptchaRef {
  execute: () => void;
  reset: () => void;
}

export const ReCaptcha = forwardRef<ReCaptchaRef, ReCaptchaProps>(
  ({ onVerify, onError, onExpire, action = 'submit' }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [visible, setVisible] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    useImperativeHandle(ref, () => ({
      execute: () => {
        setVisible(true);
        setLoading(true);
      },
      reset: () => {
        if (webViewRef.current) {
          webViewRef.current.reload();
        }
      },
    }));

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);

          switch (data.type) {
            case 'ready':
              setLoading(false);
              // Auto-execute when ready (invisible reCAPTCHA v3)
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                  grecaptcha.ready(function() {
                    grecaptcha.execute('${RECAPTCHA_SITE_KEY}', {action: '${action}'}).then(function(token) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'token', token: token}));
                    }).catch(function(error) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', error: error.message}));
                    });
                  });
                  true;
                `);
              }
              break;

            case 'token':
              setVisible(false);
              onVerify(data.token);
              break;

            case 'error':
              setVisible(false);
              onError?.(data.error || 'reCAPTCHA verification failed');
              break;

            case 'expired':
              onExpire?.();
              break;
          }
        } catch {
          onError?.('Invalid reCAPTCHA response');
        }
      },
      [onVerify, onError, onExpire, action]
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}"></script>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: transparent;
            }
          </style>
        </head>
        <body>
          <script>
            grecaptcha.ready(function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({type: 'ready'}));
            });
          </script>
        </body>
      </html>
    `;

    if (!visible) return null;

    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            )}
            <WebView
              ref={webViewRef}
              source={{ html }}
              style={styles.webview}
              onMessage={handleMessage}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              onError={() => {
                setVisible(false);
                onError?.('Failed to load reCAPTCHA');
              }}
            />
          </View>
        </View>
      </Modal>
    );
  }
);

ReCaptcha.displayName = 'ReCaptcha';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  webview: {
    width: 1,
    height: 1,
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
