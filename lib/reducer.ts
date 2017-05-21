import {RoutingState} from './state';
import {
    END_NAVIGATION_ACTION_TYPE, FAILED_NAVIGATION_ACTION_TYPE, REDIRECTION_ACTION_TYPE, RouterActions,
    START_NAVIGATION_ACTION_TYPE
} from './actions';

export function routingReducer(state: RoutingState = {}, action: RouterActions): RoutingState {
    switch (action.type) {
        case START_NAVIGATION_ACTION_TYPE:
        case REDIRECTION_ACTION_TYPE: {
            return Object.assign({}, state, {
                nextRoute: action.payload.route
            });
        }
        case FAILED_NAVIGATION_ACTION_TYPE: {
            let newState = Object.assign({}, state);
            delete newState.nextRoute;
            return newState;
        }
        case END_NAVIGATION_ACTION_TYPE: {
            return {
                currentRoute: state.nextRoute
            };
        }
        default: {
            return state;
        }
    }
}
