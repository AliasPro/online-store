import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm = this.fb.group({
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.required]],
        rememberMe: [false],
    })

    get email() {return this.loginForm.get('email')}
    get password() {return this.loginForm.get('password')}
    get rememberMe() {return this.loginForm.get('rememberMe')}

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        private router: Router,
        ) {
    }

    ngOnInit(): void {
    }

    login(): void {
        if (this.loginForm.invalid || !this.email?.value || !this.password?.value) {return}

        this.authService.login(this.email.value, this.password.value, !!this.rememberMe?.value).subscribe({
            next: (result: DefaultResponseType | LoginResponseType) => {
                let error: string | null = null
                if ((result as DefaultResponseType).error !== undefined) {
                    error = (result as DefaultResponseType).message
                }

                const loginResponse: LoginResponseType = result as LoginResponseType
                if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
                    error = 'Ошибка авторизации'
                }

                if (error) {
                    this._snackBar.open(error, 'Закрыть')
                    throw new Error(error)
                }

                this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken)
                this.authService.userId = loginResponse.userId
                this._snackBar.open('Вы успешно авторизовались!', 'Закрыть')
                this.router.navigate(['/'])
            },
            error: (errorResponse: HttpErrorResponse) => {
                if (errorResponse.error && errorResponse.error.message) {
                    this._snackBar.open(errorResponse.error.message, 'Закрыть')
                } else {
                    this._snackBar.open('Ошибка авторизации', 'Закрыть')
                }
            },
        })
    }
}
