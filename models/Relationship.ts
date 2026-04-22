import mongoose, { Document, Schema } from 'mongoose';

export interface IRelationship extends Document {
  treeId: mongoose.Types.ObjectId;
  type: 'parent-child' | 'spouse' | 'sibling';
  sourceId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipSchema = new Schema<IRelationship>(
  {
    treeId: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true, index: true },
    type: {
      type: String,
      enum: ['parent-child', 'spouse', 'sibling'],
      required: true,
    },
    sourceId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    targetId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

RelationshipSchema.index({ treeId: 1 });
RelationshipSchema.index({ sourceId: 1, targetId: 1, type: 1 }, { unique: true });

export const Relationship =
  mongoose.models.Relationship ||
  mongoose.model<IRelationship>('Relationship', RelationshipSchema);
