/**
 * Navigation Component for Role-Based Access
 * Prototype developed by Team Hackon
 * 
 * Provides navigation between different user roles:
 * - Farmers: Collection and harvest tracking
 * - Labs: Quality testing and validation  
 * - Processors: Batch processing and QR generation
 * - Customers: Provenance verification
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Leaf, 
  TestTube, 
  Factory, 
  User, 
  Shield, 
  Link 
} from 'lucide-react';
import { UserRole } from '../types/blockchain';

interface NavigationProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentRole, 
  onRoleChange 
}) => {
  
  // Role configuration with icons and descriptions
  const roles = [
    {
      key: 'farmer' as UserRole,
      label: 'Farmer Portal',
      icon: Leaf,
      description: 'Herb collection & GPS tracking',
      bgGradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    {
      key: 'lab' as UserRole,
      label: 'Lab Portal',
      icon: TestTube,
      description: 'Quality testing & DNA verification',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      key: 'processor' as UserRole,
      label: 'Processor Portal',
      icon: Factory,
      description: 'Batch processing & QR generation',
      bgGradient: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    {
      key: 'customer' as UserRole,
      label: 'Customer Portal',
      icon: User,
      description: 'Provenance verification & tracing',
      bgGradient: 'bg-gradient-to-br from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      {/* Header with Team Credit */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-primary">
                <Link className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Ayurvedic Herbs Traceability
                </h1>
                <p className="text-sm text-muted-foreground">
                  Blockchain-powered supply chain transparency
                </p>
              </div>
            </div>
            
            {/* Team Credit Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Prototype by Team Hackon
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Role Selection Grid */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Select Your Role
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your role in the Ayurvedic herbs supply chain to access 
            the relevant dashboard and features. Each role has specific 
            responsibilities in ensuring herb authenticity and traceability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = currentRole === role.key;
            
            return (
              <Card 
                key={role.key}
                className={`
                  relative p-6 cursor-pointer transition-all duration-300 hover:shadow-large
                  ${isActive 
                    ? 'ring-2 ring-primary shadow-glow scale-105' 
                    : 'hover:scale-102 hover:shadow-medium'
                  }
                `}
                onClick={() => onRoleChange(role.key)}
              >
                {/* Background gradient overlay */}
                <div className={`
                  absolute inset-0 ${role.bgGradient} opacity-5 rounded-lg
                  ${isActive ? 'opacity-10' : 'group-hover:opacity-8'}
                `} />
                
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className={`
                    inline-flex p-4 rounded-2xl mb-4 transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  {/* Title */}
                  <h3 className={`
                    text-xl font-semibold mb-2 transition-colors
                    ${isActive ? 'text-primary' : 'text-foreground'}
                  `}>
                    {role.label}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {role.description}
                  </p>
                  
                  {/* Action Button */}
                  <Button 
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`
                      w-full transition-all
                      ${isActive ? 'shadow-glow' : 'hover:bg-primary hover:text-primary-foreground'}
                    `}
                  >
                    {isActive ? 'Current Role' : 'Switch Role'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* System Architecture Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto p-8 bg-gradient-card">
            <h3 className="text-2xl font-bold mb-4">System Architecture</h3>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              <span>Farmer</span>
            </div>
            <div className="h-px w-8 bg-border"></div>
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4 text-blue-600" />
              <span>Lab</span>
            </div>
              <div className="h-px w-8 bg-border"></div>
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-purple-600" />
                <span>Processor</span>
              </div>
              <div className="h-px w-8 bg-border"></div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-orange-600" />
                <span>Customer</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Each step in the supply chain is recorded on blockchain for complete traceability
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};