import { Routes } from '@angular/router';
import { NavbarComponent } from './module/user/component/navbar/navbar.component';
import { UserComponent } from './module/user/user.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'user',
    pathMatch: 'full',
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
