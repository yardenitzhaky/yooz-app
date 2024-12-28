// src/app/references/references.module.ts

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { REFERENCES_ROUTES } from './references.routes';

@NgModule({
  imports: [
    RouterModule.forChild(REFERENCES_ROUTES)
  ]
})
export class ReferencesModule { }