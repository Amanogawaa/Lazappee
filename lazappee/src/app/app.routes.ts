import { Routes } from '@angular/router';
import { NavbarComponent } from './module/user/component/navbar/navbar.component';
import { UserComponent } from './module/user/user.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'signup',
    component: SignupComponent,
  },

  {
    path: 'user',
    component: UserComponent,
    children: [
      {
        path: '',
        redirectTo: 'product-page',
        pathMatch: 'full',
      },

      {
        path: 'product-page',
        loadComponent: () =>
          import(
            './module/user/pages/product-page/product-page.component'
          ).then((e) => e.ProductPageComponent),
      },

      {
        path: 'product-detail/:id',
        loadComponent: () =>
          import(
            './module/user/pages/product-details/product-details.component'
          ).then((e) => e.ProductDetailsComponent),
      },

      {
        path: 'mysummary-page',
        loadComponent: () =>
          import(
            './module/user/pages/mysummary-page/mysummary-page.component'
          ).then((e) => e.MysummaryPageComponent),
      },

      {
        path: 'myorder-page',
        loadComponent: () =>
          import(
            './module/user/pages/myorder-page/myorder-page.component'
          ).then((e) => e.MyorderPageComponent),
      },

      {
        path: 'mycart-page',
        loadComponent: () =>
          import('./module/user/pages/mycart-page/mycart-page.component').then(
            (e) => e.MycartPageComponent
          ),
      },
    ],
  },
];
