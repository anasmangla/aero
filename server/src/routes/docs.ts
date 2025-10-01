import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadFile } from "../lib/drive";

const upload = multer({ dest: path.join(process.cwd(), "uploads") });
const r = Router();

r.post("/upload", upload.single("file"), async (req, res) => {
  const { label, parentFolderId } = req.body;
  if (!req.file) return res.status(400).json({ error: "No file" });
  const up = await uploadFile(
    label || req.file.originalname,
    req.file.mimetype,
    req.file.path,
    parentFolderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!
  );
  res.json(up);
});

export default r;
