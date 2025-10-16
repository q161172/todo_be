export function validateTodo(req, res, next) {
  const { title, dueDate } = req.body;
  
  // Chỉ validate title nếu có trong request body
  if (title !== undefined && (!title || !title.trim())) {
    return res.status(400).json({ message: "Title cannot be empty" });
  }
  
  if (dueDate) {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid dueDate format" });
    }
  }
  next();
}
