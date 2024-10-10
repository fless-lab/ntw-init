import { Router } from 'express';
import { TodoController } from '../controllers';

const router = Router();

/**
 * Route for creating a new Todo
 * POST /todos
 */
router.post('/', TodoController.createTodo);

/**
 * Route for retrieving all Todos, filtered by query parameters
 * GET /todos
 *
 * Query Params:
 * - page: The page number for pagination (default: 1)
 * - limit: The number of items per page (default: 10)
 * - sort: The sorting parameter (e.g., 'priority:desc')
 * - search: The search term to filter by title/description
 * - priority: Filter by priority (e.g., 'high', 'medium', 'low')
 * - completed: Filter by completion status (true or false)
 * - upcoming: Filter by due date (number of upcoming days)
 */
router.get('/', TodoController.getTodos);

/**
 * Route for retrieving a specific Todo by its ID
 * GET /todos/:todoId
 */
router.get('/:todoId', TodoController.getTodoById);

/**
 * Route for updating an existing Todo by its ID
 * PUT /todos/:todoId
 */
router.put('/:todoId', TodoController.updateTodo);

/**
 * Route for deleting a Todo by its ID
 * DELETE /todos/:todoId
 */
router.delete('/:todoId', TodoController.deleteTodo);

/**
 * Route for marking a Todo as complete
 * PATCH /todos/:todoId/complete
 */
router.patch('/:todoId/complete', TodoController.markTodoAsComplete);

export default router;
