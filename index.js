const formTable = {};
const formNodes = {};

function isInput(el) {
  return el.nodeName.toLowerCase() === "input";
}

function isForm(el) {
  return el.nodeName.toLowerCase() === "form";
}

function vnodeValue(node) {
  return node.data.model.value;
}

function formUpdate(el, binding, vnode, pristine = true) {
  let current = formTable[vnode.tag];
  current = (formTable[vnode.tag] = {
    ...current,
    pristine,
    dirty: current.initialValue !== vnodeValue(vnode)
  });
}

export function formState(formId) {
  let state = { pristine: true, dirty: true };
  const nodeIds = formNodes[formId];
  for (let n of nodeIds) {
    const { pristine, dirty } = formTable[n];
    state.pristine = state.pristine && pristine;
    state.dirty = state.dirty && dirty;
  }
  return state;
}

export function formIsDirty(formId) {
  return formState(formId).isDirty;
}

export function formIsPristine(formId) {
  return formState(formId).pristine;
}

export default {
  bind(el, binding, vnode) {
    let self = this;
    let { tag } = vnode;
    let target = el;

    const vm = vnode.componentInstance;
    if (vm) {
      const updater = () => formUpdate(el, binding, vnode, false);
      vm.$on('blur', updater);
      vm.$on('focus', updater);
    }
  },
  update(el, binding, vnode) {
    let { pristine } = formTable[vnode.tag];
    formUpdate(el, binding, vnode, pristine);
  },
  unbind(el, binding, vnode) {
    const { form } = formTable[vnode.tag];
    formNodes[form].delete(vnode.tag);
    delete formTable[vnode.tag];
  },
  inserted(el, binding, vnode) {
    let form = el;
    while (
      (form = form.parentNode),
      (!isForm(form) && form != document.body)
    );
    let formId = form.id;
    !formNodes[formId] && (formNodes[formId] = new Set());
    formNodes[formId].add(vnode.tag);
    formTable[vnode.tag] = {
      form: formId,
      pristine: true,
      dirty: false,
      initialValue: vnodeValue(vnode)
    };
  }
};
