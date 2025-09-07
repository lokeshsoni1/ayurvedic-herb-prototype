/**
 * Processor Dashboard Component
 * Prototype developed by Team Hackon
 * 
 * Allows processors/manufacturers to:
 * 1. View all available batches with quality test results
 * 2. Track processing steps (drying, grinding, packaging)
 * 3. Generate QR codes for finished batches
 * 4. Monitor batch status and blockchain verification
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Factory, 
  Package, 
  QrCode, 
  CheckCircle, 
  Clock,
  AlertCircle,
  ArrowRight,
  Download
} from 'lucide-react';
import { QRCodeGenerator } from '../QRCodeGenerator';
import { blockchainService } from '../../services/blockchainSimulation';
import { CollectionEvent, QualityTest, ProcessingStep } from '../../types/blockchain';
import { useToast } from '@/hooks/use-toast';

interface BatchWithTests {
  batch: CollectionEvent;
  qualityTest?: QualityTest;
  processing?: ProcessingStep;
}

export const ProcessorDashboard: React.FC = () => {
  const [availableBatches, setAvailableBatches] = useState<BatchWithTests[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<{[key: string]: ProcessingStep}>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableBatches();
  }, []);

  /**
   * Load all batches with their quality test results
   * In production, this would query blockchain for batches ready for processing
   */
  const loadAvailableBatches = async () => {
    try {
      const batches = blockchainService.getBatches();
      const batchesWithTests: BatchWithTests[] = [];

      for (const batch of batches) {
        // Get provenance data for each batch
        const provenance = await blockchainService.getProvenance(batch.id);
        
        batchesWithTests.push({
          batch,
          qualityTest: provenance?.lab,
          processing: provenance?.processor
        });
      }

      setAvailableBatches(batchesWithTests);
      console.log(`📦 [PROCESSOR] Loaded ${batchesWithTests.length} available batches`);
      
    } catch (error) {
      console.error('❌ [PROCESSOR] Failed to load batches:', error);
    }
  };

  /**
   * Update processing step for a batch
   * In production, this would submit transaction to blockchain
   */
  const updateProcessingStep = async (
    batchId: string, 
    step: 'drying' | 'grinding' | 'packaging',
    status: 'pending' | 'in-progress' | 'completed'
  ) => {
    try {
      const existingProcessing = processingStatus[batchId] || {
        id: `PROC_${Date.now()}`,
        batchID: batchId,
        drying: 'pending',
        grinding: 'pending',
        packaging: 'pending',
        processorName: 'Himalaya Wellness Company',
        processorId: 'PROC_DEMO_001',
        processDate: new Date().toISOString()
      };

      const updatedProcessing = {
        ...existingProcessing,
        [step]: status
      };

      // Submit to blockchain (simulated)
      await blockchainService.submitTransaction('processing', updatedProcessing);
      
      setProcessingStatus(prev => ({
        ...prev,
        [batchId]: updatedProcessing
      }));

      toast({
        title: "Processing Updated",
        description: `${step} status updated to ${status} for batch ${batchId}`,
      });

      console.log(`✅ [PROCESSOR] Updated ${step} to ${status} for batch ${batchId}`);

    } catch (error) {
      console.error('❌ [PROCESSOR] Failed to update processing step:', error);
      toast({
        title: "Update Failed",
        description: "Unable to update processing step. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Generate QR code for a completed batch
   */
  const generateBatchQR = (batchId: string) => {
    setSelectedBatch(batchId);
    
    toast({
      title: "QR Code Generated",
      description: `QR code generated for batch ${batchId}`,
    });
  };

  /**
   * Get processing status for display
   */
  const getProcessingStatus = (batchId: string) => {
    const processing = processingStatus[batchId];
    if (!processing) return { stage: 'Not Started', color: 'gray' };

    if (processing.packaging === 'completed') return { stage: 'Ready to Ship', color: 'green' };
    if (processing.packaging === 'in-progress') return { stage: 'Packaging', color: 'blue' };
    if (processing.grinding === 'completed') return { stage: 'Grinding Complete', color: 'blue' };
    if (processing.grinding === 'in-progress') return { stage: 'Grinding', color: 'blue' };
    if (processing.drying === 'completed') return { stage: 'Drying Complete', color: 'blue' };
    if (processing.drying === 'in-progress') return { stage: 'Drying', color: 'yellow' };
    
    return { stage: 'Not Started', color: 'gray' };
  };

  /**
   * Check if batch is ready for processing (has quality test)
   */
  const isBatchReady = (batchWithTest: BatchWithTests) => {
    return batchWithTest.qualityTest && batchWithTest.qualityTest.verified;
  };

  /**
   * Check if batch can have QR generated (processing complete)
   */
  const canGenerateQR = (batchId: string) => {
    const processing = processingStatus[batchId];
    return processing && processing.packaging === 'completed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600">
              <Factory className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Processor Portal</h1>
              <p className="text-sm text-muted-foreground">
                Batch processing and QR code generation
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Batch Processing List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Available Batches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableBatches.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No batches available for processing
                    </div>
                  ) : (
                    availableBatches.map((batchWithTest) => {
                      const batch = batchWithTest.batch;
                      const isReady = isBatchReady(batchWithTest);
                      const processingInfo = getProcessingStatus(batch.id);
                      
                      return (
                        <div key={batch.id} className="p-4 border rounded-lg bg-card">
                          {/* Batch Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold">{batch.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {batch.species} • {batch.farmerName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={isReady ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {isReady ? "Quality Verified" : "Pending Tests"}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  color: processingInfo.color === 'green' ? 'hsl(var(--success))' : 
                                         processingInfo.color === 'blue' ? 'hsl(var(--primary))' :
                                         processingInfo.color === 'yellow' ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))'
                                }}
                              >
                                {processingInfo.stage}
                              </Badge>
                            </div>
                          </div>

                          {/* Quality Test Results */}
                          {batchWithTest.qualityTest && (
                            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                              <div className="text-sm font-medium mb-2">Quality Test Results</div>
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Pesticide:</span><br />
                                  <span className={batchWithTest.qualityTest.pesticide <= 0.1 ? 'text-success' : 'text-destructive'}>
                                    {batchWithTest.qualityTest.pesticide} ppm
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Moisture:</span><br />
                                  <span className="text-foreground">{batchWithTest.qualityTest.moisture}%</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Heavy Metals:</span><br />
                                  <span className={!batchWithTest.qualityTest.heavyMetals || batchWithTest.qualityTest.heavyMetals <= 0.05 ? 'text-success' : 'text-destructive'}>
                                    {batchWithTest.qualityTest.heavyMetals || 0} ppm
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Processing Steps */}
                          {isReady && (
                            <div className="space-y-3">
                              <div className="text-sm font-medium">Processing Steps</div>
                              
                              {/* Drying */}
                              <div className="flex items-center justify-between p-2 bg-background rounded border">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">1. Drying</div>
                                  {processingStatus[batch.id]?.drying === 'completed' && (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  )}
                                  {processingStatus[batch.id]?.drying === 'in-progress' && (
                                    <Clock className="h-4 w-4 text-warning animate-pulse" />
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateProcessingStep(batch.id, 'drying', 'in-progress')}
                                    disabled={processingStatus[batch.id]?.drying === 'completed'}
                                  >
                                    Start
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => updateProcessingStep(batch.id, 'drying', 'completed')}
                                    disabled={!processingStatus[batch.id] || processingStatus[batch.id].drying === 'pending'}
                                  >
                                    Complete
                                  </Button>
                                </div>
                              </div>

                              {/* Grinding */}
                              <div className="flex items-center justify-between p-2 bg-background rounded border">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">2. Grinding</div>
                                  {processingStatus[batch.id]?.grinding === 'completed' && (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  )}
                                  {processingStatus[batch.id]?.grinding === 'in-progress' && (
                                    <Clock className="h-4 w-4 text-warning animate-pulse" />
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateProcessingStep(batch.id, 'grinding', 'in-progress')}
                                    disabled={
                                      processingStatus[batch.id]?.drying !== 'completed' ||
                                      processingStatus[batch.id]?.grinding === 'completed'
                                    }
                                  >
                                    Start
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => updateProcessingStep(batch.id, 'grinding', 'completed')}
                                    disabled={
                                      !processingStatus[batch.id] || 
                                      processingStatus[batch.id].grinding !== 'in-progress'
                                    }
                                  >
                                    Complete
                                  </Button>
                                </div>
                              </div>

                              {/* Packaging */}
                              <div className="flex items-center justify-between p-2 bg-background rounded border">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">3. Packaging</div>
                                  {processingStatus[batch.id]?.packaging === 'completed' && (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  )}
                                  {processingStatus[batch.id]?.packaging === 'in-progress' && (
                                    <Clock className="h-4 w-4 text-warning animate-pulse" />
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateProcessingStep(batch.id, 'packaging', 'in-progress')}
                                    disabled={
                                      processingStatus[batch.id]?.grinding !== 'completed' ||
                                      processingStatus[batch.id]?.packaging === 'completed'
                                    }
                                  >
                                    Start
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => updateProcessingStep(batch.id, 'packaging', 'completed')}
                                    disabled={
                                      !processingStatus[batch.id] || 
                                      processingStatus[batch.id].packaging !== 'in-progress'
                                    }
                                  >
                                    Complete
                                  </Button>
                                </div>
                              </div>

                              {/* Generate QR */}
                              <div className="pt-3 border-t">
                                <Button
                                  onClick={() => generateBatchQR(batch.id)}
                                  disabled={!canGenerateQR(batch.id)}
                                  className="w-full"
                                  variant={canGenerateQR(batch.id) ? "default" : "outline"}
                                >
                                  <QrCode className="h-4 w-4 mr-2" />
                                  {canGenerateQR(batch.id) ? 'Generate QR Code' : 'Complete Processing First'}
                                  {canGenerateQR(batch.id) && <ArrowRight className="h-4 w-4 ml-2" />}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Not Ready Message */}
                          {!isReady && (
                            <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                              <AlertCircle className="h-4 w-4 text-warning" />
                              <div className="text-sm text-warning">
                                Waiting for quality test verification before processing can begin
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code Generation */}
          <div className="space-y-6">
            {selectedBatch ? (
              <QRCodeGenerator
                batchId={selectedBatch}
                title="Batch QR Code"
                data={{
                  processorName: 'Himalaya Wellness Company',
                  processDate: new Date().toISOString(),
                  verificationLevel: 'full'
                }}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64 text-center">
                  <div className="space-y-2">
                    <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Complete processing for a batch to generate QR code
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Batches:</span>
                    <span className="font-medium">{availableBatches.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ready to Process:</span>
                    <span className="font-medium text-success">
                      {availableBatches.filter(b => isBatchReady(b)).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Processing:</span>
                    <span className="font-medium text-warning">
                      {Object.keys(processingStatus).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">QR Ready:</span>
                    <span className="font-medium text-primary">
                      {Object.values(processingStatus).filter(p => p.packaging === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};