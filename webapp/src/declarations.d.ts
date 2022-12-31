interface WorldMap {
    width: number;
    height: number;
    data: boolean[][];
}

declare module "*.map.json" {
    const content: WorldMap;
    export default content;
}
