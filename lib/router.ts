import {Dispatch, MiddlewareAPI, Reducer} from 'redux';
import {RouteParams, RoutingState, RouteState as StateRoute} from './state';
import {Route} from './route';
import {routingReducer} from './reducer';
import {createRouterMiddleware} from './middleware';
import {transaction, TransactionPromise} from 'redux-tx';
import {
    canceledNavigationAction, endNavigationAction, endRedirectionAction, failedNavigationAction, redirectionAction,
    startNavigationAction
} from './actions';

export interface InternalRouter<S> {
    navigate(url: string, dispatch: Dispatch<S>, getState: () => S): Promise<boolean>;
}

export interface Router<S> {
    createReducer(): Reducer<RoutingState>;
    createMiddleware(): <S>(api: MiddlewareAPI<S>) => (next: Dispatch<S>) => Dispatch<S>;
}

export function createRouter<S>(
    routesList: Array<Route<any, S>>,
    otherwise: string): Router<S> {

    return {
        createReducer: () => routingReducer,
        createMiddleware: () => {
            return createRouterMiddleware<S>({
                navigate: createNavigation(routesList, otherwise)
            });
        }
    };
}

export function createNavigation<S>(routesList: Array<Route<any, S>>, otherwise: string):
    (url: string, dispatch: Dispatch<S>, getState: () => S) => Promise<boolean> {

    let tx: TransactionPromise;
    let dispatchInNavigateTransaction: boolean;

    return async function navigate(url: string, dispatch: Dispatch<S>, getState: () => S): Promise<boolean> {

        let nestedNavigation = dispatchInNavigateTransaction;

        if (tx && tx.state === 'PENDING' && !nestedNavigation) {
            dispatch(canceledNavigationAction(url));
            tx.cancel();
        }

        let {route, state} = findRoute(url, routesList, otherwise);

        let myTx = transaction('navigation', dispatch, async () => {
            if (nestedNavigation) {
                dispatch(redirectionAction(url, state));
            } else {
                dispatch(startNavigationAction(url, state));
            }
            try {
                if (route.before) {
                    await route.before(
                        state.params,
                        function() {
                            dispatchInNavigateTransaction = true;
                            let res = dispatch.apply(null, arguments);
                            dispatchInNavigateTransaction = false;
                            return res;
                        },
                        getState);
                }
                if (!myTx || myTx.state !== 'CANCELLED') {
                    if (!nestedNavigation) {
                        dispatch(endNavigationAction(url));
                    } else {
                        dispatch(endRedirectionAction(url));
                    }
                }
            } catch (ex) {
                if (!myTx || myTx.state !== 'CANCELLED') {
                    if (!nestedNavigation) {
                        dispatch(failedNavigationAction(url));
                    }
                    throw ex;
                }
            }
        });
        tx = myTx;
        await myTx;
        return myTx.state === 'COMMITED';
    };
}

export function findRoute<S>(url: string, routesList: Array<Route<any, S>>, otherwise: string):
    {route: Route<any, S>, state: StateRoute} {

    let {path, search, hash, uriWithoutHash} = parseUrl(url);
    let route;
    let params: RouteParams;
    for (let i = 0; i < routesList.length; i++) {
        params = routesList[i].match(uriWithoutHash);
        if (params) {
            route = routesList[i];
            break;
        }
    }
    if (!route) {
        if (url !== otherwise) {
            return findRoute(otherwise, routesList, otherwise);
        } else {
            throw 'Otherwise url not match any route. Set proper otherwise url on router.';
        }
    } else {
        return {
            route,
            state: {
                name: route.name,
                params: params,
                url, path, search, hash,
            }
        };
    }
}

export function parseUrl(url: string): {path: string, search: string, hash: string, uriWithoutHash: string} {
    let uriWithoutHash: string;
    let hash: string;
    let search: string;
    let path: string;

    // taking hash from path
    if (url.indexOf('#') > 0) {
        uriWithoutHash = url.split('#')[0];
        hash = url.split('#')[1];
    } else {
        uriWithoutHash = url;
    }

    if (uriWithoutHash.indexOf('?') > 0) {
        search = uriWithoutHash.split('?')[1];
        path = uriWithoutHash.split('?')[0];
    } else {
        path = uriWithoutHash;
    }

    return {
        path,
        search,
        hash,
        uriWithoutHash
    };
}

