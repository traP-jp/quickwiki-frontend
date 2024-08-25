import { defineStore } from 'pinia';

export const useUserStore = defineStore('uer', {
  state: () => ({
    traqId: "",
    name: "",
    iconUri: ""
  }),
  actions: {
    async setUser(){
      const response = await fetch("/api/me");
      if(response && response.ok){
        const user = await response.json();
        this.traqId = await user.traqId;
        this.name = await user.name;
        this.iconUri = await user.iconUri;
      }
    }
  }
});