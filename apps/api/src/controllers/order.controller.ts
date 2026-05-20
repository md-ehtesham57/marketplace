import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// Place Order
export const placeOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { deliveryAddress, paymentMethod } = req.body;

        if (!deliveryAddress) {
            res.status(400).json({ error: "Delivery address is required" });
            return;
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: req.userId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ error: "Cart is empty" });
            return;
        }

        const totalAmount = cart.items.reduce(
            (acc, item) => acc + item.product.price * item.quantity,
            0
        );

        const order = await prisma.$transaction(async (tx) => {
            for (const item of cart.items) {
                const updated = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        isActive: true,
                        stock: { gte: item.quantity },
                    },
                    data: { stock: { decrement: item.quantity } },
                });

                if (updated.count !== 1) {
                    throw new Error("Insufficient stock for " + item.product.name);
                }
            }

            const newOrder = await tx.order.create({
                data: {
                    userId: req.userId as string,
                    totalAmount: Math.round(totalAmount),
                    deliveryAddress,
                    paymentMethod: paymentMethod || "COD",
                    status: "CONFIRMED",
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: { name: true, images: true },
                            },
                        },
                    },
                },
            });

            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            return newOrder;
        });

        res.status(201).json({
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.startsWith("Insufficient stock for")) {
            res.status(400).json({ error: message });
            return;
        }
        console.error("PlaceOrder error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get My Orders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { page = "1", limit = "10", status } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = { userId: req.userId };
        if (status) where.status = status;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: "desc" },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    images: true,
                                    category: { select: { name: true } },
                                },
                            },
                        },
                    },
                },
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("GetMyOrders error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Single Order
export const getOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findFirst({
            where: { id, userId: req.userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true,
                                category: { select: { name: true } },
                                seller: { select: { storeName: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        res.json({ order });
    } catch (error) {
        console.error("GetOrder error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get All Orders (Admin)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { page = "1", limit = "10", status } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) where.status = status;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                    items: {
                        include: {
                            product: { select: { name: true } },
                        },
                    },
                },
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("GetAllOrders error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Cancel Order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findFirst({
            where: { id, userId: req.userId },
            include: { items: true },
        });

        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        if (!["PENDING", "CONFIRMED"].includes(order.status)) {
            res.status(400).json({
                error: "Order cannot be cancelled at this stage",
            });
            return;
        }

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id },
                data: { status: "CANCELLED" },
            });

            // Restore stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }
        });

        res.json({ message: "Order cancelled successfully" });
    } catch (error) {
        console.error("CancelOrder error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update Order Status (Admin/Seller)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
            "REFUNDED",
        ];

        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: "Invalid order status" });
            return;
        }

        const order = await prisma.order.findUnique({ where: { id } });

        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        const updated = await prisma.order.update({
            where: { id },
            data: { status },
        });

        res.json({ message: "Order status updated", order: updated });
    } catch (error) {
        console.error("UpdateOrderStatus error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
