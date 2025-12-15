import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { serviceId } = await request.json();

    if (!serviceId || typeof serviceId !== 'string') {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Return the fields that should be cleared
    // Note: To clear optional fields in InstantDB, we set them to null or omit them
    // For now, we'll just set connected to false and let the client handle clearing other fields
    const updates = {
      connected: false,
    };

    return NextResponse.json({
      success: true,
      serviceId,
      updates,
    });
  } catch (error) {
    console.error('Error disconnecting Vercel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect Vercel account' },
      { status: 500 }
    );
  }
}

