declare module 'path-parser' {
    class Path<T> {
        constructor(pathTemplate: string);
        test(path: string): T;
        build(params: T): string;
    }
    namespace Path {}
    export = Path;
}