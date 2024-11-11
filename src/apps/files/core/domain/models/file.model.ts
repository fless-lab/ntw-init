import { BaseModel, createBaseSchema } from '@nodesandbox/repo-framework';
import { IFileModel, IMetaDataModel } from '../types';

const FILE_MODEL_NAME = 'File';
const METADATA_MODEL_NAME = 'File';

const metaDataSchema = createBaseSchema<IMetaDataModel>(
  {
    fieldname: {
      type: String,
      required: true,
    },
    originalname: {
      type: String,
      required: false,
    },
    encoding: {
      type: String,
      required: false,
    },
    mimetype: {
      type: String,
      required: false,
    },
  },
  {
    modelName: METADATA_MODEL_NAME,
  },
);

const fileSchema = createBaseSchema<IFileModel>(
  {
    hash: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storageType: {
      type: String,
      enum: CONFIG.fs.stores,
      default: CONFIG.fs.defaultStore,
      required: false,
    },
    locationData: {
      path: { type: String },
      minio: {
        bucket: { type: String },
        objectName: { type: String },
      },
    },
    url: {
      type: String,
    },
    presignedUrlExpiration: {
      type: Date,
    },
    metadata: {
      type: metaDataSchema,
    },
    downloadCount: {
      type: Number,
    },
  },
  {
    modelName: FILE_MODEL_NAME,
  },
);

const FileModel = new BaseModel<IFileModel>(
  FILE_MODEL_NAME,
  fileSchema,
).getModel();

export { FileModel };
