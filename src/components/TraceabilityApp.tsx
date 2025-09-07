/**
 * Main Traceability Application Component
 * Prototype developed by Team Hackon
 * 
 * This is the main application component that handles:
 * 1. Role-based navigation and routing
 * 2. State management for current user role
 * 3. Dashboard switching between different user types
 * 4. Team credits and application branding
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Navigation } from './Navigation';
import { FarmerDashboard } from './dashboards/FarmerDashboard';
import { LabDashboard } from './dashboards/LabDashboard';
import { ProcessorDashboard } from './dashboards/ProcessorDashboard';
import { CustomerDashboard } from './dashboards/CustomerDashboard';
import { UserRole } from '../types/blockchain';

export const TraceabilityApp: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  /**
   * Handle role selection and navigation
   */
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    console.log(`🚪 [APP] Switched to ${role} dashboard`);
  };

  /**
   * Return to role selection
   */
  const handleBackToRoles = () => {
    setCurrentRole(null);
  };

  /**
   * Render the appropriate dashboard based on current role
   */
  const renderDashboard = () => {
    switch (currentRole) {
      case 'farmer':
        return <FarmerDashboard />;
      case 'lab':
        return <LabDashboard />;
      case 'processor':
        return <ProcessorDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      default:
        return null;
    }
  };

  // Show role selection if no role is selected
  if (!currentRole) {
    return (
      <Navigation 
        currentRole={currentRole || 'customer'} 
        onRoleChange={handleRoleChange}
      />
    );
  }

  // Show selected role dashboard with back navigation
  return (
    <div className="min-h-screen">
      {/* Back to Roles Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={handleBackToRoles}
          variant="outline"
          size="sm"
          className="bg-card/80 backdrop-blur-sm border shadow-medium hover:shadow-large transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
      </div>

      {/* Role Dashboard */}
      {renderDashboard()}

      {/* Footer with Team Credits */}
      <footer className="bg-card/50 border-t backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center text-sm text-muted-foreground">
            <div className="font-medium">
              Blockchain-based Traceability for Ayurvedic Herbs (SIH25027)
            </div>
            <div className="mt-1">
              🏆 <strong>Prototype developed by Team Hackon</strong> • 
              Built with React, TypeScript, Blockchain Simulation • 
              Ready for Hyperledger Fabric Integration
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};