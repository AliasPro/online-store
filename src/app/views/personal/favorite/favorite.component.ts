import {Component, OnInit} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {FavoriteType} from "../../../../types/favorite.type";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
    selector: 'app-favorite',
    templateUrl: './favorite.component.html',
    styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
    readonly serverStaticPath: string = environment.serverStaticPath
    products: FavoriteType[] = []

    constructor(
        private favoriteService: FavoriteService,
        private cartService: CartService,
    ) {
    }

    ngOnInit(): void {
        this.favoriteService.getFavorites().subscribe((result: FavoriteType[] | DefaultResponseType) => {
            if ((result as DefaultResponseType).error !== undefined) {
                const error = (result as DefaultResponseType).message
                throw new Error(error)
            }

            this.products = result as FavoriteType[]

            this.cartService.getCart().subscribe((result: CartType | DefaultResponseType) => {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message)
                }

                const cart = result as CartType

                this.products.map(product => {
                    const currentProductInCart = cart.items.find(item => item.product.id === product.id)
                    if (currentProductInCart) {
                        product.countInCart = currentProductInCart.quantity
                    }
                    return product
                })
            })
        })
    }

    removeFromFavorite(id: string) {
        this.favoriteService.removeFavorite(id).subscribe((result: DefaultResponseType) => {
            if (result.error) {
                throw new Error(result.message)
            }

            this.products = this.products.filter(item => item.id !== id)
        })
    }

    updateCart(product: FavoriteType, value?: number) {
        const count: number = value !== undefined ? value : 1
        product.countInCart = count

        this.cartService.updateCart(product.id, count).subscribe((result: CartType | DefaultResponseType) => {
            if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message)
            }
        })
    }
}
