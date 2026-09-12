import {ProductCardComponent} from "./product-card.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Router} from "@angular/router";
import {CartService} from "../../services/cart.service";
import {FavoriteService} from "../../services/favorite.service";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {of, Subject} from "rxjs";
import {ProductType} from "../../../../types/product.type";
import {NO_ERRORS_SCHEMA} from "@angular/core";

describe('Product Card', () => {
    let productCardComponent: ProductCardComponent
    let fixture: ComponentFixture<ProductCardComponent>
    let product: ProductType

    beforeEach(() => {
        const cartServiceSpy = jasmine.createSpyObj('CartService', ['updateCart'])
        const favoriteServiceSpy = jasmine.createSpyObj('FavoriteService', ['removeFavorite', 'addToFavorite'])
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLogged'], {isLogged$: of(true)})
        const _snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open'])
        const routerSpy = jasmine.createSpyObj('Router', ['navigate'])

        TestBed.configureTestingModule({
            declarations: [ProductCardComponent],
            providers: [
                {provide: CartService, useValue: cartServiceSpy},
                {provide: FavoriteService, useValue: favoriteServiceSpy},
                {provide: AuthService, useValue: authServiceSpy},
                {provide: MatSnackBar, useValue: _snackBarSpy},
                {provide: Router, useValue: routerSpy},
            ],
            schemas: [NO_ERRORS_SCHEMA],
        })
        fixture = TestBed.createComponent(ProductCardComponent)
        productCardComponent = fixture.componentInstance
        product = {
            id: 'string',
            name: 'string',
            price: 13,
            image: 'string',
            lightning: 'string',
            humidity: 'string',
            temperature: 'string',
            height: 13,
            diameter: 13,
            url: 'string',
            type: {
                id: 'string',
                name: 'string',
                url: 'string',
            },
        }
    })

    it('should have count init value 1', () => {
        expect(productCardComponent.count).toBe(1)
    })

    it('should set value from input countInCart to count', () => {
        productCardComponent.countInCart = 5
        fixture.detectChanges()
        expect(productCardComponent.count).toBe(5)
    })

    it('should call removeFromCart with count 0', () => {
        let cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>
        cartServiceSpy.updateCart.and.returnValue(of({
            items: [{
                product: {
                    id: 'string',
                    name:
                        'string',
                    price:
                        34,
                    image:
                        'string',
                    url:
                        'string',
                },
                quantity: 2,
            }],
        }))

        productCardComponent.product = product

        productCardComponent.removeFromCart()

        expect(cartServiceSpy.updateCart).toHaveBeenCalledWith(productCardComponent.product.id, 0)
    })

    it('should hide product-cart-info if it is lite card', () => {
        productCardComponent.isLite = true
        productCardComponent.product = product

        fixture.detectChanges()

        const componentElement: HTMLElement = fixture.nativeElement
        const productCardInfo: HTMLElement | null = componentElement.querySelector('.product-card-info')
        const productCardExtra: HTMLElement | null = componentElement.querySelector('.product-card-extra')

        expect(productCardInfo).toBeNull()
        expect(productCardExtra).toBeNull()
    })
})
