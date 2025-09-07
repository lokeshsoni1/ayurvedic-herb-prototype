/**
 * Lab Dashboard Component
 * Prototype developed by Team Hackon
 * 
 * Allows laboratory technicians to:
 * 1. Upload quality test results for herb batches
 * 2. Record DNA sequencing, pesticide, and heavy metals data
 * 3. Upload test reports and certificates
 * 4. View testing history and verification status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  FileText, 
  Shield, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  Microscope,
  FlaskConical
} from 'lucide-react';
import { blockchainService } from '../../services/blockchainSimulation';
import { QualityTest, CollectionEvent } from '../../types/blockchain';
import { useToast } from '@/hooks/use-toast';

export const LabDashboard: React.FC = () => {
  const [formData, setFormData] = useState({
    batchID: '',
    dna: '',
    pesticide: '',
    moisture: '',
    heavyMetals: '',
    labName: 'Ayurveda Quality Labs Pvt Ltd',
    notes: ''
  });
  const [availableBatches, setAvailableBatches] = useState<CollectionEvent[]>([]);
  const [completedTests, setCompletedTests] = useState<QualityTest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load available batches for testing
    loadAvailableBatches();
    loadCompletedTests();
  }, []);

  /**
   * Load batches that are available for testing
   * In production, this would query pending batches from blockchain
   */
  const loadAvailableBatches = () => {
    const batches = blockchainService.getBatches();
    setAvailableBatches(batches);
  };

  /**
   * Load previously completed test results
   */
  const loadCompletedTests = () => {
    // Simulated test results - in production, query from blockchain
    const tests: QualityTest[] = [
      {
        id: 'TEST_001',
        batchID: 'BATCH_ASH_001',
        dna: 'ATCGATCGATCGATCG...',
        pesticide: 0.03,
        moisture: 12.5,
        heavyMetals: 0.01,
        labName: 'Ayurveda Quality Labs Pvt Ltd',
        labId: 'LAB_AQL_001',
        testDate: new Date().toISOString(),
        verified: true
      }
    ];
    setCompletedTests(tests);
  };

  /**
   * Handle test result submission
   * In production, this would submit to Hyperledger Fabric
   */
  const handleSubmitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create quality test data structure
      const qualityTest: QualityTest = {
        id: `TEST_${Date.now()}`,
        batchID: formData.batchID,
        dna: formData.dna,
        pesticide: parseFloat(formData.pesticide),
        moisture: parseFloat(formData.moisture),
        heavyMetals: parseFloat(formData.heavyMetals),
        labName: formData.labName,
        labId: 'LAB_DEMO_001', // In production, use authenticated lab ID
        testDate: new Date().toISOString(),
        verified: true,
        reportFile: 'lab_report.pdf' // In production, handle actual file upload
      };

      // Submit to blockchain (simulated)
      const transactionId = await blockchainService.submitTransaction('quality_test', qualityTest);
      
      // Update local state
      setCompletedTests(prev => [qualityTest, ...prev]);
      
      // Reset form
      setFormData({
        batchID: '',
        dna: '',
        pesticide: '',
        moisture: '',
        heavyMetals: '',
        labName: 'Ayurveda Quality Labs Pvt Ltd',
        notes: ''
      });

      toast({
        title: "Test Results Recorded",
        description: `Quality test for batch ${qualityTest.batchID} successfully recorded.`,
      });

      console.log(`✅ [LAB] Test results submitted: ${qualityTest.id}`);
      console.log(`🔗 [BLOCKCHAIN] Transaction ID: ${transactionId}`);

    } catch (error) {
      console.error('❌ [LAB] Submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to record test results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Determine test result status based on values
   */
  const getTestStatus = (test: QualityTest) => {
    const isPesticideOk = test.pesticide <= 0.1; // Max 0.1 ppm
    const isMoistureOk = test.moisture >= 8 && test.moisture <= 15; // 8-15% range
    const isHeavyMetalsOk = !test.heavyMetals || test.heavyMetals <= 0.05; // Max 0.05 ppm

    if (isPesticideOk && isMoistureOk && isHeavyMetalsOk) {
      return { status: 'pass', label: 'PASSED', variant: 'default' as const };
    } else {
      return { status: 'fail', label: 'FAILED', variant: 'destructive' as const };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
              <TestTube className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Laboratory Portal</h1>
              <p className="text-sm text-muted-foreground">
                Quality testing and authenticity verification
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Test Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Quality Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTest} className="space-y-4">
                  
                  {/* Batch Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="batchID">Select Batch for Testing</Label>
                    <select
                      id="batchID"
                      value={formData.batchID}
                      onChange={(e) => setFormData(prev => ({ ...prev, batchID: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      required
                    >
                      <option value="">Select Batch ID</option>
                      {availableBatches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.id} - {batch.species} ({batch.farmerName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lab Information */}
                  <div className="space-y-2">
                    <Label htmlFor="labName">Laboratory Name</Label>
                    <Input
                      id="labName"
                      value={formData.labName}
                      onChange={(e) => setFormData(prev => ({ ...prev, labName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* DNA Barcode */}
                    <div className="space-y-2">
                      <Label htmlFor="dna" className="flex items-center gap-2">
                        <Microscope className="h-4 w-4" />
                        DNA Sequence/Barcode
                      </Label>
                      <Textarea
                        id="dna"
                        value={formData.dna}
                        onChange={(e) => setFormData(prev => ({ ...prev, dna: e.target.value }))}
                        placeholder="ATCGATCGATCG..."
                        rows={3}
                        required
                      />
                    </div>

                    {/* Test Parameters */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pesticide">Pesticide Level (ppm)</Label>
                        <Input
                          id="pesticide"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.pesticide}
                          onChange={(e) => setFormData(prev => ({ ...prev, pesticide: e.target.value }))}
                          placeholder="0.03"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="moisture">Moisture Content (%)</Label>
                        <Input
                          id="moisture"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.moisture}
                          onChange={(e) => setFormData(prev => ({ ...prev, moisture: e.target.value }))}
                          placeholder="12.5"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="heavyMetals">Heavy Metals (ppm)</Label>
                        <Input
                          id="heavyMetals"
                          type="number"
                          min="0"
                          step="0.001"
                          value={formData.heavyMetals}
                          onChange={(e) => setFormData(prev => ({ ...prev, heavyMetals: e.target.value }))}
                          placeholder="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Test Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observations, methodology, special conditions..."
                      rows={3}
                    />
                  </div>

                  {/* Report Upload Simulation */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Test Report Upload
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Upload PDF report or CSV data
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, CSV up to 25MB
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Recording Test Results...
                      </>
                    ) : (
                      'Submit Test Results'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Completed Tests */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {completedTests.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No completed tests yet
                    </div>
                  ) : (
                    completedTests.map((test) => {
                      const testStatus = getTestStatus(test);
                      return (
                        <div key={test.id} className="p-4 bg-muted/30 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{test.batchID}</div>
                            <Badge variant={testStatus.variant} className="text-xs">
                              {testStatus.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Pesticide: {test.pesticide} ppm</div>
                            <div>Moisture: {test.moisture}%</div>
                            <div>Heavy Metals: {test.heavyMetals} ppm</div>
                            <div>Date: {new Date(test.testDate).toLocaleDateString()}</div>
                          </div>
                          
                          <div className="flex items-center gap-1 pt-2">
                            {test.verified ? (
                              <CheckCircle className="h-3 w-3 text-success" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-warning" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {test.verified ? 'Verified' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Testing Standards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Quality Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-2">Acceptable Limits:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>• Pesticide: ≤ 0.1 ppm</div>
                    <div>• Moisture: 8-15%</div>
                    <div>• Heavy Metals: ≤ 0.05 ppm</div>
                    <div>• DNA: 98%+ match</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    Standards based on WHO guidelines for medicinal plants
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