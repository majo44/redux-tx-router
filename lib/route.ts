import * as Path from 'path-parser';
import {RouteParams} from './state';
import {Dispatch} from 'redux';

export interface Route<P extends RouteParams, S> {
    readonly name: string;
    before: (args: P, dispatch: Dispatch<S>, getState: () => S) => | void | Promise<void>;
    href(args?: P): string;
    match(path: string): P;
}

export function createRoute<P extends RouteParams, S>(
    name: string,
    path: string,
    before?: (args: P, dispatch: Dispatch<S>, getState: () => S) => | void | Promise<void>): Route<P, S> {

    let pathBuilder = new Path<P>(path);
    function href(args?: P): string {
        return pathBuilder.build(args);
    }
    function match(pathToTest: string): P {
        return pathBuilder.test(pathToTest);
    }
    return {
        name,
        match,
        href,
        before
    };
}

export function reduceRoute<P extends RouteParams, S1, S2>(route: Route<P, S1>, reducer: (state: S2) => S1): Route<P, S2> {
    let result: Route<P, S2> = {
        name: route.name,
        href: route.href.bind(route),
        match: route.match.bind(route),
        before: undefined
    };
    if (route.before) {
        result.before = (args: P, dispatch: Dispatch<any>, getState: () => S2) => {
            return route.before(args, dispatch, () => reducer(getState()));
        };
    }
    return result;
}
