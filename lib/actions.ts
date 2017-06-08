import {Action, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {InternalRouter} from './router';
import {RouteState} from './state';
export type RequireRouterThunkAction<S> = ThunkAction<Promise<boolean>, S, any> & {$$requireRouter?: boolean};

export function navigateAction<S>(url: string): ThunkAction<Promise<boolean>, S, any> {
    let navigateAction: RequireRouterThunkAction<S> =
        async function(dispatch: Dispatch<S>, getState: () => S, router: InternalRouter<S>): Promise<boolean> {
            if (!router) {
                throw 'No router provided to navigation action. You probably forgot to add router middleware to storage.';
            }
            return router.navigate(url, dispatch, getState);
        };
    navigateAction.$$requireRouter = true;
    return navigateAction;
}

export const START_NAVIGATION_ACTION_TYPE = 'StartNavigationAction';
export interface StartNavigationAction extends Action {
    type: typeof START_NAVIGATION_ACTION_TYPE;
    payload: {
        url: string,
        route: RouteState
    };
}
export function startNavigationAction(url: string, route: RouteState): StartNavigationAction {
    return {
        type: START_NAVIGATION_ACTION_TYPE,
        payload: {
            url,
            route
        }
    };
}

export const REDIRECTION_ACTION_TYPE = 'RedirectionAction';
export interface RedirectionAction extends Action {
    type: typeof REDIRECTION_ACTION_TYPE;
    payload: {
        route: RouteState
        url: string
    };
}
export function redirectionAction(url: string, route: RouteState): RedirectionAction {
    return {
        type: REDIRECTION_ACTION_TYPE,
        payload: {
            url,
            route
        }
    };
}
export const END_REDIRECTION_ACTION_TYPE = 'EndRedirectionAction';
export interface EndRedirectionAction extends Action {
    type: typeof END_REDIRECTION_ACTION_TYPE;
    payload: {
        url: string
    };
}
export function endRedirectionAction(url: string): EndRedirectionAction {
    return {
        type: END_REDIRECTION_ACTION_TYPE,
        payload: {
            url
        }
    };
}

export const CANCELED_NAVIGATION_ACTION_TYPE = 'CanceledNavigationAction';
export interface CanceledNavigationAction extends Action {
    type: typeof CANCELED_NAVIGATION_ACTION_TYPE;
    payload: {
        url: string
    };
}
export function canceledNavigationAction(url: string): CanceledNavigationAction {
    return {
        type: CANCELED_NAVIGATION_ACTION_TYPE,
        payload: {
            url
        }
    };
}
export const END_NAVIGATION_ACTION_TYPE = 'EndNavigationAction';
export interface EndNavigationAction extends Action {
    type: typeof END_NAVIGATION_ACTION_TYPE;
    payload: {
        url: string
    };
}
export function endNavigationAction(url: string): EndNavigationAction {
    return {
        type: END_NAVIGATION_ACTION_TYPE,
        payload: {
            url
        }
    };
}

export const FAILED_NAVIGATION_ACTION_TYPE = 'FailedNavigationAction';
export interface FailedNavigationAction extends Action {
    type: typeof FAILED_NAVIGATION_ACTION_TYPE;
    payload: {
        url: string
    };
}
export function failedNavigationAction(url: string): FailedNavigationAction {
    return {
        type: FAILED_NAVIGATION_ACTION_TYPE,
        payload: {
            url
        }
    };
}

export type RouterActions =
    StartNavigationAction | EndNavigationAction | RedirectionAction | FailedNavigationAction | CanceledNavigationAction;




