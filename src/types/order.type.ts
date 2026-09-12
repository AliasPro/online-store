import {DeliveryType} from "./delivery.type";
import {PaymentType} from "./payment.type";
import {OrderStatusType} from "./order-status.type";

export type OrderType = {
    deliveryType: DeliveryType,
    firstName: string,
    fatherName: string,
    lastName: string,
    phone: string,
    email: string,
    paymentType: PaymentType,
    street?: string,
    house?: string,
    entrance?: string,
    apartment?: string,
    comment?: string,
    totalAmount?: number,
    status?: OrderStatusType,
    statusRus?: string,
    statusColor?: string,
    items?: {
        id: string,
        name: string,
        quantity: number,
        price: number,
        total: number,
    }[],
}
