import DataRange from "./DataRange";

export default class payload {
    id: number = -1;
    msg?: string;
    item?: any;
    path?: number[];
    pathIndex?: number;
    op?: string;
    itemId?: number;
    newRange?: DataRange;
    dir?: string;
}