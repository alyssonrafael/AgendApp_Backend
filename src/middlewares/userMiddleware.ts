import { Request, Response, NextFunction } from 'express';

export const validarEntradaUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, password, newPassword, phoneNumber } = req.body;

  if (name !== undefined && name.trim() === "") {
     res.status(400).json({ error: "Name cannot be empty" });
     return
  }

  if (phoneNumber !== undefined && phoneNumber.trim() === "") {
     res.status(400).json({ error: "Phone number cannot be empty" });
     return
  }

  if ((password && !newPassword) || (!password && newPassword)) {
     res.status(400).json({
      error: "Both password and newPassword are required to change the password",
    });
    return
  }

  if (password && newPassword) {
    if (password.trim() === "" || newPassword.trim() === "") {
       res
        .status(400)
        .json({ error: "Password cannot be empty or only spaces" });
        return
    }
  }

  next();
};