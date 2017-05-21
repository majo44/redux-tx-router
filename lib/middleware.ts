import {Dispatch, MiddlewareAPI} from 'redux';
import {InternalRouter} from './router';

export function createRouterMiddleware<S>(router: InternalRouter<S>) {
    return function routerMiddleware(api: MiddlewareAPI<S>): (next: Dispatch<S>) => Dispatch<S> {
        return (next: Dispatch<S>): Dispatch<S> => {
            return (action: any): any  => {
                if (typeof action === 'function' && action.$$requireRouter) {
                    return action(api.dispatch, api.getState, router);
                } else {
                    return next(action);
                }
            };
        };
    };
}
