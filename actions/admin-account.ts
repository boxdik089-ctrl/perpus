"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { validatePasswordStrength, sanitizeInput } from "@/lib/security";

export type UbahPasswordState = {
  ok: boolean;
  message: string;
};

export async function ubahPasswordAdmin(formData: {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<UbahPasswordState> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      ok: false,
      message: "Sesi telah berakhir. Silakan login kembali.",
    };
  }

  const { currentPassword, newPassword, confirmPassword } = formData;

  if (!newPassword || !confirmPassword) {
    return {
      ok: false,
      message: "Kolom password baru dan konfirmasi wajib diisi.",
    };
  }

  const pwdValidation = validatePasswordStrength(newPassword);
  if (!pwdValidation.valid) {
    return {
      ok: false,
      message: pwdValidation.message || "Password tidak memenuhi standar keamanan.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      message: "Konfirmasi password baru tidak cocok.",
    };
  }

  // Cari admin berdasarkan session akun yang sedang aktif
  const username = sanitizeInput(session.user.email || "", 100);
  const adminId = (session.user as any)?.id;

  const admin = await prisma.admin.findFirst({
    where: {
      OR: [
        ...(adminId ? [{ id: adminId }] : []),
        ...(username ? [{ username }] : []),
      ],
    },
  });

  if (!admin) {
    return {
      ok: false,
      message: "Akun petugas yang sedang aktif tidak ditemukan di database.",
    };
  }

  // Validasi password saat ini jika dikirimkan oleh pengguna
  if (currentPassword) {
    let isCurrentValid = false;
    try {
      isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
    } catch {
      isCurrentValid = false;
    }
    if (!isCurrentValid && admin.password === currentPassword) {
      isCurrentValid = true;
    }
    if (!isCurrentValid) {
      return {
        ok: false,
        message: "Password saat ini yang Anda masukkan salah.",
      };
    }
  }

  // Hash password baru dengan bcrypt (cost factor 10)
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Update password di database
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      password: hashedNewPassword,
    },
  });

  revalidatePath("/admin");

  return {
    ok: true,
    message: "Password berhasil diperbarui! Silakan gunakan password baru untuk login berikutnya.",
  };
}
