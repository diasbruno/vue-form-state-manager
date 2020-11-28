function defaultOrNot(v) { return v.default || v; }

const Vue = defaultOrNot(require("vue"));

const majorVersion = /^(\d)/.exec(Vue.version)[1];

const vueNotSupported = (v) => {
  throw new Error(`Vue ${v} is not supported.`);
}

const vueNotImplemented = (v) => {
  throw new Error(`Vue ${v} is not supported.`);
}

const _vnodeInstance = {
  1: n => vueNotSupported("2<"), // n.componentInstance,
  2: n => n.context,
  3: () => vueNotImplemented("2>")
};
const vnodeInstance = _vnodeInstance[majorVersion];

const _vnodeValue = {
  1: n => vueNotSupported("2<"), // n.data.model.value
  2: n => n.data.domProps.value,
  3: () => vueNotImplemented("2>")
};
const vnodeValue = _vnodeValue[majorVersion];

const checkInputType = (e, t) => e.nodeName.toLowerCase() === t;
const isInput = e => checkInputType(e, "input");
const isForm = e => checkInputType(e,"form");

// End of DOM and Vue related stuff...

const formTable = {};
const formNodes = {};

function formFieldInit(formId, name, value) {
  !formNodes[formId] && (formNodes[formId] = new Set());
  formNodes[formId].add(name);
  formTable[name] = {
    form: formId,
    pristine: true,
    dirty: false,
    initialValue: value
  };
}

function formFieldUpdate(el, binding, vnode, pristine = true) {
  const { value: name } = binding;
  let current = formTable[name];
  current = (formTable[name] = {
    ...current,
    pristine,
    dirty: current.initialValue !== vnodeValue(vnode)
  });
}

module.exports = {
  formState(formId) {
    let state = { pristine: true, dirty: true };
    const nodeIds = formNodes[formId];
    for (let n of nodeIds) {
      const { pristine, dirty } = formTable[n];
      state.pristine = state.pristine && pristine;
      state.dirty = state.dirty && dirty;
    }
    return state;
  },
  formIsDirty(formId) {
    return this.formState(formId).isDirty;
  },
  formIsPristine(formId) {
    return this.formState(formId).pristine;
  },
  bind(el, binding, vnode) {
    let self = this;
    let { tag } = vnode;
    let target = el;

    const updater = event => formFieldUpdate(el, binding, vnode, false);

    el.addEventListener('blur', updater, false);
    el.addEventListener('focus', updater, false);

    const vm = vnodeInstance(vnode, binding);

    if (vm) {
      vm.$on('blur', updater);
      vm.$on('focus', updater);
    }
  },
  update(el, binding, vnode) {
    const { value: name } = binding;
    let { pristine } = formTable[name];
    formFieldUpdate(el, binding, vnode, pristine);
  },
  unbind(el, binding, vnode) {
    const { value: name } = binding;
    const { form } = formTable[name];
    formNodes[form].delete(name);
    delete formTable[name];
  },
  inserted(el, binding, vnode) {
    const { value: name } = binding;
    let form = el;
    while (
      (form = form.parentNode),
      (!isForm(form) && form != document.body)
    );
    formFieldInit(form.id, name, vnodeValue(vnode));
  }
};
