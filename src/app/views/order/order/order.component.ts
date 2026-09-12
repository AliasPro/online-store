import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DeliveryType} from "../../../../types/delivery.type";
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
    cart: CartType | null = null
    totalCount: number = 0
    productsPrice: number = 0
    deliveryPrice: number = 10  // На бэке нет таких данных, поэтому хардкодим
    totalPrice: number = 0

    deliveryTypes = DeliveryType
    paymentTypes = PaymentType
    deliveryType: DeliveryType = DeliveryType.delivery

    @ViewChild('popup') popup!: TemplateRef<ElementRef>
    dialogRef: MatDialogRef<any> | null = null

    orderForm = this.fb.group({
        firstName: ['', Validators.required],
        fatherName: [''],
        lastName: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        street: [''],
        house: [''],
        entrance: [''],
        apartment: [''],
        paymentType: [PaymentType.cashToCourier, Validators.required],
        comment: [''],
    })

    get firstName() {return this.orderForm.get('firstName')}
    get fatherName() {return this.orderForm.get('fatherName')}
    get lastName() {return this.orderForm.get('lastName')}
    get phone() {return this.orderForm.get('phone')}
    get email() {return this.orderForm.get('email')}
    get street() {return this.orderForm.get('street')}
    get house() {return this.orderForm.get('house')}
    get entrance() {return this.orderForm.get('entrance')}
    get apartment() {return this.orderForm.get('apartment')}
    get paymentType() {return this.orderForm.get('paymentType')}
    get comment() {return this.orderForm.get('comment')}

    constructor(
        private cartService: CartService,
        private router: Router,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private orderService: OrderService,
        private userService: UserService,
        private authService: AuthService,
    ) {
        this.updateDeliveryTypeValidation()
    }

    ngOnInit(): void {
        this.cartService.getCart().subscribe((result: CartType | DefaultResponseType) => {
            if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message)
            }

            this.cart = result as CartType
            if (!this.cart || this.cart.items.length === 0) {
                this._snackBar.open('Корзина пустая', 'Закрыть')
                this.router.navigate(['/'])
            }
            this.calculateTotal()
        })

        if (this.authService.isLogged) {
            this.userService.getUserInfo().subscribe((result: UserInfoType | DefaultResponseType) => {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message)
                }

                const userInfo = result as UserInfoType
                this.deliveryType = userInfo.deliveryType || DeliveryType.delivery
                this.orderForm.setValue({
                    firstName: userInfo.firstName || '',
                    fatherName: userInfo.fatherName || '',
                    lastName: userInfo.lastName || '',
                    phone: userInfo.phone || '',
                    email: userInfo.email || '',
                    street: userInfo.street || '',
                    house: userInfo.house || '',
                    entrance: userInfo.entrance || '',
                    apartment: userInfo.apartment || '',
                    paymentType: userInfo.paymentType || PaymentType.cardOnline,
                    comment: '',
                })
                this.updateDeliveryTypeValidation()
            })
        }
    }

    calculateTotal(): void {
        this.productsPrice = 0
        this.totalCount = 0

        if (this.cart) {
            this.cart.items.forEach(item => {
                this.productsPrice += item.quantity * item.product.price
                this.totalCount += item.quantity
            })
            this.totalPrice = this.productsPrice + this.deliveryPrice
        }
    }

    changeDeliveryType(deliveryType: DeliveryType): void {
        this.deliveryType = deliveryType
        this.updateDeliveryTypeValidation()
    }

    updateDeliveryTypeValidation() {
        if (this.deliveryType === DeliveryType.delivery) {
            this.street?.setValidators(Validators.required)
            this.house?.setValidators(Validators.required)
        } else {
            this.street?.removeValidators(Validators.required)
            this.house?.removeValidators(Validators.required)
            this.street?.setValue('')
            this.house?.setValue('')
            this.entrance?.setValue('')
            this.apartment?.setValue('')
        }

        this.street?.updateValueAndValidity()
        this.house?.updateValueAndValidity()
    }

    createOrder() {
        if (this.orderForm.invalid || !this.firstName?.value || !this.fatherName?.value || !this.lastName?.value || !this.phone?.value || !this.email?.value || !this.paymentType?.value) {
            this.orderForm.markAllAsTouched()
            this._snackBar.open('Заполните необходимые поля', 'Закрыть')
            return
        }

        const paramsObject: OrderType = {
            deliveryType: this.deliveryType,
            firstName: this.firstName.value,
            fatherName: this.fatherName.value,
            lastName: this.lastName.value,
            phone: this.phone.value,
            email: this.email.value,
            paymentType: this.paymentType.value,
        }

        if (this.deliveryType === DeliveryType.delivery) {
            if (this.street?.value) {
                paramsObject.street = this.street.value
            }
            if (this.house?.value) {
                paramsObject.house = this.house.value
            }
            if (this.entrance?.value) {
                paramsObject.entrance = this.entrance.value
            }
            if (this.apartment?.value) {
                paramsObject.apartment = this.apartment.value
            }
        }
        if (this.comment?.value) {
            paramsObject.comment = this.comment.value
        }

        this.orderService.createOrder(paramsObject).subscribe({
            next: (result: OrderType | DefaultResponseType) => {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message)
                }

                this.dialogRef = this.dialog.open(this.popup)
                this.dialogRef.backdropClick().subscribe(() => {
                    this.router.navigate(['/'])
                })
                this.cartService.setCount(0)
            },
            error: (errorResponse: HttpErrorResponse) => {
                if (errorResponse.error && errorResponse.error.message) {
                    this._snackBar.open(errorResponse.error.message, 'Закрыть')
                } else {
                    this._snackBar.open('Ошибка создания заказа', 'Закрыть')
                }
            }
        })
    }

    closePopup() {
        this.dialogRef?.close()
        this.router.navigate(['/'])
    }
}
