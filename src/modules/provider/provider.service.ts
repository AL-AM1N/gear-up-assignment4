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
    getMyGearItems
}
