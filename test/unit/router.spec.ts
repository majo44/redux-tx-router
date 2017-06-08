import {expect} from '../utils/expect';
import * as sinon from 'sinon';
import {createNavigation, createRouter, findRoute, parseUrl} from '../../lib/router';
import {createRoute} from '../../lib/route';
import {Dispatch} from 'redux';
import {FAILED_NAVIGATION_ACTION_TYPE, navigateAction} from '../../lib/actions';
import {semaphore} from '../utils/promise';


describe('router', () => {

    it('createRouter should create proper object', () => {
        let router = createRouter([], '');
        expect(typeof router.createReducer).eq('function');
        expect(typeof router.createMiddleware).eq('function');
        expect(typeof router.createReducer()).eq('function');
        expect(typeof router.createMiddleware()).eq('function');
    });

    it('parseUrl should properly parse url', () => {
        let parsed = parseUrl('/a');
        expect(parsed).eql({ path: '/a',
            search: undefined,
            hash: undefined,
            uriWithoutHash: '/a' });
        parsed = parseUrl('/a?s=1');
        expect(parsed).eql({ path: '/a',
            search: 's=1',
            hash: undefined,
            uriWithoutHash: '/a?s=1' });
        parsed = parseUrl('/a?s=1#a');
        expect(parsed).eql({ path: '/a', search: 's=1', hash: 'a', uriWithoutHash: '/a?s=1' });
    });

    describe('find roue', () => {

        it('find route should properly find route', () => {
            let route1 = createRoute('a', '/a');
            let route2 = createRoute('b', '/b');

            let {route, state} = findRoute('/a', [route1, route2], '/b');

            expect(route).eq(route1);
            expect(state).eql({
                name: 'a',
                url: '/a',
                path: '/a',
                search: undefined,
                hash: undefined,
                params: {}
            });
        });

        it('should return otherwise if url will not match anything', () => {
            let route1 = createRoute('a', '/a');
            let route2 = createRoute('b', '/b');

            let {route, state} = findRoute('/c', [route1, route2], '/b');

            expect(route).eq(route2);
            expect(state).eql({
                name: 'b',
                url: '/b',
                path: '/b',
                search: undefined,
                hash: undefined,
                params: {}
            });
        });

        it('should throw exception if otherwise not match any route', () => {
            let route1 = createRoute('a', '/a');
            let route2 = createRoute('b', '/b');
            expect(() => findRoute('/d', [route1, route2], '/c')).to.throw(/Otherwise url not match any route/);
        });
    });

    describe('navigate', () => {
        let sem1: any;
        let regularRoute = createRoute('a', '/a');
        let otherwiseRoute = createRoute('b', '/b');
        let redirectRoute = createRoute('c', '/c',
            async (args: any, dispatch: Dispatch<any>, getState: () => any) => {
                await dispatch(navigateAction('/b'));
            });
        let redirectErrorRoute = createRoute('f', '/f',
            async (args: any, dispatch: Dispatch<any>, getState: () => any) => {
                await dispatch(navigateAction('/d'));
            });
        let errorRoute = createRoute('d', '/d',
            async (args: any, dispatch: Dispatch<any>, getState: () => any) => {
                throw 'Error';
            });
        let canceledRoute = createRoute('e', '/e',
            async (args: any, dispatch: Dispatch<any>, getState: () => any) => {
                await sem1;
            });

        let canceledWithErrorRoute = createRoute('g', '/g',
            async (args: any, dispatch: Dispatch<any>, getState: () => any) => {
                await sem1;
            });
        let dispatchSpy: any;
        let navigate: any;

        beforeEach(() => {
            sem1 = semaphore();
            dispatchSpy = sinon.spy((a: any) => {
                if (typeof a === 'function') {
                    return a(dispatchSpy, null, {navigate} );
                } else {
                    return a;
                }

            });
            navigate = createNavigation(
                [regularRoute, otherwiseRoute, errorRoute, redirectRoute, canceledRoute, redirectErrorRoute, canceledWithErrorRoute], '/b');
        });

        it('should dispatch start and end navigation action', async () => {
            await navigate('/a', dispatchSpy, null);
            expect(dispatchSpy.callCount).eq(4);
            expect(dispatchSpy.args[1][0]).eql({ type: 'StartNavigationAction',
                payload: {
                    url: '/a',
                    route: { name: 'a',
                        params: {},
                        url: '/a',
                        path: '/a',
                        search: undefined,
                        hash: undefined
                    }}});
            expect(dispatchSpy.args[2][0]).eql({
                type: 'EndNavigationAction',
                payload: {
                    url: '/a'
                }
            });
        });

        it('should support redirection', async () => {
            await navigate(redirectRoute.href(), dispatchSpy, null);

            expect(dispatchSpy.callCount).eq(9);
            expect(dispatchSpy.args[4][0]).eql({ type: 'RedirectionAction',
                payload: {
                    url: '/b',
                    route: { name: 'b',
                        params: {},
                        url: '/b',
                        path: '/b',
                        search: undefined,
                        hash: undefined}}});

            expect(dispatchSpy.args[5][0]).eql({
                type: 'EndRedirectionAction',
                payload: {
                    url: otherwiseRoute.href()
                }});
        });

        it('should support error handling', async () => {
            await expect(navigate(errorRoute.href(), dispatchSpy, null)).to.eventually.be.rejectedWith(/Error/);
            expect(dispatchSpy.args[2][0]).eql({
                type: FAILED_NAVIGATION_ACTION_TYPE,
                payload: {
                    url: errorRoute.href()
                }});
        });

        it('should support error from redirection', async () => {
            await expect(
                navigate(
                    redirectErrorRoute.href(), dispatchSpy, null)).to.eventually.be.rejectedWith(/Error/);
        });

        it('should support navigation cancellation', async () => {
            let nav1 = navigate(canceledRoute.href(), dispatchSpy, null);
            let nav2 = navigate(regularRoute.href(), dispatchSpy, null);
            sem1.continue();
            await Promise.all([nav1, nav1]);
        });

        it('should support navigation cancellation', async () => {
            let nav1 = navigate(canceledWithErrorRoute.href(), dispatchSpy, null);
            let nav2 = navigate(regularRoute.href(), dispatchSpy, null);
            sem1.continue();

            await Promise.all([nav1, nav1]);

            console.log(dispatchSpy.args);
        });

    });
});
