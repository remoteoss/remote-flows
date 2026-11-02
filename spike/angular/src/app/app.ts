import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { SIMPLE_USER_PROFILE_SCHEMA } from '../../../../example/src/flows/JsonSchemaPlayground/schemas/simpleUserProfile';
import { FieldOutlet } from './field-outlet';
import { createFormStore } from './form-store';

@Component({
  selector: 'app-root',
  imports: [FieldOutlet, JsonPipe],
  templateUrl: './app.html',
})
export class App {
  protected readonly name = SIMPLE_USER_PROFILE_SCHEMA.name;
  protected readonly store = createFormStore(SIMPLE_USER_PROFILE_SCHEMA.schema);

  protected onSubmit(event: Event) {
    event.preventDefault();
    void this.store.submit();
  }
}
