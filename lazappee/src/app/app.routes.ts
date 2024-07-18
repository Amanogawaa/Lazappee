import { Routes } from '@angular/router';
import { HomapgeComponent } from './components/homapge/homapge.component';
import { UserComponent } from './module/user/user.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./components/registration/registration.component').then(
        (c) => c.RegistrationComponent
      ),
  },

  {
    path: 'lazappee',
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
