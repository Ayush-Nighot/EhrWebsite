import { Routes } from '@angular/router';
import { RegisterLoginComponent } from './Components/register-login/register-login.component';
import { VerifyOtpComponent } from './Components/verify-otp/verify-otp.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { ProviderComponent } from './Components/provider/provider.component';
import { PatientComponent } from './Components/patient/patient.component';
import { ProfilesComponentComponent } from './Components/profiles-component/profiles-component.component';
import { ChangepasswordComponent } from './Components/changepassword/changepassword.component';
import { AddAppointmentComponent } from './Components/add-appointment/add-appointment.component';
import { ForgetPasswordComponent } from './Components/forget-password/forget-password.component';
import { CanceledComponent } from './Components/canceled/canceled.component';
import { CompletedComponent } from './Components/completed/completed.component';
import { AddAppPrComponent } from './Components/add-app-pr/add-app-pr.component';
import { CompletedPatComponent } from './Components/completed-pat/completed-pat.component';
import { providerGuard } from './Services/guards/provider.guard';
import { patientGuard } from './Services/guards/patient.guard';
import { ErrorComponent } from './Components/error/error.component';
import { ChatComponent } from './Components/chat/chat.component';

export const routes: Routes = [
    {
        path: "",
        redirectTo: "login",
        pathMatch: 'full'
    },
    {
        path: "login",
        component: RegisterLoginComponent
    },
    {
        path: "forget-password",
        component: ForgetPasswordComponent
    },
    {
        path: "verify-otp",
        component: VerifyOtpComponent
    },

    {
        path: "",
        component: LayoutComponent,
        children: [

            {
                path: 'chats',
                component: ChatComponent
            },
            {
                path: "provider",
                canActivate: [providerGuard],
                component: ProviderComponent
            },
            {
                path: "patient",
                canActivate: [patientGuard],
                component: PatientComponent
            },
            {
                path: "profile",
                component: ProfilesComponentComponent
            },
            {
                path: "changepass",
                component: ChangepasswordComponent
            },
            {
                path: "add-appointment",
                component: AddAppointmentComponent
            },
            {
                path: 'canceled',
                component: CanceledComponent
            }, {
                path: 'completed',
                component: CompletedComponent
            },
            {
                path: 'appointmentpr',
                component: AddAppPrComponent
            },
            {
                path: 'completedpt',
                component: CompletedPatComponent
            },

            {
                path: '**',
                component: ErrorComponent
            }

        ]
    }
];
