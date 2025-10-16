import prisma from "../config/database.js";

// Helper function để tính thời gian còn lại
const calculateTimeRemaining = (dueDate) => {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  
  if (diffMs <= 0) return null; // Đã quá hạn
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    days,
    hours,
    minutes,
    totalMs: diffMs
  };
};

const buildWhere = (userId, query) => {
  const where = { userId };
  
  // Status filter
  if (query.status === "completed") where.completed = true;
  if (query.status === "active") where.completed = false;
  
  // Priority filter (support multiple priorities)
  if (query.priorities) {
    const priorities = Array.isArray(query.priorities) ? query.priorities : [query.priorities];
    where.priority = { in: priorities };
  }
  
  // Overdue filter
  if (query.overdueOnly === "true") {
    where.dueDate = { lt: new Date() };
    where.completed = false; // Only show incomplete overdue todos
  }
  
  // Search filter
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }
  return where;
};

export const listTodos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sort = "createdDesc" } = req.query;
    
    // Build orderBy based on sort parameter
    let orderBy = { createdAt: "desc" }; // default
    switch (sort) {
      case "createdAsc":
        orderBy = { createdAt: "asc" };
        break;
      case "dueAsc":
        orderBy = { dueDate: "asc" };
        break;
      case "dueDesc":
        orderBy = { dueDate: "desc" };
        break;
      case "priorityDesc":
        orderBy = { priority: "desc" };
        break;
      case "priorityAsc":
        orderBy = { priority: "asc" };
        break;
      case "titleAsc":
        orderBy = { title: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }
    
    const todos = await prisma.todo.findMany({ 
      where: buildWhere(userId, req.query), 
      orderBy 
    });
    
    // Thêm thông tin thời gian còn lại cho mỗi todo
    const todosWithTimeRemaining = todos.map(todo => ({
      ...todo,
      timeRemaining: calculateTimeRemaining(todo.dueDate)
    }));
    
    res.json({ data: todosWithTimeRemaining });
  } catch (err) {
    console.error('Error listing todos:', err);
    next(err);
  }
};

export const createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    
    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.id,
      },
    });
    
    // Thêm thông tin thời gian còn lại
    const todoWithTimeRemaining = {
      ...todo,
      timeRemaining: calculateTimeRemaining(todo.dueDate)
    };
    
    res.status(201).json(todoWithTimeRemaining);
  } catch (err) {
    console.error('Error creating todo:', err);
    next(err);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    const updated = await prisma.todo.update({ where: { id }, data });
    
    // Thêm thông tin thời gian còn lại
    const updatedWithTimeRemaining = {
      ...updated,
      timeRemaining: calculateTimeRemaining(updated.dueDate)
    };
    
    res.json(updatedWithTimeRemaining);
  } catch (err) {
    console.error('Error updating todo:', err);
    next(err);
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.todo.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting todo:', err);
    next(err);
  }
};
