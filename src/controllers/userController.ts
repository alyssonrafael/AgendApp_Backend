import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword, comparePassword } from "../services/authService";

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, password, newPassword, phoneNumber } = req.body;
  try {
    const userId = (req as any).usuario.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (existingUser.googleId) {
      res.status(403).json({
        error: "Users authenticated via Google cannot change their data",
      });
      return;
    }

    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    if (phoneNumber) {
      await prisma.user.update({
        where: { id: userId },
        data: { phoneNumber },
      });
    }

    if (password && newPassword) {
      if (!existingUser.password) {
        res
          .status(400)
          .json({ error: "Password change is not allowed for this user" });
        return;
      }


      const isPasswordValid = await comparePassword(
        password,
        existingUser.password
      );

      if (!isPasswordValid) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating user" });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).usuario.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
