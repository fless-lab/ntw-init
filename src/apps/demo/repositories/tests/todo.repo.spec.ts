/* eslint-disable prettier/prettier */
import { ITodoModel } from 'apps/demo/types';
import { Model } from 'mongoose';
import { TodoRepository } from '../todo.repo';

// Créer un mock pour le modèle Mongoose
const mockTodoModel = {
  find: jest.fn(),
};

describe('TodoRepository', () => {
  let todoRepository: TodoRepository;

  beforeEach(() => {
    todoRepository = new TodoRepository(
      mockTodoModel as unknown as Model<ITodoModel>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findIncomplete', () => {
    it('should return incomplete todos', async () => {
      const mockTodos = [
        { id: 1, completed: false },
        { id: 2, completed: false },
      ];
      (mockTodoModel.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockTodos),
      });

      const result = await todoRepository.findIncomplete();

      expect(mockTodoModel.find).toHaveBeenCalledWith({ completed: false });
      expect(result).toEqual(mockTodos);
    });
  });

  describe('findByPriority', () => {
    it('should return todos by priority', async () => {
      const priority = 'high';
      const mockTodos = [
        { id: 1, priority },
        { id: 2, priority },
      ];
      (mockTodoModel.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockTodos),
      });

      const result = await todoRepository.findByPriority(priority);

      expect(mockTodoModel.find).toHaveBeenCalledWith({ priority });
      expect(result).toEqual(mockTodos);
    });
  });
});
