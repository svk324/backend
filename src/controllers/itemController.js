// src/controllers/itemController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create item
exports.createItem = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newItem = await prisma.item.create({
      data: {
        title,
        description,
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const updatedItem = await prisma.item.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
      },
    });

    res.json(updatedItem);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.item.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(500).json({ error: error.message });
  }
};
