import { NextRequest, NextResponse } from 'next/server';
import { validateVercelToken, getVercelUsageData, estimateMonthlyCost, VercelAPIError } from '@/lib/vercel-api';
import { encrypt } from '@/lib/encryption';
import { createSlug } from '@/utils/slug';

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Vercel API token is required' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate the token by attempting to fetch user data
    const isValid = await validateVercelToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired Vercel API token' },
        { status: 401 }
      );
    }

    // Fetch user data and usage information
    const usageData = await getVercelUsageData(token);
    
    // Encrypt the token before storing
    const encryptedToken = encrypt(token);

    // Calculate estimated monthly cost
    const monthlyCost = estimateMonthlyCost(usageData.billing);

    // Determine billing cycle and next payment date
    const billingCycle = usageData.billing?.period === 'yearly' ? 'yearly' : 'monthly';
    const now = new Date();
    const nextPayment = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    // Prepare service data
    const serviceData: any = {
      name: 'Vercel',
      category: 'Hosting',
      price: monthlyCost,
      currency: '$',
      billingCycle,
      nextPayment: nextPayment.toISOString().split('T')[0],
      color: '#000000', // Vercel's brand color
      logo: '/logos/vercel.svg',
      status: 'active' as const,
      connected: true,
      slug: 'vercel',
      userId,
      // Vercel-specific fields
      vercelTokenHash: encryptedToken,
      vercelUserId: usageData.userId,
      vercelPlan: usageData.billing?.plan || 'hobby',
      vercelConnectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      // Usage metrics (if available)
      usageMetric: 'Bandwidth',
      usageCurrent: 0, // Will be updated during sync
      usageLimit: 0, // Will be updated during sync
      usageUnit: 'GB',
    };

    // Only add optional fields if they have values (don't include undefined)
    if (usageData.teamId) {
      serviceData.vercelTeamId = usageData.teamId;
    }

    return NextResponse.json({
      success: true,
      service: serviceData,
    });
  } catch (error) {
    console.error('Error connecting Vercel:', error);
    
    if (error instanceof VercelAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect Vercel account' },
      { status: 500 }
    );
  }
}

