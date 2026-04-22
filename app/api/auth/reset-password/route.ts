import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { signToken, verifyToken } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { action, email, token, newPassword } = body;

    // Request reset
    if (action === 'request') {
      if (!email || !validateEmail(email)) {
        return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
      }
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal if user exists
        return NextResponse.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
      }
      const resetToken = signToken({ userId: user._id.toString(), email: user.email, name: user.name });
      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      // In production, send email. For demo, return token.
      return NextResponse.json({ success: true, message: 'Reset token generated.', resetToken });
    }

    // Perform reset
    if (action === 'reset') {
      if (!token || !newPassword) {
        return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
      }
      const check = validatePassword(newPassword);
      if (!check.valid) return NextResponse.json({ error: check.message }, { status: 400 });

      const payload = verifyToken(token);
      if (!payload) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

      const user = await User.findOne({ _id: payload.userId, resetToken: token });
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
      }

      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      return NextResponse.json({ success: true, message: 'Password reset successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
