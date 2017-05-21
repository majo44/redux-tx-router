import {expect} from '../utils/expect';
import {routingReducer} from '../../lib/reducer';
import {endNavigationAction, failedNavigationAction, redirectionAction, startNavigationAction} from '../../lib/actions';


describe('reducer', () => {
    it('for start navigation action should set nextRoute', () => {
        let route = {
            name: 'a',
            path: '/a',
            url: '/a'
        };
        let state = routingReducer(null, startNavigationAction('url', route));
        expect(state.nextRoute).eql(route);
    });

    it('for end navigation action should set currentRoute based on nextRoute', () => {
        let route = {
            name: 'a',
            path: '/a',
            url: '/a'
        };
        let state = routingReducer({
            nextRoute: route
        }, endNavigationAction('/a'));
        expect(state.nextRoute).to.be.undefined;
        expect(state.currentRoute).eql(route);
    });

    it('for failed navigation action should preserve currentRoute', () => {
        let nextRoute = {
            name: 'a',
            path: '/a',
            url: '/a'
        };
        let currentRoute = {
            name: 'b',
            path: '/b',
            url: '/b'
        };
        let state = routingReducer({
            currentRoute: currentRoute,
            nextRoute: nextRoute
        }, failedNavigationAction('url'));
        expect(state.nextRoute).to.be.undefined;
        expect(state.currentRoute).eql(currentRoute);
    });

    it('for redirection action should preserve currentRoute', () => {
        let nextRoute = {
            name: 'a',
            path: '/a',
            url: '/a'
        };
        let redirectionRoute = {
            name: 'b',
            path: '/b',
            url: '/b'
        };
        let state = routingReducer({
            nextRoute: nextRoute
        }, redirectionAction('url', redirectionRoute));
        expect(state.nextRoute).eql(redirectionRoute);
    });

    it('for any other action should return state', () => {
        let preState: any = 'STATE';
        let state = routingReducer(preState, {type: 'any'} as any);
        expect(state).eq(preState);
    });

    it('for any other action should return state', () => {
        let preState;
        let state = routingReducer(preState, {type: 'any'} as any);
        expect(state).to.not.be.undefined;
    });
});
