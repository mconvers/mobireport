import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReportsListComponent } from '../libs/signalements/signalements-layout/reports-list/reports-list.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReportsListComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
