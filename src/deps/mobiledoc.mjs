export { Editor } from 'https://unpkg.com/mobiledoc-kit@0.15.0/dist/mobiledoc.js';

export const LATEST_MOBILEDOC_VERSION = '0.3.2';

export const EMPTY_MOBILEDOC = {
    version: LATEST_MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [],
    sections: [[1, 'p', []]],
};

export const createMobiledocFromString = (str) => ({
    version: LATEST_MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [],
    sections: [[1, 'p', [[ 0, [], 0, str ]]]],
});