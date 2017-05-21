import {expect} from '../utils/expect';
import {createRoute} from '../../lib/route';
import {createVirtualRoute} from '../../lib/virtualRoute';


describe('virtual route', () => {

    it('creator should create proper virtual route object', () => {
        let vroute = createVirtualRoute();
        expect(vroute.href).to.be.not.undefined;
        expect(vroute.mapToRoute).to.be.not.undefined;
    });

    it('calling href on unmapped route should throw ex', () => {
        let vroute = createVirtualRoute();
        expect(() => vroute.href()).to.throw(/Virtual route not mapped/);
    });

    it('calling href on mapped route should return proper href', () => {
        let vroute = createVirtualRoute();
        let route = createRoute('name', '/a');
        vroute.mapToRoute(route);
        expect(vroute.href()).eq('/a');
    });
});
