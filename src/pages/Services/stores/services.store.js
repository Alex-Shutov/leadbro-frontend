import { makeAutoObservable, action, observable } from "mobx";
import { isId } from "../../../utils/is.type";
import {
    changeDraft,
    removeDraft,
    resetDraft,
    updateDraftObject,
    updateObjectRecursively
} from "../../../utils/store.utils";

export class ServicesStore {
    services = [];
    serviceTypes = [];
    drafts = {};

    constructor(root) {
        this.root = root;
        makeAutoObservable(this);
    }

    getServices() {
        return this.services.map(service => {
            const draft = this.drafts[service.id];
            return draft ? { ...service, ...draft } : service;
        });
    }

    getById(id,isReset=false) {
        const service = this.services.find(x => x.id === Number(id));
        const draft = this.drafts[id];
        return isReset ? service :  draft ? { ...service, ...draft } : service;
    }

    resetDraft(id, path) {
        if (!this.drafts[id]) return;
        let service = this.getById(id,true   );

        resetDraft(this,id,service,path)

    }

    submitDraft(id) {
        if (!this.drafts[id]) return;

        const service = this.getById(id);
        if (!service) return;

        const updatedClient = { ...service };
        this.services = this.services.map(c => (c.id === id ? updatedClient : c));
        delete this.drafts[id];
    }

    createDraft(id) {
        const service = this.getById(id);
        if (!service) return;

        this.drafts[id] = { ...service };
    }

    changeById(id, path, value,withId) {
        if (!this.drafts[id]) {
            this.createDraft(id);
        }
        let draft = this.drafts[id];
        changeDraft(this,id,draft,path,value,withId)
    }

    removeById(id, path) {
        if (!this.drafts[id]) {
            this.createDraft(id);
        }

        removeDraft(this, id, path);
    }

    setServices(result) {
        this.services = result;
    }
    
    setServiceTypes(result){
        this.serviceTypes = result
    }

    getServiceTypes(){
        return this.serviceTypes.map(serviceType => {
            const draft = this.drafts[serviceType.id];
            return draft ? { ...serviceType, ...draft } : serviceType;
        });
    }
}