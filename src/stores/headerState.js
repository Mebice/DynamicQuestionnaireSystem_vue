import { defineStore } from "pinia";
import { Transition } from "vue";

export default defineStore("headerState", {
    state: () => ({
        headerColor: Transition,
        headerText: "",
    }),
    actions: {
        updateHeaderColor(color) {
        this.headerColor = color;
        },
        updateHeaderText(text) {
            this.headerText = text; 
        },
    },
});