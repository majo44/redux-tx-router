
export type RouteParams = {
} | void;

export interface RouteState {
    readonly name: string;
    readonly url: string;
    readonly path: string;
    readonly search?: string;
    readonly hash?: string;
    readonly params?: RouteParams;
}

export interface RoutingState {
    currentRoute?: RouteState;
    nextRoute?: RouteState;
}
