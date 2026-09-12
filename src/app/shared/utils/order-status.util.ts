import {OrderStatusType} from "../../../types/order-status.type";

export class OrderStatusUtil {
    static getStatusAndColor(status: string | undefined): {name: string, color: string} {
        const mapping = [
            {
                status: OrderStatusType.new,
                name: 'Новый',
                color: '#456F49',
            },
            {
                status: OrderStatusType.pending,
                name: 'В работе',
                color: '#456F49',
            },
            {
                status: OrderStatusType.delivery,
                name: 'Доставляется',
                color: '#456F49',
            },
            {
                status: OrderStatusType.cancelled,
                name: 'Отменен',
                color: '#FF7575',
            },
            {
                status: OrderStatusType.success,
                name: 'Доставлен',
                color: '#B6D5D9',
            },
        ]

        const foundedRes = mapping.find(item => item.status === status)
        const result = foundedRes ? foundedRes : mapping[0]

        return {name: result.name, color: result.color}
    }
}
