// NOTE: we combine all testing libraries
// because @testing-library/vue don't/'seems to not'
// expose the wrapper.
const Vue = require("vue");

const {
  createLocalVue, mount
} = require("@vue/test-utils");
const {
  fireEvent
} = require("@testing-library/vue");
const {
  getQueriesForElement
} = require("@testing-library/dom");

const {
  formState, formIsDirty, formIsPristine,
  resetInitialValueFor
} = require("../index.js");

Vue.directive("form-control", require("../index.js"));

const render = (options) => {
  return mount({
    template: `
<form id="test-form">
  <label for="i">input</label>
  <input id="i" v-model="m" v-form-control="'field'" />
</form>
`
  }, {
    vue: createLocalVue(),
    ...options
  });
};

test('initialize form state', async () => {
  render(
    { data() { return { m: "" } } }
  );
  expect(
    formState("test-form")
  ).toStrictEqual({ dirty: false, pristine: true });
});

test('make the form as not pristine on focus.', async () => {
  const wrapper = render(
    { data() { return { m: "" } } }
  );

  const { getByLabelText } = getQueriesForElement(wrapper.element);

  const input = getByLabelText(/input/i);
  await fireEvent.focus(input)

  expect(
    formState("test-form")
  ).toStrictEqual({ dirty: false, pristine: false });
});

test('make the form dirty.', async () => {
  const wrapper = render(
    { data() { return { m: "" } } }
  );

  const { getByLabelText } = getQueriesForElement(wrapper.element);

  const input = getByLabelText(/input/i);
  await fireEvent.focus(input);
  await fireEvent.update(input, '1');

  expect(
    formState("test-form")
  ).toStrictEqual({ dirty: true, pristine: false });
});

test('reset the initial value.', async () => {
  const wrapper = render(
    { data() { return { m: "" } } }
  );

  const { getByLabelText } = getQueriesForElement(wrapper.element);

  const input = getByLabelText(/input/i);
  await fireEvent.focus(input);
  await fireEvent.update(input, "1");

  resetInitialValueFor("test-form", "field", "2");
  await wrapper.setData({ m: "2" });

  expect(
    formState("test-form")
  ).toStrictEqual({ dirty: false, pristine: true });
});
