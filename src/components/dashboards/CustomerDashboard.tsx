/**
 * Customer Dashboard Component
 * Prototype developed by Team Hackon
 * 
 * Allows customers to:
 * 1. Verify product authenticity by scanning QR codes
 * 2. View complete provenance trail from farm to shelf
 * 3. See farmer information, GPS location, and lab results
 * 4. Access processing history and quality certifications
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Search, 
  MapPin, 
  Shield, 
  CheckCircle,
  Calendar,
  TestTube,
  Factory,
  Leaf,
  QrCode,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { GPSMap } from '../GPSMap';
import { blockchainService } from '../../services/blockchainSimulation';
import { ProvenanceBundle } from '../../types/blockchain';
import { useToast } from '@/hooks/use-toast';

export const CustomerDashboard: React.FC = () => {
  const [batchId, setBatchId] = useState('');
  const [provenance, setProvenance] = useState<ProvenanceBundle | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const { toast } = useToast();

  /**
   * Search for batch provenance information
   * In production, this would query blockchain network
   */
  const searchBatchProvenance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batchId.trim()) {
      toast({
        title: "Batch ID Required",
        description: "Please enter a valid batch ID to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setProvenance(null);

    try {
      console.log(`🔍 [CUSTOMER] Searching provenance for batch: ${batchId}`);
      
      // Query blockchain for provenance data
      const provenanceData = await blockchainService.getProvenance(batchId);
      
      if (!provenanceData) {
        setSearchError(`Batch "${batchId}" not found in blockchain records.`);
        toast({
          title: "Batch Not Found",
          description: "No records found for this batch ID. Please check and try again.",
          variant: "destructive",
        });
      } else {
        setProvenance(provenanceData);
        console.log(`✅ [CUSTOMER] Provenance retrieved for batch: ${batchId}`);
        
        toast({
          title: "Batch Verified",
          description: `Complete provenance trail found for ${batchId}`,
        });
      }

    } catch (error) {
      console.error('❌ [CUSTOMER] Provenance search failed:', error);
      setSearchError('Failed to retrieve batch information. Please try again.');
      toast({
        title: "Search Failed",
        description: "Unable to connect to blockchain network.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Quick search with sample batch ID
   */
  const searchSampleBatch = () => {
    setBatchId('BATCH_ASH_001');
    // Trigger search after state update
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      form?.requestSubmit();
    }, 100);
  };

  /**
   * Determine overall verification status
   */
  const getVerificationStatus = () => {
    if (!provenance) return null;
    
    const hasValidFarmer = !!provenance.farmer;
    const hasValidLab = !!provenance.lab && provenance.lab.verified;
    const hasValidProcessor = !!provenance.processor;
    
    if (hasValidFarmer && hasValidLab && hasValidProcessor) {
      return { status: 'verified', label: 'Fully Verified', color: 'success' };
    } else if (hasValidFarmer && hasValidLab) {
      return { status: 'partial', label: 'Quality Verified', color: 'warning' };
    } else if (hasValidFarmer) {
      return { status: 'basic', label: 'Origin Verified', color: 'primary' };
    }
    
    return { status: 'unverified', label: 'Unverified', color: 'destructive' };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Customer Portal</h1>
              <p className="text-sm text-muted-foreground">
                Verify product authenticity and trace provenance
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Product Verification
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter a batch ID or scan the QR code on your product package to verify authenticity
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={searchBatchProvenance} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="Enter Batch ID (e.g., BATCH_ASH_001)"
                    className="text-lg"
                  />
                </div>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={searchSampleBatch}
                >
                  Try Sample Batch
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4" />
                  <span>Or scan QR code with your camera</span>
                </div>
              </div>

              {searchError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <div className="text-sm text-destructive">{searchError}</div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Provenance Results */}
        {provenance && (
          <div className="space-y-6">
            
            {/* Verification Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className={`h-8 w-8 ${
                      verificationStatus?.color === 'success' ? 'text-success' :
                      verificationStatus?.color === 'warning' ? 'text-warning' :
                      verificationStatus?.color === 'primary' ? 'text-primary' : 'text-destructive'
                    }`} />
                    <div>
                      <h2 className="text-2xl font-bold">{provenance.batchID}</h2>
                      <p className="text-muted-foreground">{provenance.farmer.species}</p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={verificationStatus?.color === 'success' ? 'default' : 
                             verificationStatus?.color === 'destructive' ? 'destructive' : 'secondary'}
                    className="text-sm px-3 py-1"
                  >
                    {verificationStatus?.label}
                  </Badge>
                </div>

                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${provenance.farmer ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Origin Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${provenance.lab?.verified ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Quality Tested</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${provenance.processor ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Processing Tracked</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provenance Trail */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Farmer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    Farm Origin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">Farmer</div>
                      <div>{provenance.farmer.farmerName}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Species</div>
                      <div>{provenance.farmer.species}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Collection Date</div>
                      <div>{new Date(provenance.farmer.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Moisture Content</div>
                      <div>{provenance.farmer.moisture}%</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>Collection Location</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {provenance.farmer.gps.lat.toFixed(6)}, {provenance.farmer.gps.lng.toFixed(6)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Test Results */}
              {provenance.lab && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-blue-600" />
                      Quality Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground">Lab</div>
                        <div>{provenance.lab.labName}</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Test Date</div>
                        <div>{new Date(provenance.lab.testDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Pesticide</div>
                        <div className={provenance.lab.pesticide <= 0.1 ? 'text-success' : 'text-destructive'}>
                          {provenance.lab.pesticide} ppm
                          {provenance.lab.pesticide <= 0.1 ? ' ✓' : ' ⚠️'}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Heavy Metals</div>
                        <div className={!provenance.lab.heavyMetals || provenance.lab.heavyMetals <= 0.05 ? 'text-success' : 'text-destructive'}>
                          {provenance.lab.heavyMetals || 0} ppm
                          {(!provenance.lab.heavyMetals || provenance.lab.heavyMetals <= 0.05) ? ' ✓' : ' ⚠️'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div className="text-sm text-success font-medium">
                        Quality standards met - Safe for consumption
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Processing Information */}
              {provenance.processor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Factory className="h-5 w-5 text-purple-600" />
                      Processing History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground">Processor</div>
                        <div>{provenance.processor.processorName}</div>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground">Process Date</div>
                        <div>{new Date(provenance.processor.processDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Processing Steps</div>
                      <div className="space-y-1">
                        {[
                          { step: 'Drying', status: provenance.processor.drying },
                          { step: 'Grinding', status: provenance.processor.grinding },
                          { step: 'Packaging', status: provenance.processor.packaging }
                        ].map((item) => (
                          <div key={item.step} className="flex items-center justify-between py-1">
                            <span className="text-sm">{item.step}</span>
                            <Badge 
                              variant={item.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.status === 'completed' ? 'Completed' : 
                               item.status === 'in-progress' ? 'In Progress' : 'Pending'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* GPS Location Map */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Farm Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <GPSMap
                    coordinates={provenance.farmer.gps}
                    species={provenance.farmer.species}
                    title="Origin Location"
                    showGeofence={false}
                    className="border-0"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Blockchain Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Blockchain Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Verification Status</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Records immutable and verified</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Last Updated</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(provenance.lastUpdated).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Learn More</div>
                    <Button variant="outline" size="sm" className="text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Blockchain Explorer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information Cards when no search performed */}
        {!provenance && !searchError && !isSearching && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Leaf className="h-12 w-12 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Farm to Fork</h3>
                <p className="text-sm text-muted-foreground">
                  Trace your herbs from the exact farm location to your hands
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <TestTube className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Quality Assured</h3>
                <p className="text-sm text-muted-foreground">
                  View certified lab results for purity and safety testing
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="h-12 w-12 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">Blockchain Verified</h3>
                <p className="text-sm text-muted-foreground">
                  Immutable records ensure authenticity and prevent fraud
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};