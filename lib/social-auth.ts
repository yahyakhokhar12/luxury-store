import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/auth";
import User from "@/models/User";

type SocialUserInput = {
  email: string;
  name: string;
};

export async function findOrCreateSocialUser(input: SocialUserInput) {
  await connectDB();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || "User";

  let user = await User.findOne({ email });
  if (!user) {
    const adminCount = await User.countDocuments({ isAdmin: true });
    const generatedPassword = await bcrypt.hash(`oauth:${randomUUID()}`, 10);
    user = await User.create({
      name,
      email,
      password: generatedPassword,
      phone: "",
      address: { line1: "", city: "", province: "", postalCode: "" },
      isAdmin: adminCount === 0,
    });
  } else if (!user.name && name) {
    user.name = name;
    await user.save();
  }

  return user;
}

export function createAuthToken(user: { _id: { toString(): string }; email: string; isAdmin?: boolean }) {
  return signToken({
    id: user._id.toString(),
    email: user.email,
    isAdmin: Boolean(user.isAdmin),
  });
}
