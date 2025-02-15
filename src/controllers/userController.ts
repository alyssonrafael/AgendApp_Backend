import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword, comparePassword } from "../services/authService";
import { decodeToken } from "../services/authService";

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, password, newPassword } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Token is required" });
    return;
  }

  try {
    const decoded = decodeToken(token);

    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const userId = (decoded as { id: string }).id;

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

    // Verifica se o nome foi enviado e se é válido
    if (name !== undefined && name.trim() === "") {
      res.status(400).json({ error: "Name cannot be empty" });
      return;
    }

    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    // Verifica se password e newPassword foram fornecidos corretamente
    if ((password && !newPassword) || (!password && newPassword)) {
      res.status(400).json({
        error:
          "Both password and newPassword are required to change the password",
      });
      return;
    }

    if (password && newPassword) {
      if (!existingUser.password) {
        res
          .status(400)
          .json({ error: "Password change is not allowed for this user" });
        return;
      }

      if (password.trim() === "" || newPassword.trim() === "") {
        res
          .status(400)
          .json({ error: "Password cannot be empty or only spaces" });
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
