import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {FavoriteService} from "../../services/favorite.service";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
    selector: 'product-card',
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
    readonly serverStaticPath: string = environment.serverStaticPath
    count: number = 1
    isLogged: boolean = false

    @Input() product!: ProductType
    @Input() isLite: boolean = false
    @Input() countInCart: number | undefined = 0

    constructor(
        private cartService: CartService,
        private favoriteService: FavoriteService,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        private router: Router,
    ) {
        this.isLogged = this.authService.isLogged
    }

    ngOnInit(): void {
        if (this.countInCart && this.countInCart > 1) {
            this.count = this.countInCart
        }

        this.authService.isLogged$.subscribe((result: boolean) => {
            this.isLogged = result
        })
    }

    updateCount(value: number): void {
        this.count = value
        if (this.countInCart) {
            this.addToCart()
        }
    }

    addToCart() {
        this.cartService.updateCart(this.product.id, this.count).subscribe((result: CartType | DefaultResponseType) => {
            if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message)
            }
            this.countInCart = this.count
        })
    }

    removeFromCart() {
        this.cartService.updateCart(this.product.id, 0).subscribe((result: CartType | DefaultResponseType) => {
            if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message)
            }
            this.countInCart = 0
            this.count = 1
        })
    }

    updateFavorite() {
        if (!this.authService.isLogged) {
            this._snackBar.open('Для добавления в избранное нужно авторизоваться', 'Закрыть')
            return
        }


        if (this.product.isInFavorite) {
            this.favoriteService.removeFavorite(this.product.id).subscribe((result: DefaultResponseType) => {
                if (result.error) {
                    throw new Error((result as DefaultResponseType).message)
                }

                this.product.isInFavorite = false
            })
        } else {
            this.favoriteService.addToFavorite(this.product.id).subscribe((result: FavoriteType[] | DefaultResponseType) => {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message)
                }

                this.product.isInFavorite = true
            })
        }
    }

    navigate() {
        if (this.isLite) {
            this.router.navigate(['/product/' + this.product.url])
        }
    }
}
