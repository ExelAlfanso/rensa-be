import mongoose, { model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
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
      enum: ["photo_saved", "photo_bookmarked", "photo_commented"], // bisa tambah jenis lain nanti
      required: true,
    },
    photoId: {
      type: String,
      required: true,
    },
    // read: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true }
);

NotificationSchema.index({ createdAt: -1 });

export const Notification =
  mongoose.models.Notification || model("Notification", NotificationSchema);
