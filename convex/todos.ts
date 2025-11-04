import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTodos = query({
  handler: async (ctx) => {
    const todos = await ctx.db
      .query("todos")
      .order("asc")
      .collect();
    
    return todos.sort((a, b) => a.order - b.order);
  },
});

export const addTodo = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const todos = await ctx.db.query("todos").collect();
    const maxOrder = todos.length > 0 
      ? Math.max(...todos.map(t => t.order)) 
      : -1;
    
    const todoId = await ctx.db.insert("todos", {
      text: args.text,
      completed: false,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });
    
    return todoId;
  },
});

export const toggleTodo = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) throw new Error("Todo not found");
    
    await ctx.db.patch(args.id, {
      completed: !todo.completed,
    });
  },
});

export const deleteTodo = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateTodoOrder = mutation({
  args: {
    todoId: v.id("todos"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.todoId, {
      order: args.newOrder,
    });
  },
});

export const reorderTodos = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("todos"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const update of args.updates) {
      await ctx.db.patch(update.id, {
        order: update.order,
      });
    }
  },
});

export const clearCompleted = mutation({
  handler: async (ctx) => {
    const completedTodos = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();
    
    for (const todo of completedTodos) {
      await ctx.db.delete(todo._id);
    }
  },
});