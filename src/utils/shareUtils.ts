import { Donation, ImpactMetric, ImpactSummary } from '../types';

/**
 * Generates shareable text for a donation
 */
export const generateDonationShareText = (donation: Donation): string => {
  return `I just donated $${donation.amount.toLocaleString()} to ${donation.campaign}! Join me in making a difference. 🌟`;
};

/**
 * Generates shareable text for an impact metric
 */
export const generateImpactShareText = (impact: ImpactMetric): string => {
  const impactDescriptions: { [key: string]: string } = {
    'meals_served': `${impact.value} meals served`,
    'books_distributed': `${impact.value} books distributed`,
    'students_supported': `${impact.value} students supported`,
    'scholarships_provided': `${impact.value} scholarships awarded`,
    'trees_planted': `${impact.value} trees planted`
  };

  const description = impactDescriptions[impact.type] || `${impact.value} impact achieved`;
  return `Together, we've made an impact: ${description} in ${impact.region}! Every contribution counts. 💙`;
};

/**
 * Generates shareable text for overall impact summary
 */
export const generateSummaryShareText = (summary: ImpactSummary): string => {
  const totalAmount = summary.totalAmount.toLocaleString();
  const beneficiaries = summary.totalBeneficiaries.toLocaleString();
  
  return `Our community has donated $${totalAmount} and impacted ${beneficiaries} lives! Join us in creating positive change. 🌍`;
};

/**
 * Generates shareable text for a donor's total impact
 */
export const generateDonorImpactText = (donorName: string, totalDonated: number, donationCount: number): string => {
  return `${donorName} has made ${donationCount} donations totaling $${totalDonated.toLocaleString()}! Together we can make a difference. ❤️`;
};

/**
 * Generates a title for sharing
 */
export const generateShareTitle = (type: 'donation' | 'impact' | 'summary'): string => {
  const titles = {
    donation: 'Making a Difference Through Donations',
    impact: 'Real Impact, Real Change',
    summary: 'Our Collective Impact'
  };
  
  return titles[type] || 'Donation Impact Tracker';
};
