import {RouteParams} from './state';
import {Route} from './route';

export interface VirtualRoute<P extends RouteParams, S> {
    href(args?: P): string;
    mapToRoute(route: Route<P, S>): void;
}

export function createVirtualRoute<P extends RouteParams, S>(): VirtualRoute<P, S> {
    let mappedRoute: Route<P, S>;
    function href(args?: P): string {
        if (!mappedRoute) {
            throw 'Virtual route not mapped to real route.';
        }
        return mappedRoute.href(args);
    }
    function mapToRoute(route: Route<P, S>): void {
        mappedRoute = route;
    }
    return {
        href,
        mapToRoute
    };
}
