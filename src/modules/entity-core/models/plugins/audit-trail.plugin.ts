import { Schema } from 'mongoose';

const auditTrailPlugin = (schema: Schema) => {
  schema.pre('save', function (next) {
    const currentUserId = ASYNC_STORAGE.get('currentUserId');

    if (!currentUserId) {
      LOGGER.warn(
        'Warning: currentUserId is undefined. Audit trail fields will not be set.',
      );
    }

    if (this.isNew) {
      this.set('createdBy', currentUserId || null);
    } else {
      this.set('updatedBy', currentUserId || null);
    }
    next();
  });

  schema.methods.softDelete = function () {
    const currentUserId = ASYNC_STORAGE.get('currentUserId');
    this.deletedAt = new Date();
    this.deletedBy = currentUserId || null;
    return this.save();
  };
};

export default auditTrailPlugin;
