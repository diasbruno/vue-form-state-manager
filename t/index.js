const Vue = require("vue");
const { render, fireEvent } = require("@testing-library/vue");

const {
  formState, formIsDirty, formIsPristine
} = require("../index.js");

Vue.directive("form-control", require("../index.js"));

const C = Vue.component("Dummy", {
  data() {
    return { m: "" }
  },
  template: `
<form id="test-form">
  <label for="i">input</label>
  <input id="i" v-model="m" v-form-control />
</form>
`
});

test('initialize form state', async () => {
  const { getByLabelText, getByText } = render(C);

  expect(
    formState("test-form")
  ).toStrictEqual({ dirty: false, pristine: true });
});

test('make the form as not pristine on focus.', async () => {
  const { getByLabelText } = render(C);

  const input = getByLabelText(/input/i);
  await fireEvent.focus(input)

  expect(
    formState("test-form")
  ).toStrictEqual({ dirty: false, pristine: false });
});

test('make the form dirty.', async () => {
  const { getByLabelText } = render(C);

  const input = getByLabelText(/input/i);
  await fireEvent.focus(input)

  await fireEvent.update(input, '1');

  expect(
    formState("test-form")
  ).toStrictEqual({ dirty: true, pristine: false });
});
