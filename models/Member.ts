import mongoose, { Document, Schema } from 'mongoose';

export interface IMember extends Document {
  treeId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  dateOfBirth?: Date;
  dateOfDeath?: Date;
  isAlive: boolean;
  bio?: string;
  photo?: string;
  birthPlace?: string;
  occupation?: string;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    treeId: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true, index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unknown'],
      default: 'unknown',
    },
    dateOfBirth: { type: Date },
    dateOfDeath: { type: Date },
    isAlive: { type: Boolean, default: true },
    bio: { type: String, maxlength: 2000 },
    photo: { type: String },
    birthPlace: { type: String, maxlength: 200 },
    occupation: { type: String, maxlength: 200 },
    positionX: { type: Number, default: 0 },
    positionY: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MemberSchema.index({ treeId: 1 });

export const Member = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);
