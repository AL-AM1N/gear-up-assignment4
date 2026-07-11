import bcrypt from "bcryptjs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { IRegisterUser } from "./auth.interface";
import { Role } from "../../../generated/prisma/enums";

const registerUser = async (payload: IRegisterUser) => {
  const { name, email, password, role, profilePhoto, phone, address } = payload;

  const allowedRoles: Role[] = [Role.CUSTOMER, Role.PROVIDER];

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  if (role && !allowedRoles.includes(role)) {
    throw new Error("Invalid role. Only CUSTOMER and PROVIDER are allowed.");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      profilePhoto,
      phone,
      address,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const authService = {
  registerUser
};
