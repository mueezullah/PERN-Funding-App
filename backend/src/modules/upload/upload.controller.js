import { uploadToS3 } from "../../utils/s3.service.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided" });
  }

  const folder = req.body.folder || "uploads";
  const imageUrl = await uploadToS3(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    folder
  );

  return res.status(200).json({
    success: true,
    message: "Image uploaded successfully to AWS S3",
    url: imageUrl,
  });
});
