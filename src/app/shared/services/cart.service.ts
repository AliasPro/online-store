import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, BehaviorSubject, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {CartType} from "../../../types/cart.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {CartCountType} from "../../../types/cart-count.type";

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private count: number = 0
     count$: BehaviorSubject<number> = new BehaviorSubject<number>(0)

    constructor(private http: HttpClient) {
    }

    getCart(): Observable<CartType | DefaultResponseType> {
        return this.http.get<CartType | DefaultResponseType>(environment.api + 'cart', {withCredentials: true})
    }

    updateCart(productId: string, quantity: number): Observable<CartType | DefaultResponseType> {
        return this.http.post<CartType | DefaultResponseType>(environment.api + 'cart', {productId, quantity}, {withCredentials: true}).pipe(
            tap(result => {
                if (!result.hasOwnProperty('error')) {
                    let count = 0;
                    (result as CartType).items.forEach(item => {
                        count += item.quantity
                    })
                    this.setCount(count)
                }
            })
        )
    }

    getProductsCount(): void {
    this.http.get<CartCountType | DefaultResponseType>(environment.api + 'cart/count', {withCredentials: true})
        .subscribe(result => {
            if (!result.hasOwnProperty('error')) {
                this.setCount((result as CartCountType).count)
            }
        })
}

    resetCount(): void {
        this.setCount(0)
    }

    setCount(count: number) {
        this.count = count
        this.count$.next(this.count)
    }
}
