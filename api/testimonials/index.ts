import { AzureFunction, Context, HttpRequest } from "@azure/functions";

// Mock testimonials data (in production, this would come from a database)
const mockTestimonials = [
  {
    id: 'test-001',
    beneficiaryName: 'Maria Rodriguez',
    role: 'Student',
    campaign: 'School Lunch Program',
    region: 'South America',
    message: 'Thanks to the school lunch program, I can focus on my studies without worrying about hunger. The nutritious meals have helped me maintain good health and energy throughout the day. I am so grateful for this support!',
    date: '2024-01-20',
    impactType: 'meals_served',
    rating: 5,
    verified: true
  },
  {
    id: 'test-002',
    beneficiaryName: 'Ahmed Hassan',
    role: 'Teacher',
    campaign: 'Digital Learning Initiative',
    region: 'Africa',
    message: 'The tablets and digital resources have transformed our classroom. Students are more engaged and excited to learn. We can now access educational content that was impossible before. This initiative has truly bridged the digital divide.',
    date: '2024-01-18',
    impactType: 'books_distributed',
    rating: 5,
    verified: true
  },
  {
    id: 'test-003',
    beneficiaryName: 'Li Wei',
    role: 'Scholarship Recipient',
    campaign: 'Scholarship Fund',
    region: 'Asia',
    message: 'Receiving this scholarship changed my life. As the first in my family to attend university, I would not have been able to pursue higher education without this support. I am now studying engineering and hope to give back to my community.',
    date: '2024-01-15',
    impactType: 'scholarships_provided',
    rating: 5,
    verified: true
  }
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a testimonials request.');

  // Enable CORS
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  try {
    if (req.method === 'GET') {
      await handleGetTestimonials(context, req);
    } else {
      context.res = {
        ...context.res,
        status: 405,
        body: { error: 'Method not allowed' }
      };
    }
  } catch (error) {
    context.log.error('Error in testimonials function:', error);
    context.res = {
      ...context.res,
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

async function handleGetTestimonials(context: Context, req: HttpRequest): Promise<void> {
  const { campaign, region, verified } = req.query;

  let filteredTestimonials = mockTestimonials;

  // Apply filters
  if (campaign) {
    filteredTestimonials = filteredTestimonials.filter(t => t.campaign === campaign);
  }

  if (region) {
    filteredTestimonials = filteredTestimonials.filter(t => t.region === region);
  }

  if (verified !== undefined) {
    const isVerified = verified === 'true';
    filteredTestimonials = filteredTestimonials.filter(t => t.verified === isVerified);
  }

  context.res = {
    ...context.res,
    status: 200,
    body: filteredTestimonials
  };
}

export default httpTrigger;
