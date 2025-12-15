import { NextRequest, NextResponse } from 'next/server';
import { getVercelUsageData, estimateMonthlyCost, VercelAPIError } from '@/lib/vercel-api';
import { decrypt } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  let serviceId: string | undefined;
  let encryptedToken: string | undefined;
  
  try {
    const body = await request.json();
    serviceId = body.serviceId;
    encryptedToken = body.encryptedToken;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
  
  try {

    if (!serviceId || typeof serviceId !== 'string') {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    if (!encryptedToken || typeof encryptedToken !== 'string') {
      return NextResponse.json(
        { error: 'Encrypted token is required' },
        { status: 400 }
      );
    }

    // Decrypt the token
    let token: string;
    try {
      token = decrypt(encryptedToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to decrypt token. Please reconnect your Vercel account.' },
        { status: 400 }
      );
    }

    // Fetch latest data from Vercel
    const usageData = await getVercelUsageData(token);
    
    // Calculate estimated monthly cost
    const monthlyCost = estimateMonthlyCost(usageData.billing);

    // Determine billing cycle and next payment date
    const billingCycle = usageData.billing?.period === 'yearly' ? 'yearly' : 'monthly';
    const now = new Date();
    const nextPayment = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    // Prepare updated service data (only include defined values)
    const updatedData: any = {
      price: monthlyCost,
      billingCycle,
      nextPayment: nextPayment.toISOString().split('T')[0],
      vercelUserId: usageData.userId,
      vercelPlan: usageData.billing?.plan || 'hobby',
      lastSyncedAt: new Date().toISOString(),
      // Update usage metrics if we have resource limits
      usageCurrent: 0, // Vercel API doesn't provide current usage easily, would need additional endpoints
      usageLimit: usageData.resourceLimits.concurrentBuilds || 0,
      usageUnit: 'builds',
    };

    // Only add optional fields if they have values
    if (usageData.teamId) {
      updatedData.vercelTeamId = usageData.teamId;
    }

    return NextResponse.json({
      success: true,
      serviceId,
      updates: updatedData,
    });
  } catch (error) {
    console.error('Error syncing Vercel data:', error);
    
    if (error instanceof VercelAPIError) {
      const errorMessage = error.statusCode === 401 
        ? 'Invalid or expired API token. Please reconnect your Vercel account.'
        : error.message;

      return NextResponse.json(
        { 
          error: errorMessage,
          serviceId,
          updates: {
            syncError: errorMessage,
            lastSyncedAt: new Date().toISOString(),
          }
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to sync Vercel data',
        serviceId,
        updates: {
          syncError: error instanceof Error ? error.message : 'Unknown error',
          lastSyncedAt: new Date().toISOString(),
        }
      },
      { status: 500 }
    );
  }
}

