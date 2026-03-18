import bcrypt from "bcryptjs";
import { authRepository } from "./auth.repository";
import { RegisterInput, LoginInput } from "./auth.schema";
import { signToken } from "@/lib/auth/jwt";

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await authRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const userId = await authRepository.createUser({
      email: input.email,
      passwordHash,
      name: input.name,
      role: input.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { id: userId, email: input.email, role: input.role };
  }

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user || !user._id) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const userId = user._id.toString();

    const token = await signToken({
      sub: userId,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async getUserProfile(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return {
      id: user._id?.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
