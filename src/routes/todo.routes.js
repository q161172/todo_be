import express from "express";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo
} from "../controllers/todo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateTodo } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", listTodos);
router.post("/", validateTodo, createTodo);
router.put("/:id", validateTodo, updateTodo);
router.delete("/:id", deleteTodo);

export default router;
