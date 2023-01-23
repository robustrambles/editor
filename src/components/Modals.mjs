import { reactive, h } from "../deps/vue.mjs";

const modals = reactive(new Map());
const closers = reactive(new Map());
export const spawnModal = async (modalComponent, props = {}) => {
    const uid = Date.now();
    const component = h(modalComponent, props);
    modals.set(uid, component);
    let closer = null;
    const promise = new Promise((resolve) => closer = resolve);
    closers.set(uid, closer);
    const response = await promise;
    modals.delete(uid);
    closers.delete(uid);
    return response;
};

const closeModal = (uid, payload) => {
    const closer = closers.get(uid);
    if (!closer) return;
    closer(payload);
};

export default {
    data: () => ({ modals }),
    template: /* html */`<component v-for="([uid, modal]) in modals" :is="modal" :show="true" @submit="(payload) => closeModal(uid, payload)" @update:show="(value) => !value && closeModal(uid)" />`,
    methods: {
        closeModal,
    }
}