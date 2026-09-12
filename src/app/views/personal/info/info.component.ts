import {Component, OnInit} from '@angular/core';
import {DeliveryType} from "../../../../types/delivery.type";
import {PaymentType} from "../../../../types/payment.type";
import {FormBuilder, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
    protected readonly deliveryTypes = DeliveryType
    protected readonly paymentTypes = PaymentType

    deliveryType: DeliveryType = DeliveryType.delivery

    userInfoForm = this.fb.group({
        firstName: [''],
        fatherName: [''],
        lastName: [''],
        phone: [''],
        email: ['', Validators.email],
        street: [''],
        house: [''],
        entrance: [''],
        apartment: [''],
        paymentType: [PaymentType.cashToCourier],
    })

    get firstName() {return this.userInfoForm.get('firstName')}
    get fatherName() {return this.userInfoForm.get('fatherName')}
    get lastName() {return this.userInfoForm.get('lastName')}
    get phone() {return this.userInfoForm.get('phone')}
    get email() {return this.userInfoForm.get('email')}
    get street() {return this.userInfoForm.get('street')}
    get house() {return this.userInfoForm.get('house')}
    get entrance() {return this.userInfoForm.get('entrance')}
    get apartment() {return this.userInfoForm.get('apartment')}
    get paymentType() {return this.userInfoForm.get('paymentType')}

    constructor(
        private userService: UserService,
        private router: Router,
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
    ) {
    }

    ngOnInit(): void {
        this.userService.getUserInfo().subscribe((result: UserInfoType | DefaultResponseType) => {
            if ((result as DefaultResponseType).error !== undefined) {
                throw new Error((result as DefaultResponseType).message)
            }

            const userInfo = result as UserInfoType
            this.deliveryType = userInfo.deliveryType || DeliveryType.delivery
            this.userInfoForm.setValue({
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
            })
        })
    }

    changeDeliveryType(deliveryType: DeliveryType): void {
        this.deliveryType = deliveryType
        this.userInfoForm.markAsDirty()
    }

    updateUserInfo() {
        if (this.userInfoForm.invalid || !this.email?.value || !this.paymentType?.value) {
            this._snackBar.open('Заполните поля', 'Закрыть')
            return
        }

        const paramObject: UserInfoType = {
            email: this.email.value,
            deliveryType: this.deliveryType,
            paymentType: this.paymentType.value,
        }
        if (this.firstName?.value) {paramObject.firstName = this.firstName.value}
        if (this.fatherName?.value) {paramObject.fatherName = this.fatherName.value}
        if (this.lastName?.value) {paramObject.lastName = this.lastName.value}
        if (this.phone?.value) {paramObject.phone = this.phone.value}
        if (this.street?.value) {paramObject.street = this.street.value}
        if (this.house?.value) {paramObject.house = this.house.value}
        if (this.entrance?.value) {paramObject.entrance = this.entrance.value}

        this.userService.updateUserInfo(paramObject).subscribe({
            next: (result: DefaultResponseType) => {
                if (result.error) {
                    this._snackBar.open(result.message, 'Закрыть')
                    throw new Error(result.message)
                }

                this._snackBar.open('Данные успешно сохранены!', 'Закрыть')
                this.userInfoForm.markAsPristine()
            },
            error: (errorResponse: HttpErrorResponse) => {
                if (errorResponse.error && errorResponse.error.message) {
                    this._snackBar.open(errorResponse.error.message, 'Закрыть')
                } else {
                    this._snackBar.open('Ошибка сохранения', 'Закрыть')
                }
            }
        })
    }
}
