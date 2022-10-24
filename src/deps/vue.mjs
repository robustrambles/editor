export { createApp, ref, reactive, h, watchEffect, watch } from 'https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.prod.js'

export const mapRefs = (refs) => {
    const mappedRefs = {};
    for ( const refName in refs) {
        mappedRefs[refName] = () => refs[refName].value;
    }
    return mappedRefs;
}