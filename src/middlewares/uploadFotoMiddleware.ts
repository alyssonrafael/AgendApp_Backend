import { Request, Response, NextFunction } from "express";
import upload from "../config/multerConfig";

// Middleware para fazer o upload de um único arquivo
export const uploadFotoMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res
          .status(400)
          .json({ error: "only one file is allowed at a time" });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    next();
  });
};

