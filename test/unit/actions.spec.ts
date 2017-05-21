import {expect} from '../utils/expect';
import {
    CANCELED_NAVIGATION_ACTION_TYPE,
    canceledNavigationAction,
    END_NAVIGATION_ACTION_TYPE, END_REDIRECTION_ACTION_TYPE,
    endNavigationAction, endRedirectionAction, FAILED_NAVIGATION_ACTION_TYPE, failedNavigationAction,
    navigateAction, REDIRECTION_ACTION_TYPE, redirectionAction, START_NAVIGATION_ACTION_TYPE,
    startNavigationAction
} from '../../lib/actions';
import * as sinon from 'sinon';


describe('action factory', () => {

    describe('of navigateAction', () => {
        it('should create thunk action and mark it as $$requireRouter', () => {
            let x: any = navigateAction('/a');
            expect(typeof x).eq('function');
            expect(x.$$requireRouter).eq(true);
        });
        it('should create thunk action which will throw error if outer will be not provided', async () => {
            await expect(navigateAction('/a')(null, null, null)).to.eventually.be.rejectedWith(/No router provided/);
        });
        it('should create thunk action which will call navigate on router', async () => {
            let router = {
                navigate: sinon.spy()
            };
            let dispatch: any = 'DISP';
            let getState: any = 'GETSTATE';
            await navigateAction('/a')(dispatch, getState, router);
            expect(router.navigate).to.be.calledOnce;
            expect(router.navigate).to.be.calledWith('/a', dispatch, getState);
        });
    });

    it('of startNavigationAction should return proper action', () => {
        let route: any = 'ROUTE';
        expect(startNavigationAction('url', route)).eql({
            type: START_NAVIGATION_ACTION_TYPE,
            payload: {
                route,
                url: 'url'
            }
        });
    });

    it('of redirectionAction should return proper action', () => {
        let route: any = 'ROUTE';
        expect(redirectionAction('url', route)).eql({
            type: REDIRECTION_ACTION_TYPE,
            payload: {
                route,
                url: 'url'
            }
        });
    });

    it('of endNavigationAction should return proper action', () => {
        expect(endNavigationAction('url')).eql({
            type: END_NAVIGATION_ACTION_TYPE,
            payload: {url: 'url'}
        });
    });

    it('of endRedirectionAction should return proper action', () => {
        expect(endRedirectionAction('url')).eql({
            type: END_REDIRECTION_ACTION_TYPE,
            payload: {url: 'url'}
        });
    });

    it('of failedNavigationAction should return proper action', () => {
        expect(failedNavigationAction('url')).eql({
            type: FAILED_NAVIGATION_ACTION_TYPE,
            payload: {url: 'url'}
        });
    });

    it('of canceledNavigationAction should return proper action', () => {
        expect(canceledNavigationAction('url')).eql({
            type: CANCELED_NAVIGATION_ACTION_TYPE,
            payload: {url: 'url'}
        });
    });

});
