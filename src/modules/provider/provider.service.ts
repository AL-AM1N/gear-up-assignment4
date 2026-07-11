import { prisma } from "../../lib/prisma";
import { ICreateGearPayload, IUpdateGearPayload } from "../gear/gear.interface";

const addGearItem = async (providerId: string, payload: ICreateGearPayload) => {
    const gearItem = await prisma.gearItem.create({
        data: {
            ...payload,
            providerId
        },
        include: {
            category: true
        }
    });

    return gearItem;
}

const updateGearItem = async (gearId: string, providerId: string, payload: IUpdateGearPayload) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearId }
    });

    if (gearItem.providerId !== providerId) {
        throw new Error("You can only update your own gear items");
    }

    const updated = await prisma.gearItem.update({
        where: { id: gearId },
        data: payload,
        include: {
            category: true
        }
    });

    return updated;
}

const deleteGearItem = async (gearId: string, providerId: string) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearId }
    });

    if (gearItem.providerId !== providerId) {
        throw new Error("You can only delete your own gear items");
    }

    await prisma.gearItem.delete({
        where: { id: gearId }
    });
}

const getMyGearItems = async (providerId: string) => {
    const gearItems = await prisma.gearItem.findMany({
        where: { providerId },
        orderBy: { createdAt: "desc" },
        include: {
            category: true,
            _count: {
                select: {
                    rentalOrders: true,
                    reviews: true
                }
            }
        }
    });

    return gearItems;
}


export const providerService = {
    addGearItem,
    updateGearItem,
    deleteGearItem,
    getMyGearItems
}
