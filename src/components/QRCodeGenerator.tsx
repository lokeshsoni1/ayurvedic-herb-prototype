/**
 * QR Code Generator Component
 * Prototype developed by Team Hackon
 * 
 * Generates QR codes for batch traceability.
 * In production, this would be integrated with Hyperledger Fabric
 * to generate tamper-proof QR codes linked to blockchain transactions.
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  batchId: string;
  data?: any; // Additional data to encode
  title?: string;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  batchId,
  data,
  title = "Batch QR Code",
  className = ""
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode();
  }, [batchId, data]);

  /**
   * Generate QR Code with batch information
   * In production, this would include:
   * - Blockchain transaction hash
   * - Smart contract address
   * - Encrypted batch data
   * - Digital signature
   */
  const generateQRCode = async () => {
    try {
      // Create QR data payload
      const qrPayload = {
        batchId,
        timestamp: new Date().toISOString(),
        type: 'ayurvedic_herb_trace',
        version: '1.0',
        // In production, add blockchain hash and signature
        blockchainHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        verificationUrl: `https://herb-trace.hackon.com/verify/${batchId}`,
        ...data
      };

      const qrDataString = JSON.stringify(qrPayload);
      setQrData(qrDataString);

      // Generate QR code with high error correction for production use
      const qrCodeDataUrl = await QRCode.toDataURL(qrDataString, {
        errorCorrectionLevel: 'H', // High error correction
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#1a472a', // Dark green matching theme
          light: '#ffffff'
        },
        width: 256
      });

      setQrCodeUrl(qrCodeDataUrl);
      
      console.log(`✅ [QR GENERATOR] Generated QR for batch: ${batchId}`);
      console.log(`📋 [QR DATA] Payload size: ${qrDataString.length} bytes`);
      
    } catch (error) {
      console.error('❌ [QR GENERATOR] Failed to generate QR code:', error);
      toast({
        title: "QR Generation Failed",
        description: "Unable to generate QR code for this batch.",
        variant: "destructive",
      });
    }
  };

  /**
   * Download QR code as PNG file
   */
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `batch_${batchId}_qr.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: "QR Code Downloaded",
      description: `QR code for batch ${batchId} has been saved.`,
    });
  };

  /**
   * Copy QR data to clipboard
   */
  const copyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      toast({
        title: "QR Data Copied",
        description: "QR code data has been copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy QR data:', error);
    }
  };

  if (!qrCodeUrl) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-primary-glow/5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <QrCode className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Batch ID: {batchId}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Blockchain Verified
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 text-center">
        {/* QR Code Image */}
        <div className="inline-block p-4 bg-white rounded-xl shadow-soft mb-4">
          <img 
            src={qrCodeUrl} 
            alt={`QR Code for batch ${batchId}`}
            className="w-48 h-48 mx-auto"
          />
        </div>

        {/* Instructions */}
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Scan this QR code with any QR scanner to verify the complete 
          provenance and authenticity of this Ayurvedic herb batch.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={downloadQRCode}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          
          <Button 
            onClick={copyQRData}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Copy className="h-4 w-4" />
            Copy Data
          </Button>
        </div>

        {/* Technical Details */}
        <details className="mt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            Technical Details
          </summary>
          <div className="mt-2 p-3 bg-muted/30 rounded-lg text-left">
            <div className="space-y-1">
              <div><strong>Error Correction:</strong> High (30%)</div>
              <div><strong>Format:</strong> PNG, 256x256px</div>
              <div><strong>Data Size:</strong> {qrData.length} bytes</div>
              <div><strong>Blockchain:</strong> Hyperledger Fabric (simulated)</div>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};