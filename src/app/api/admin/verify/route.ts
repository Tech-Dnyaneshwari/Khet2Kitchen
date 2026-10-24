import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['ADMIN']);
    const { userId, role, status, notes } = await req.json();

    if (!userId || !status) {
      return NextResponse.json({ error: 'User ID and decision status are required.' }, { status: 400 });
    }

    const isApproved = status === 'APPROVED';

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { isVerified: isApproved },
      });

      if (role === 'FARMER') {
        await tx.farmerProfile.update({
          where: { userId },
          data: {
            isVerified: isApproved,
            verificationStatus: status,
            verificationNotes: notes || (isApproved ? 'Accredited by platform auditor' : 'Incomplete documentation'),
          },
        });
      } else if (role === 'BUYER') {
        await tx.businessProfile.update({
          where: { userId },
          data: {
            isVerified: isApproved,
            verificationStatus: status,
          },
        });
      } else if (role === 'TRANSPORT_PARTNER') {
        await tx.transportPartnerProfile.update({
          where: { userId },
          data: {
            isVerified: isApproved,
            verificationStatus: status,
          },
        });
      }

      await tx.notification.create({
        data: {
          userId,
          title: `Verification Status: ${status}`,
          message: notes || (isApproved ? 'Your KYC verification has been approved!' : 'Your verification request was rejected. Please review notes.'),
          type: 'VERIFICATION_UPDATE',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: `USER_VERIFICATION_${status}`,
          entityType: 'USER',
          entityId: userId,
          detailsJson: JSON.stringify({ role, status, notes }),
        },
      });
    });

    return NextResponse.json({ success: true, message: `User verification updated to ${status}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
