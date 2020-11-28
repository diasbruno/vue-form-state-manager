# vue-form-state-manager

A simple form state manager that can be used as directive.

## usage

To register:

```vue
import FormState from "vue-form-state-manager";
Vue.directive('form-control', FormState);
```

Use:

```vue
<input ... form-control="'field_name'" />
```

Checking the form state:

```js
import { formState, formIsDirty, formIsPristine } from "vue-form-state-manager";

formState(formId) == { dirty: Boolean, pristine: Boolean };
formState(formId).dirty == formIsDirty(formId);
formState(formId).pristine == formIsPristine(formId);
```

Reseting a single input:

```js
export default {
  name: "MyComp",
  ...
  methods: {
    myMethod() {
      this.prop = NEW_VALUE;
      resetInitialValueFor("test-form", "field-name", this.prop);
    }
  },
  ...
}
```

## roadmap

- [x] API to control the state programmatically.

## licence

MIT