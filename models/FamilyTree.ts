import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IFamilyTree extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  isPublic: boolean;
  shareToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyTreeSchema = new Schema<IFamilyTree>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, default: () => uuidv4(), unique: true },
  },
  { timestamps: true }
);

FamilyTreeSchema.index({ owner: 1, createdAt: -1 });

export const FamilyTree =
  mongoose.models.FamilyTree || mongoose.model<IFamilyTree>('FamilyTree', FamilyTreeSchema);
