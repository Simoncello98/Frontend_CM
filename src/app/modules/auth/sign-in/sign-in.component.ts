import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TreoAnimations } from '@treo/animations';
import { AuthService, AuthStates } from 'app/core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CognitoError } from 'app/core/auth/auth.types';
import { AuthorizationService } from 'app/core/navigation/navigation.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: TreoAnimations
})
export class AuthSignInComponent implements OnInit {
    signInForm: FormGroup;
    message: any;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {AuthService} _authService
     * @param {FormBuilder} _formBuilder
     * @param {Router} _router
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _authorizationService: AuthorizationService
    ) {
        // Set the defaults
        this.message = null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required],
            rememberMe: ['']
        });
    }

    fixAutoFill(event: any, type: 'email' | 'password') {
        const value = event.target.value;
        this.signInForm.get(type).setValue(value, { emitEvent: true, onlySelf: false });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        if (!this.signInForm.valid) return; //do nothing with empty email or pw 

        // Disable the form
        this.signInForm.disable();

        // Hide the message
        this.message = null;

        // Get the credentials
        const credentials = this.signInForm.value;
        this.formatCredentials(credentials);

        // Sign in
        this._authService.signIn(credentials)
            .subscribe((result: AuthStates | CognitoError) => {
                if ((result as CognitoError).message) {
                    this.signInForm.enable();
                    // Show the error message
                    this.message = {
                        appearance: 'outline',
                        content: "Incorrect username or password.",
                        shake: true,
                        showIcon: false,
                        type: 'error'
                    };
                    return;
                }
                switch (result) {
                    case AuthStates.Logged:
                        // Set the redirect url.
                        // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                        // to the correct page after a successful sign in. This way, that url can be set via
                        // routing file and we don't have to touch here.
                        this._authorizationService.getHomepagePath().then(homepage => {
                            if (homepage) this._router.navigateByUrl("/" + homepage);
                            else {
                                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/default-signed-in-redirect';
                                // Navigate to the redirect url
                                this._router.navigateByUrl(redirectURL);
                            }
                        })


                        // this._router.navigate(["../", "users"], { relativeTo: this._activatedRoute });
                        break;
                    case AuthStates.NewPasswordRequired:
                    default:
                        this._router.navigate(['/confirm-password']);
                        break;
                }
            })

        /*, (response) => {

            console.log("resp: ")
            console.log(JSON.stringify(response))

            // Re-enable the form
            this.signInForm.enable();

            // Show the error message
            this.message = {
                appearance: 'outline',
                content: response.error,
                shake: true,
                showIcon: false,
                type: 'error'
            };
        });*/
    }

    // email to lowercase
    formatCredentials(credentials) {
        if (credentials.email) {
            credentials.email = credentials.email.toLowerCase();
            credentials.email = credentials.email.replace(/\s/g, "");
        }
    }
}
