import { Router } from "express";
import type { Request } from "express";
import multer from "multer";
import path from "path";
import { uploadFile } from "../lib/drive";

const upload = multer({ dest: path.join(process.cwd(), "uploads") });
const r = Router();

// Extend Request to include `file` provided by multer.single(...)
type MulterSingleRequest = Request & { file?: Express.Multer.File };

r.post("/upload", upload.single("file"), async (req, res) => {
  const mreq = req as MulterSingleRequest;
  const { label, parentFolderId } = mreq.body || {};

  if (!mreq.file) {
    return res.status(400).json({ error: "No file" });
  }

  try {
    const up = await uploadFile(
      (label as string) || mreq.file.originalname,
      mreq.file.mimetype,
      mreq.file.path,
      (parentFolderId as string) || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!
    );
    res.json(up); // { id, webViewLink, webContentLink }
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Upload failed" });
  }
});

export default r;
