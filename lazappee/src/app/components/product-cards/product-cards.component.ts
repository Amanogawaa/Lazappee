import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-product-cards',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './product-cards.component.html',
  styleUrl: './product-cards.component.css',
})
export class ProductCardsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
