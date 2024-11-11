import { makeAutoObservable, action, observable } from 'mobx';
import {
    changeDraft,
    removeDraft,
    resetDraft,
    updateDraftObject,
    updateObjectRecursively,
} from '../../../utils/store.utils';

export class DealsStore {
    deals = [];
    drafts = {};
    dealStatuses = null;
    currentDeal = null
    metaInfoTable = {};
    changedProps = new Set();

    constructor(root) {
        this.root = root;
        makeAutoObservable(this);
    }

    getDeals() {
        return this.deals.map((deal) => {
            const draft = this.drafts[deal.id];
            return draft ? { ...deal, ...draft } : deal;
        });
    }

    getById(id, isReset = false) {
        const deal = this.currentDeal ||  this.deals.find((x) => x.id === Number(id));
        const draft = this.drafts[id];
        return isReset ? deal : draft ? { ...deal, ...draft } : deal;
    }

    resetDraft(id, path) {
        if (!this.drafts[id]) return;
        let deal = this.getById(id, true);

        resetDraft(this, id, deal, path);
    }

    submitDraft(id) {
        if (!this.drafts[id]) return;

        const deal = this.getById(id);
        if (!deal) return;

        const updatedDeal = { ...deal };
        this.deals = this.deals.map((c) => (c.id === id ? updatedDeal : c));
        delete this.drafts[id];
        this.clearChangesSet();
    }

    createDraft(id) {
        const deal = this.getById(id);
        if (!deal) return;

        this.drafts[id] = { ...deal };
    }

    changeById(id, path, value, withId) {
        if (!this.drafts[id]) {
            this.createDraft(id);
        }

        let draft = this.drafts[id];
        this.addChangesProps(path);
        changeDraft(this, id, draft, path, value, withId);
    }

    removeById(id, path) {
        if (!this.drafts[id]) {
            this.createDraft(id);
        }

        removeDraft(this, id, path);
    }

    setDeals(result) {
        this.deals = result;
    }
    setStatuses(result) {
        this.dealStatuses = result;
    }

    setMetaInfoTable(info) {
        this.metaInfoTable = info;
    }

    getMetaInfoTable() {
        return this.metaInfoTable;
    }
    getStatuses() {
        return this.dealStatuses;
    }

    setCurrentDeal(deal) {
        this.currentDeal = deal;
    }

    addChangesProps(name) {
        this.changedProps.add(name);
    }

    clearChangesSet() {
        this.changedProps = new Set();
    }
}
