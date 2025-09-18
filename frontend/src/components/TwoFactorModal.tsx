import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  X, 
  Download,
  AlertTriangle
} from 'lucide-react';
import QRCode from 'qrcode';

// Implementación simple de TOTP sin librerías externas
const generateSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateTOTP = (secret: string, time: number = Math.floor(Date.now() / 1000)) => {
  // Implementación simplificada de TOTP
  const timeStep = Math.floor(time / 30);
  const timeStepHex = timeStep.toString(16).padStart(16, '0');
  
  // Simular generación de código (en producción usarías una librería real)
  const hash = timeStepHex + secret;
  const code = (parseInt(hash.substring(0, 8), 16) % 1000000).toString().padStart(6, '0');
  return code;
};

const verifyTOTP = (secret: string, token: string) => {
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Verificar código actual y los 2 anteriores (ventana de 90 segundos)
  for (let i = 0; i < 3; i++) {
    const time = currentTime - (i * 30);
    const expectedCode = generateTOTP(secret, time);
    if (expectedCode === token) {
      return true;
    }
  }
  return false;
};

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwoFactorModal({ isOpen, onClose, onSuccess }: TwoFactorModalProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [secret, setSecret] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Generar secreto TOTP al abrir el modal
  useEffect(() => {
    if (isOpen && step === 'setup') {
      generateSecretAndQR();
    }
  }, [isOpen, step]);

  const generateSecretAndQR = () => {
    try {
      const newSecret = generateSecret();
      setSecret(newSecret);
      
      // Generar URL para QR code (formato estándar)
      const otpauthUrl = `otpauth://totp/Trading%20Journal:Tu%20Academia?secret=${newSecret}&issuer=Trading%20Journal`;
      
      // Generar QR code
      QRCode.toDataURL(otpauthUrl)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generando QR:', err));
        
    } catch (error) {
      console.error('Error generando secreto:', error);
      setError('Error al generar el código 2FA');
    }
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Ingresa un código de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const verified = verifyTOTP(secret, verificationCode);

      if (verified) {
        // Generar códigos de respaldo
        generateBackupCodes();
        setStep('backup');
      } else {
        setError('Código incorrecto. Verifica que sea el código actual de tu app');
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      setError('Error al verificar el código');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = () => {
    // TODO: Guardar en la base de datos
    console.log('2FA activado:', { secret, backupCodes });
    onSuccess();
    onClose();
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = `Códigos de respaldo 2FA - Trading Journal\n\n${backupCodes.join('\n')}\n\nGuarda estos códigos en un lugar seguro. Cada código solo se puede usar una vez.`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes-2fa.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Configurar 2FA</h3>
                <p className="text-gray-400 text-sm">
                  {step === 'setup' && 'Escanea el código QR con tu app'}
                  {step === 'verify' && 'Verifica el código de 6 dígitos'}
                  {step === 'backup' && 'Guarda tus códigos de respaldo'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenido según el paso */}
          {step === 'setup' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Escanea este código con Google Authenticator, Authy o similar
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Código secreto (manual)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={secret}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(secret)}
                    className="text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-400 text-xs">
                  Si no puedes escanear el QR, ingresa este código manualmente
                </p>
              </div>

              <Button
                onClick={() => setStep('verify')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Continuar
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Ingresa el código de 6 dígitos que aparece en tu app
                </p>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-300">Código de verificación</Label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="bg-gray-700 border-gray-600 text-white text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verificando...
                    </>
                  ) : (
                    'Verificar'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'backup' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  ¡2FA configurado correctamente! Guarda estos códigos de respaldo
                </p>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Códigos de respaldo</CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    Usa estos códigos si pierdes acceso a tu app de autenticación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-gray-700 p-2 rounded text-center text-gray-300">
                        {code}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyBackupCodes}
                      className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      {copiedCodes ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copiedCodes ? 'Copiado' : 'Copiar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadBackupCodes}
                      className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <div className="text-yellow-300 text-xs">
                    <p className="font-medium mb-1">¡Importante!</p>
                    <p>Guarda estos códigos en un lugar seguro. Cada código solo se puede usar una vez.</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleComplete}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Completar configuración
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
