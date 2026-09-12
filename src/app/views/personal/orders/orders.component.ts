import {Component, OnInit} from '@angular/core';
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {OrderStatusUtil} from "../../../shared/utils/order-status.util";

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
    orders: OrderType[] = []

    constructor(
        private orderService: OrderService,
    ) {
    }

    ngOnInit(): void {
        this.orderService.getOrders().subscribe((result: OrderType[] | DefaultResponseType) => {
            if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message)
            }

            this.orders = result as OrderType[]
            this.orders.map(item => {
                const status = OrderStatusUtil.getStatusAndColor(item.status)
                item.statusRus = status.name
                item.statusColor = status.color
                return item
            })
        })
    }
}
