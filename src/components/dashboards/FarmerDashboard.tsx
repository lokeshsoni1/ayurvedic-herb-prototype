/**
 * Farmer Dashboard Component
 * Prototype developed by Team Hackon
 * 
 * Allows farmers to:
 * 1. Submit herb collection events with GPS coordinates
 * 2. Upload photos and specify moisture readings
 * 3. View previously submitted batches
 * 4. Monitor geo-fence and seasonal validation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  MapPin, 
  Camera, 
  Plus, 
  CheckCircle, 
  Clock,
  Droplets,
  Upload
} from 'lucide-react';
import { GPSMap } from '../GPSMap';
import { blockchainService } from '../../services/blockchainSimulation';
import { CollectionEvent, GPSCoordinates } from '../../types/blockchain';
import { useToast } from '@/hooks/use-toast';

export const FarmerDashboard: React.FC = () => {
  const [formData, setFormData] = useState({
    species: '',
    moisture: '',
    farmerName: '',
    notes: ''
  });
  const [gpsCoords, setGpsCoords] = useState<GPSCoordinates | null>(null);
  const [submittedBatches, setSubmittedBatches] = useState<CollectionEvent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing batches for this farmer (simulated)
    loadFarmerBatches();
  }, []);

  /**
   * Load previously submitted batches for this farmer
   * In production, this would query blockchain by farmer ID
   */
  const loadFarmerBatches = () => {
    const batches = blockchainService.getBatches();
    setSubmittedBatches(batches);
  };

  /**
   * Handle form submission - creates new collection event
   * In production, this would submit transaction to Hyperledger Fabric
   */
  const handleSubmitCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gpsCoords) {
      toast({
        title: "GPS Required",
        description: "Please select a GPS location before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create collection event data structure
      const collectionEvent: CollectionEvent = {
        id: `BATCH_${formData.species.toUpperCase().substr(0, 3)}_${Date.now()}`,
        species: formData.species,
        gps: gpsCoords,
        timestamp: new Date().toISOString(),
        moisture: parseFloat(formData.moisture),
        farmerName: formData.farmerName,
        farmerId: 'FARMER_DEMO_001', // In production, use authenticated farmer ID
        photo: 'collection_photo.jpg' // In production, handle actual file upload
      };

      // Validate geo-fencing and seasonal timing
      const isValidLocation = blockchainService.validateGeoFence(gpsCoords, formData.species);
      const isValidSeason = blockchainService.validateSeason(collectionEvent.timestamp, formData.species);

      if (!isValidLocation) {
        toast({
          title: "Invalid Location",
          description: `Collection location is outside approved region for ${formData.species}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Submit to blockchain (simulated)
      const transactionId = await blockchainService.submitTransaction('collection', collectionEvent);
      
      // Update local state
      setSubmittedBatches(prev => [collectionEvent, ...prev]);
      
      // Reset form
      setFormData({
        species: '',
        moisture: '',
        farmerName: '',
        notes: ''
      });
      setGpsCoords(null);

      toast({
        title: "Collection Recorded",
        description: `Batch ${collectionEvent.id} successfully recorded on blockchain.`,
      });

      console.log(`✅ [FARMER] Collection submitted: ${collectionEvent.id}`);
      console.log(`🔗 [BLOCKCHAIN] Transaction ID: ${transactionId}`);

    } catch (error) {
      console.error('❌ [FARMER] Submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to record collection event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Farmer Portal</h1>
              <p className="text-sm text-muted-foreground">
                Record herb collection events and track your batches
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Collection Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Collection Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitCollection} className="space-y-4">
                  
                  {/* Species Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="species">Herb Species</Label>
                    <select
                      id="species"
                      value={formData.species}
                      onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      required
                    >
                      <option value="">Select Species</option>
                      <option value="Ashwagandha">Ashwagandha (Withania somnifera)</option>
                      <option value="Brahmi">Brahmi (Bacopa monnieri)</option>
                      <option value="Turmeric">Turmeric (Curcuma longa)</option>
                      <option value="Tulsi">Tulsi (Ocimum sanctum)</option>
                      <option value="Neem">Neem (Azadirachta indica)</option>
                    </select>
                  </div>

                  {/* Farmer Information */}
                  <div className="space-y-2">
                    <Label htmlFor="farmerName">Farmer Name</Label>
                    <Input
                      id="farmerName"
                      value={formData.farmerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmerName: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Moisture Reading */}
                  <div className="space-y-2">
                    <Label htmlFor="moisture" className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Moisture Content (%)
                    </Label>
                    <Input
                      id="moisture"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.moisture}
                      onChange={(e) => setFormData(prev => ({ ...prev, moisture: e.target.value }))}
                      placeholder="e.g., 12.5"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Collection Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Weather conditions, soil quality, harvest method..."
                      rows={3}
                    />
                  </div>

                  {/* Photo Upload Simulation */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Collection Photo
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* GPS Status */}
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">GPS Location</div>
                      <div className="text-xs text-muted-foreground">
                        {gpsCoords 
                          ? `${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}`
                          : 'Click on map to set location'
                        }
                      </div>
                    </div>
                    {gpsCoords && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting || !gpsCoords}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Recording on Blockchain...
                      </>
                    ) : (
                      'Submit Collection Event'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* GPS Map */}
          <div className="space-y-6">
            <GPSMap
              coordinates={gpsCoords}
              species={formData.species}
              title="Collection Location"
              showGeofence={true}
              onLocationSelect={setGpsCoords}
            />

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {submittedBatches.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No collection events yet
                    </div>
                  ) : (
                    submittedBatches.slice(0, 5).map((batch) => (
                      <div key={batch.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{batch.species}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(batch.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {batch.id}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {batch.moisture}% moisture
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};