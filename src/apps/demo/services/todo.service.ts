import { ITodoModel } from '../types';
import { TodoRepository } from '../repositories';
import { TodoModel } from '../models';
import { EntityCoreModule } from 'modules/entity-core';
import { parseSortParam } from 'helpers';
import { SuccessResponseType, ErrorResponseType } from 'types';

const { BaseService } = EntityCoreModule.getChildren();

class TodoService extends BaseService<ITodoModel, TodoRepository> {
  constructor() {
    const todoRepo = new TodoRepository(TodoModel);
    super(todoRepo, true, [
      /*'attribute_to_populate'*/
    ]); // This will populate the entity field
    this.allowedFilterFields = ['dueDate', 'completed', 'priority']; // To filter on these fields, we need to set this
    this.searchFields = ['title', 'description']; // This will use the search keyword

    /**
     * The allowedFilterFields and searchFields are used to filter and search on the entity fields.
     * These declarations are there to ensure what fields are allowed to be used for filtering and searching.
     * If you want to filter on a field that is not declared here, you can add it to the allowedFilterFields array.
     * If you want to search on a field that is not declared here, you can add it to the searchFields array.
     */
  }

  async getTodos(
    filters: Record<string, any>,
  ): Promise<SuccessResponseType<ITodoModel> | ErrorResponseType> {
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

    console.log('here sort object', sortObject);
    // Call the base service findAll method with the constructed query
    return this.findAll({
      query,
      sort: sortObject,
      page: parseInt(page),
      limit: parseInt(limit),
      searchTerm: search as string,
    });
  }

  async markAsComplete(
    todoId: string,
  ): Promise<SuccessResponseType<ITodoModel> | ErrorResponseType> {
    return this.update({ _id: todoId }, { completed: true });
  }
}

export default new TodoService();
