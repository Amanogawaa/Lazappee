import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products-cards',
    pathMatch: 'full',
  },

  {
    path: 'products-cards',
    loadComponent: () =>
      import('./components/product-cards/product-cards.component').then(
        (c) => c.ProductCardsComponent
      ),
  },
];
