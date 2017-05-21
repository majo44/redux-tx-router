import {expect} from '../utils/expect';
import {Dispatch, MiddlewareAPI} from 'redux';
import * as sinon from 'sinon';
import {createRouterMiddleware} from '../../lib/middleware';


describe('middleeware', () => {

    let nextSpy: Dispatch<any>;
    let api: MiddlewareAPI<any>;
    let state: any;

    beforeEach(() => {
       nextSpy = sinon.spy();
       state = {
           $$transactions: {1: true}
       };
       api = {
            getState: () => {
                return state;
            },
            dispatch: (): any => {
                return;
            }
        };
    });

    it('for action which require router should call action with router', () => {
        let action: any = sinon.spy();
        action.$$requireRouter = true;
        let router: any = 'ROUTER';
        createRouterMiddleware(router)(api)(nextSpy)(action);
        expect(action).to.be.calledOnce;
        expect(action).to.be.calledWith(api.dispatch, api.getState, router);
    });

    it('for action without require router should call next', () => {
        let action: any = {type: 'any'};
        let router: any = 'ROUTER';
        createRouterMiddleware(router)(api)(nextSpy)(action);
        expect(nextSpy).to.be.calledOnce;
        expect(nextSpy).to.be.calledWith(action);
    });

});
