import { Request, Response, NextFunction } from 'express';
import { TodoService } from 'apps/demo/core/business';
import { CreateTodoRequestSchema } from '../dtos';
import { sanitize } from 'helpers';
import { ApiResponse, ErrorResponseType } from '@nodesandbox/response-kit';
/**
 * Controller to handle the operations related to the Todo resource.
 */
export class TodoController {
  /**
   * Create a new Todo item.
   * @param req - Express Request object containing the todo data in the request body.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async createTodo(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const _payload = sanitize(req.body, CreateTodoRequestSchema);

      if (!_payload.success) {
        throw _payload.error;
      }

      const response = await TodoService.create(_payload.data);

      if (!response.success) {
        throw response.error;
      }

      ApiResponse.success(res, response, 201);
    } catch (error) {
      ApiResponse.error(res, {
        success: false,
        error: error,
      } as ErrorResponseType);
    }
  }

  /**
   * Retrieve a list of Todos based on filters (priority, completion, etc.).
   * @param req - Express Request object, with filters in the query params.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async getTodos(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const filters = req.query; // Extract query params for filtering.
      const response = await TodoService.getTodos(filters);

      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }

  /**
   * Retrieve a single Todo item by its ID.
   * @param req - Express Request object, with the Todo ID in the URL params.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async getTodoById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const todoId = req.params.todoId; // Extract the Todo ID from the request params.
      const response = await TodoService.findOne({ _id: todoId });
      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }

  /**
   * Update an existing Todo item by its ID.
   * @param req - Express Request object, with the Todo ID in the URL params and updated data in the request body.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async updateTodo(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const todoId = req.params.todoId; // Extract the Todo ID from the request params.
      const response = await TodoService.update({ _id: todoId }, req.body); // Update the Todo with new data.

      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }

  /**
   * Delete a Todo item by its ID.
   * @param req - Express Request object, with the Todo ID in the URL params.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async deleteTodo(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const todoId = req.params.todoId; // Extract the Todo ID from the request params.
      const response = await TodoService.delete({ _id: todoId }); // Soft or hard delete the Todo.

      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }

  /**
   * Mark a Todo item as complete by its ID.
   * @param req - Express Request object, with the Todo ID in the URL params.
   * @param res - Express Response object for sending the API response.
   * @param _next - Next middleware function in the Express stack.
   */
  static async markTodoAsComplete(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const todoId = req.params.todoId; // Extract the Todo ID from the request params.
      const response = await TodoService.markAsComplete(todoId); // Mark the Todo as complete.

      if (response.success) {
        ApiResponse.success(res, response); // Send a success response.
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType); // Handle any errors.
    }
  }
}
