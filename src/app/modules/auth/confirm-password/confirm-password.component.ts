import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { TreoAnimations } from '@treo/animations';
import { TreoValidators } from '@treo/validators';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-confirm-password',
    templateUrl: './confirm-password.component.html',
    styleUrls: ['./confirm-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: TreoAnimations
})
export class AuthConfirmPasswordComponent implements OnInit, OnDestroy {
    message: any;
    confirmPasswordForm: FormGroup;


    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _authService: AuthService,
    ) {
        // Set the defaults
        this.message = null;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.confirmPasswordForm = this._formBuilder.group({
            password: [''],
            passwordConfirm: ['']
        },
            {
                validators: [
                    TreoValidators.mustMatch('password', 'passwordConfirm'),
                    //CustomPasswordValidator.pswValidator(this, "password"),
                    //CustomPasswordValidator.pswValidator(this, "passwordConfirm"),
                ]
            }
        );
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Confirm password
     */
    confirmPassword(): void {
        let password : string = this.confirmPasswordForm.get('passwordConfirm').value;
        // Hide the message
        this.message = null;

        if (this.confirmPasswordForm.invalid) {
            console.log("form invalid")
            return;
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])\S{6,99}$/g)){//password.length < 6 || !(/\d/.test(password) || !(password.replace(/[^A-Z]/g, "").length > 1))) {
            let errorName = "Password should have at least one uppercase character, at least one number and minimum 6 character"
            this.message = {
                appearance: 'outline',
                content: errorName,
                shake: true,
                showIcon: false,
                type: 'error'
            };
            return;
        }
        // Disable the form
        this.confirmPasswordForm.disable();
        this._authService.confirmPassword(password).subscribe(res => {
                if(res){
                    this.message = {
                        appearance: 'outline',
                        content: 'Your password has been confirm. you will be redirect to the main page',
                        shake: false,
                        showIcon: false,
                        type: 'success'
                    };
                    setTimeout(() => {
                        // Navigate to the sign-i
                        this._router.navigate(['/sign-in']);
                    }, 1000);
                }
                else{
                    this.confirmPasswordForm.enable();

                        // Show the error message
                        this.message = {
                            appearance: 'outline',
                            content: "There was an error, try again",
                            shake: true,
                            showIcon: false,
                            type: 'error'
                        };
                }
            });
            // }, (response) => {

            //     console.log("response")
            //     // Re-enable the form
            //     this.confirmPasswordForm.enable();

            //     // Show the error message
            //     this.message = {
            //         appearance: 'outline',
            //         content: response.error,
            //         shake: true,
            //         showIcon: false,
            //         type: 'error'
            //     };
            // });
    }
}






export class CustomPasswordValidator {
    static pswValidator(controller: any, groupField: string): ValidatorFn {
        return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
            let control = formGroup.get(groupField);
            let string: string = control.value;
            if (!string) {
                controller.message = {
                    appearance: 'outline',
                    content: "Password is required",
                    shake: true,
                    showIcon: false,
                    type: 'error'
                };
                return null;
            }
            if (!string.match("/(?=.*[A-Z])(?=.*[0-9])/g")) {//|| string.length < 6 || !(/\d/.test(string) || !(string.replace(/[^A-Z]/g, "").length > 1))) {
                control.setErrors({ 'incorrect': true })
                let errorName = "Password should have at least one uppercase character, at least one number and minimum 6 character"
                controller.message = {
                    appearance: 'outline',
                    content: errorName,
                    shake: true,
                    showIcon: false,
                    type: 'error'
                };
                return { [errorName]: true };
            }
            else {
                controller.message = {
                    appearance: 'outline',
                    content: "",
                    shake: true,
                    showIcon: false,
                    type: 'error'
                };
                return null;
            }
        };
    }
}
