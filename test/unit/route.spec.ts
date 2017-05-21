import {expect} from '../utils/expect';
import * as sinon from 'sinon';
import {createRoute, reduceRoute} from '../../lib/route';


describe('route', () => {

    it('creator should create proper route object', () => {
        let before: any = sinon.spy();
        let route = createRoute('a', '/a', before);
        expect(route.name).eq('a');
        expect(route.href()).eq('/a');
        expect(route.match('/a')).to.be.not.undefined;
        route.before('a' as any, 'b' as any, 'c' as any);
        expect(before).to.be.calledOnce;
        expect(before).to.be.calledWith('a', 'b', 'c');
    });

    it('reducer should create proper route object', () => {
        let route = createRoute('a', '/a');
        let reducedRoute = reduceRoute(route, (state: any) => state.sub);
        expect(reducedRoute.name).eq('a');
        expect(reducedRoute.href()).eq('/a');
        expect(reducedRoute.match('/a')).to.be.not.undefined;
    });

    it('reducer should create proper route object with proper state reducer', () => {
        let before: any = sinon.spy((a: any, b: any, c: any) => {
            expect(c()).eq('c');
        });
        let route = createRoute('a', '/a', before);
        let reducedRoute = reduceRoute(route, (state: any) => state.sub);
        reducedRoute.before('a' as any, 'b' as any, () => { return {sub: 'c'}; });
        expect(before).to.be.calledOnce;
    });



});
