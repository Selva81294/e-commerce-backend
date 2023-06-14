const orderRouter = require("express").Router();
const Order = require("../Models/Order");
const User = require("../Models/User");

//creating an order

orderRouter.post("/", async (req, res) => {
  const io = req.app.get("socketio");
  const { userId, cart, country, address } = req.body;
  try {
    const user = await User.findById(userId);
    const order = await Order.create({
      owner: user._id,
      products: cart,
      country,
      address,
    });
    order.count = cart.count;
    order.total = cart.total;
    await order.save();
    user.cart = { total: 0, count: 0 };
    user.orders.push(order);
    const notification = {
      status: "unread",
      message: `New order from ${user.name}`,
      time: new Date().toLocaleString(),
    };
    io.sockets.emit("new-order", notification);
    user.markModified("orders");
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//getting all orders

orderRouter.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("owner", ["email", "name"]);
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//shipping order

orderRouter.patch("/:id/mark-shipped", async (req, res) => {
  const io = req.app.get("socketio");
  const { id } = req.params;
  const { ownerId } = req.body;
  try {
    const user = await User.findById(ownerId);
    await Order.findByIdAndUpdate(id, { status: "shipped" });
    const orders = await Order.find().populate("owner", ["email", "name"]);
    const notification = {
      status: "unread",
      message: `Your order ${id} shipped with success`,
      time: new Date().toLocaleString(),
    };
    io.sockets.emit("notification", notification, ownerId);
    user.notifications.unshift(notification);
    await user.save();
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = orderRouter;
