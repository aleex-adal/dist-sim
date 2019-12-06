export default class node {

    constructor(id: number) {
        this.id = id;
    }

    id: number = 0;
    connections: number[] = [];
}