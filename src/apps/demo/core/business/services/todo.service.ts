import { TodoRepository } from '../repositories';
import { ITodoModel, TodoModel } from 'apps/demo/core/domain';
import { parseSortParam } from 'helpers';
import { BaseService } from '@nodesandbox/repo-framework';
import {
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';

class TodoService extends BaseService<ITodoModel, TodoRepository> {
  constructor() {
    const todoRepo = new TodoRepository(TodoModel);

    // Configuration du service avec le nouveau constructeur
    super(todoRepo, {
      // Configuration des options
      slug: {
        enabled: true,
        sourceField: 'name',
        targetField: 'slug',
      },
      filter: {
        allowedFields: ['dueDate', 'completed', 'priority'],
        defaultSort: { createdAt: -1 }, // Exemple de tri par défaut
      },
      search: {
        enabled: true,
        fields: ['title', 'description'],
        caseSensitive: false,
        fuzzySearch: false,
      },
      populate: {
        fields: [],
        defaultPopulate: false,
      },
    });
  }

  async getTodos(
    filters: Record<string, any>,
  ): Promise<ErrorResponseType | SuccessResponseType<ITodoModel>> {
    const {
      page = 1,
      limit = 10,
      sort,
      search = '',
      priority,
      completed,
      upcoming,
    } = filters;
    // Build query object
    const query: any = {};
    if (priority) query.priority = priority;
    if (completed !== undefined) query.completed = completed === 'true';

    // Handle upcoming due dates
    if (upcoming) {
      const days = parseInt(upcoming as string) || 7;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      query.dueDate = { $gte: new Date(), $lte: futureDate };
    }

    // Parse sorting parameter using helper function
    const sortObject = sort ? parseSortParam(sort) : {};

    // Call the base service findAll method with the constructed query
    return this.findAll({
      query,
      sort: sortObject,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      searchTerm: search as string,
    });
  }

  async markAsComplete(
    todoId: string,
  ): Promise<SuccessResponseType<ITodoModel> | ErrorResponseType> {
    return this.updateById(todoId, { completed: true });
  }
}

export default new TodoService();
