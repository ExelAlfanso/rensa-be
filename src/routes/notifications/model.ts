import mongoose, { model, Schema } from "mongoose";

export type NotificationDocument = mongoose.Document & {
  recipientId: string;
  actorId: string;
  type: "photo-saved" | "photo-bookmarked" | "photo-commented";
  photoId: string;
  createdAt: Date;
  updatedAt: Date;
};
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
      enum: ["photo-saved", "photo-bookmarked", "photo-commented"], // bisa tambah jenis lain nanti
      required: true,
    },
    photoId: {
      type: String,
      required: true,
    },

    // kalau mau implement read notification nanti
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
