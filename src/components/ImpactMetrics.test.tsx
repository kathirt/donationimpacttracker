import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImpactMetrics } from './ImpactMetrics';
import { ImpactSummary } from '../types';

describe('ImpactMetrics Component', () => {
  const mockSummary: ImpactSummary = {
    totalDonations: 10,
    totalAmount: 5000,
    totalBeneficiaries: 1500,
    impactsByType: {
      meals_served: {
        total: 750,
        description: 'nutritious meals served to students'
      },
      books_distributed: {
        total: 200,
        description: 'educational books distributed'
      },
      scholarships_provided: {
        total: 5,
        description: 'scholarships awarded to deserving students'
      }
    },
    regionBreakdown: {
      'North America': {
        donations: 5,
        amount: 2500,
        beneficiaries: 800
      },
      'Asia': {
        donations: 5,
        amount: 2500,
        beneficiaries: 700
      }
    }
  };

  it('should render the component without crashing', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('Overall Impact')).toBeInTheDocument();
  });

  it('should display total donations count', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('Total Donations')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should format and display total amount as currency', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('should display total beneficiaries', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('Beneficiaries')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });

  it('should display impact breakdown section', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('Impact Breakdown')).toBeInTheDocument();
  });

  it('should render all impact types', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('MEALS SERVED')).toBeInTheDocument();
    expect(screen.getByText('BOOKS DISTRIBUTED')).toBeInTheDocument();
    expect(screen.getByText('SCHOLARSHIPS PROVIDED')).toBeInTheDocument();
  });

  it('should display impact counts with proper formatting', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('750')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should display impact descriptions', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('nutritious meals served to students')).toBeInTheDocument();
    expect(screen.getByText('educational books distributed')).toBeInTheDocument();
    expect(screen.getByText('scholarships awarded to deserving students')).toBeInTheDocument();
  });

  it('should render metric icons', () => {
    render(<ImpactMetrics summary={mockSummary} />);
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('💵')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('should handle empty impact types', () => {
    const emptySummary: ImpactSummary = {
      totalDonations: 0,
      totalAmount: 0,
      totalBeneficiaries: 0,
      impactsByType: {},
      regionBreakdown: {}
    };

    render(<ImpactMetrics summary={emptySummary} />);
    expect(screen.getByText('Overall Impact')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2); // Total Donations and Beneficiaries
  });

  it('should format large numbers correctly', () => {
    const largeSummary: ImpactSummary = {
      totalDonations: 1234,
      totalAmount: 1234567,
      totalBeneficiaries: 123456,
      impactsByType: {},
      regionBreakdown: {}
    };

    render(<ImpactMetrics summary={largeSummary} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
    expect(screen.getByText('123,456')).toBeInTheDocument();
  });
});
