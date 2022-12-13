import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TreoAnimations } from '@treo/animations';
import { AppService } from 'app/app.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector     : 'auth-forgot-password',
    templateUrl  : './forgot-password.component.html',
    styleUrls    : ['./forgot-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : TreoAnimations
})
export class AuthForgotPasswordComponent implements OnInit
{
    forgotPasswordForm: FormGroup;
    message: any;
    codeView = false;
    errors = false;

    /**
     * Constructor
     *
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _authService: AuthService
    )
    {
        // Set the defaults
        this.message = null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            code: ['', [Validators.required,]],
            password: ['', [Validators.required,]]
        });

        this.forgotPasswordForm.markAllAsTouched();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Send the reset link
     */
    sendResetLink(): void
    {        
        // Do nothing if the form is invalid
        if ( this.forgotPasswordForm.get('email').hasError('required') )
        {
            console.log("invalid");
            
            return;
        }

        // Disable the form
        this.forgotPasswordForm.disable();

        // Hide the message
        this.message = null;

        // Do your action here...
        let result = this._authService.forgotPassword(this.forgotPasswordForm.get('email').value);

        // Emulate server delay
        setTimeout(() => {
            result.then(res => {
                console.log(res);                                
                if(!res['status']){ //an error occured
                    console.log("effective error");
                    this.message = {
                        appearance: 'outline',
                        //content   : res['error']['message'],
                        content   : "An error occured", // avoid side-channel attack
                        shake     : false,
                        showIcon  : false,
                        type      : 'error'
                    };
                    this.errors = true;
                } else {
                    this.message = {
                        appearance: 'outline',
                        content   : "Verification code sent! You\'ll receive an email if you are registered on our system.",
                        shake     : false,
                        showIcon  : false,
                        type      : 'success'
                    };
                }
            });

            // Re-enable the form
            this.forgotPasswordForm.enable();

            // Reset the form
            this.forgotPasswordForm.reset({});
            this.forgotPasswordForm.markAllAsTouched();

            // Show the message
            // this.message = {
            //     appearance: 'outline',
            //     content   : messageContent,
            //     shake     : false,
            //     showIcon  : false,
            //     type      : messageType
            // };

            this.codeView = true;
            console.log(this.codeView);
            
        }, 1000);

    }

    sendConfirmPassword(): void
    {        
        // Do nothing if the form is invalid
        if ( this.forgotPasswordForm.get('code').hasError('required') || 
             this.forgotPasswordForm.get('password').hasError('required') ||
             this.forgotPasswordForm.get('email').hasError('required') )
        {            
            return;
        }

        if(!this.checkPassword()){

            // Disable the form
            this.forgotPasswordForm.disable();

            // Hide the message
            this.message = null;

            // Do your action here...
            let result = this._authService.resetConfirmPassword(
                this.forgotPasswordForm.get('email').value, 
                this.forgotPasswordForm.get('code').value, 
                this.forgotPasswordForm.get('password').value
            );

            // Emulate server delay
            setTimeout(() => {

                result.then(r => {
                    console.log(r); 
                    if(!r['status']){ // an error occrurs
                        this.message = {
                            appearance: 'outline',
                            content   : "An error occurred",
                            shake     : false,
                            showIcon  : false,
                            type      : 'error'
                        };
            
                    } else {
                        this.message = {
                            appearance: 'outline',
                            content   : 'Password changed correcly.',
                            shake     : false,
                            showIcon  : false,
                            type      : 'success'
                        };     
                    }
        
                })

                // Re-enable the form
                this.forgotPasswordForm.enable();

                // Reset the form
                this.forgotPasswordForm.reset({});

                this.codeView = true;
                console.log(this.codeView);
                
            }, 1000);
        } else {
            this.message = {
                appearance: 'outline',
                content   : 'Password must contain at least 6 characters with at lease 1 uppercase and 1 number.',
                shake     : false,
                showIcon  : false,
                type      : 'error'
            }; 
        }
    }


    checkPassword(): boolean{
        let pw = this.forgotPasswordForm.get('password').value;
        if(pw){
            return !this.forgotPasswordForm.get('password').value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])\S{6,99}$/g);
        }
        return false;        
    }
}
