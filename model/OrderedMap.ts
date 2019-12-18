import DataRange from "./DataRange";

export default class OrderedMap {
    map: Map<number, DataRange> = new Map();
    keysInOrder: number[] = [];

    set(num: number, dRange: DataRange): void {

        // only push and re-sort if creating new map entry
        if (!this.map.has(num)) {
            this.keysInOrder.push(num);
            this.keysInOrder.sort((a, b) => a - b); // TODO: push to correct index so sort is unneccesary
        }

        this.map.set(num, dRange);
    }

    get(num: number): DataRange {
        return this.map.get(num);
    }

    delete(num: number): boolean {
        let delIndex = undefined;
        for (let i = 0; i < this.keysInOrder.length; i++) {
            if (this.keysInOrder[i] === num) {
                delIndex = i;
                break;
            }
        }
        if (delIndex !== undefined) {
            this.keysInOrder.splice(delIndex, 1);
        }
        // TODO: do the above in a better way

        return this.map.delete(num);
    }
}