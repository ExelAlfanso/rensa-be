import mongoose, { model, Schema } from "mongoose";

const NotificationSchema = new Schema({
  recipientId: {
    type: String,
    required: true,
    index: true,
  },
  actorId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["photo_saved"], // bisa tambah jenis lain nanti
    required: true,
  },
  photoId: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

NotificationSchema.index({ createdAt: -1 });

export const Notification =
  mongoose.models.Notification || model("Notification", NotificationSchema);
