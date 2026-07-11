import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        omit: { password: true },
        include: {
            _count: {
                select: {
                    providedGear: true,
                    rentals: true
                }
            }
        }
    });

    return users;
}

const updateUserStatus = async (userId: string, status: "ACTIVE" | "BLOCKED") => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId }
    });

    if (user.role === "ADMIN") {
        throw new Error("Cannot change status of admin users");
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { status },
        omit: { password: true }
    });

    return updated;
}



export const adminService = {
    getAllUsers,
    updateUserStatus
}
