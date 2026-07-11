import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { ICreatePaymentPayload } from "./payment.interface";

const createPaymentIntent = async (userId: string, payload: ICreatePaymentPayload) => {
    const { rentalOrderId, method } = payload;

    const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: rentalOrderId, customerId: userId },
        include: { gearItem: true }
    });

    if (rentalOrder.status !== "PLACED" && rentalOrder.status !== "CONFIRMED") {
        throw new Error("Payment can only be made for placed or confirmed orders");
    }

    const existingPayment = await prisma.payment.findUnique({
        where: { rentalOrderId }
    });

    if (existingPayment?.status === "COMPLETED") {
        throw new Error("Payment has already been completed for this order");
    }

    let payment;
    if (existingPayment) {
        payment = existingPayment;
    } else {
        payment = await prisma.payment.create({
            data: {
                rentalOrderId,
                userId,
                amount: rentalOrder.totalAmount,
                method,
                status: "PENDING"
            }
        });
    }

    if (method === "STRIPE") {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(rentalOrder.totalAmount * 100),
            currency: "usd",
            metadata: {
                rentalOrderId,
                userId
            }
        });

        await prisma.payment.update({
            where: { id: payment.id },
            data: { stripePaymentIntentId: paymentIntent.id }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentId: payment.id,
            amount: rentalOrder.totalAmount
        };
    }

    return {
        paymentId: payment.id,
        amount: rentalOrder.totalAmount,
        message: "Payment record created. Complete payment via SSLCommerz."
    };
}


export const paymentService = {
    createPaymentIntent
}
