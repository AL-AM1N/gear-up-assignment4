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


export const adminService = {
    getAllUsers
}
