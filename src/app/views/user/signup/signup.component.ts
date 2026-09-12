import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
    signupForm = this.fb.group({
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
        passwordRepeat: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
        agree: [false, [Validators.requiredTrue]],
    })

    get email() {return this.signupForm.get('email')}
    get password() {return this.signupForm.get('password')}
    get passwordRepeat() {return this.signupForm.get('passwordRepeat')}
    get agree() {return this.signupForm.get('agree')}

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        private router: Router,
        ) {
    }

    ngOnInit(): void {
    }

    signup(): void {
        if (this.signupForm.invalid || !this.email?.value || !this.password?.value || !this.passwordRepeat?.value || !this.agree?.value) {return}

        this.authService.signup(this.email.value, this.password.value, this.passwordRepeat.value).subscribe({
            next: (result: DefaultResponseType | LoginResponseType) => {
                const loginResponse: LoginResponseType = result as LoginResponseType
                let error: string | null = null
                if ((result as DefaultResponseType).error !== undefined) {
                    error = (result as DefaultResponseType).message
                }
                if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
                    error = 'Ошибка авторизации'
                }

                if (error) {
                    this._snackBar.open(error, 'Закрыть')
                    throw new Error(error)
                }

                this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken)
                this.authService.userId = loginResponse.userId
                this._snackBar.open('Вы успешно зарегистрировались!', 'Закрыть')
                this.router.navigate(['/'])
            },
            error: (errorResponse: HttpErrorResponse) => {
                if (errorResponse.error && errorResponse.error.message) {
                    this._snackBar.open(errorResponse.error.message, 'Закрыть')
                } else {
                    this._snackBar.open('Ошибка регистрации', 'Закрыть')
                }
            },
        })
    }
}
